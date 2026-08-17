const { Order, OrderItem, Product, User, Pincode, Notification } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { orderConfirmationEmail, orderStatusEmail, adminNewOrderEmail } = require('../utils/orderEmailTemplates');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const { emitToUser } = require('../socket/socketManager');
const { sendWebPush } = require('../utils/webPush');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (guest or logged-in)
const createOrder = async (req, res) => {
  const {
    customer_name,
    customer_email,
    customer_address,
    customer_phone,
    alt_phone,
    district,
    city,
    landmark,
    pincode,
    country,
    order_notes,
    location_lat,
    location_lng,
    couponCode,
    orderItems,
    total_amount,
    payment_method,
    payment_receipt,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  let userId = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (error) {
      // Guest checkout — token invalid or absent, proceed as guest
    }
  }

  try {
    // ── SERVER-SIDE PRICE RECALCULATION ─────────────────────────────────────
    // NEVER trust client-sent prices. Fetch every product price from the DB.
    const productIds = orderItems.map((i) => i.product_id);
    const products = await Product.findAll({ where: { id: productIds } });
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    const { ExtraCharge, Setting, Coupon } = require('../models');

    // Fetch active ExtraCharges & Settings
    const activeExtraCharges = await ExtraCharge.findAll({ where: { isActive: true } });
    const settingRec = await Setting.findOne({ where: { key: 'SHIPPING_CHARGE' } });
    const globalShippingCharge = settingRec ? parseFloat(settingRec.value) : 30;

    const minOrderRec = await Setting.findOne({ where: { key: 'FREE_SHIPPING_MIN_ORDER_VALUE' } });
    const freeShippingMinOrderValue = minOrderRec ? parseFloat(minOrderRec.value) : 200;

    let serverSubtotal = 0;
    let totalSpecificShipping = 0;
    let hasGlobalShippingItems = false;
    let serverExtraChargesTotal = 0;

    // Validate all products exist and calculate raw totals
    for (const item of orderItems) {
      if (!productMap[item.product_id]) {
        return res.status(400).json({ message: `Product not found: ${item.product_id}` });
      }
      if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
        return res.status(400).json({ message: 'Invalid item quantity' });
      }

      const product = productMap[item.product_id];
      const qty = Number(item.quantity);

      serverSubtotal += parseFloat(product.price) * qty;

      if (product.shipping_charge !== null && product.shipping_charge !== undefined && String(product.shipping_charge).trim() !== "") {
        totalSpecificShipping += Number(product.shipping_charge) * qty;
      } else {
        hasGlobalShippingItems = true;
      }

      let charges = product.extra_charges;
      if (typeof charges === 'string') {
        try { charges = JSON.parse(charges); } catch (e) { charges = []; }
      }
      if (charges && Array.isArray(charges)) {
        charges.forEach(chargeId => {
          const charge = activeExtraCharges.find(c => c.id === chargeId);
          if (charge) {
            serverExtraChargesTotal += Number(charge.price) * qty;
          }
        });
      }
    }

    let serverShipping = totalSpecificShipping;
    if (hasGlobalShippingItems) {
      if (serverSubtotal < freeShippingMinOrderValue) {
        serverShipping += globalShippingCharge;
      }
    }

    // ── SERVER-SIDE COUPON VALIDATION ────────────────────────────────────────
    let serverDiscount = 0;
    let validatedCouponCode = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ where: { code: couponCode.toUpperCase() } });

      if (!coupon || !coupon.isActive) {
        return res.status(400).json({ message: 'Invalid or inactive coupon code' });
      }
      if (new Date() > new Date(coupon.expiryDate)) {
        return res.status(400).json({ message: 'Coupon has expired' });
      }
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: 'Coupon usage limit reached' });
      }
      if (parseFloat(coupon.minCartValue) > serverSubtotal) {
        return res.status(400).json({ message: `Minimum cart value for this coupon is ₹${coupon.minCartValue}` });
      }

      if (coupon.discountType === 'PERCENTAGE') {
        serverDiscount = (serverSubtotal * parseFloat(coupon.discountValue)) / 100;
      } else {
        serverDiscount = parseFloat(coupon.discountValue);
      }
      serverDiscount = Math.min(serverDiscount, serverSubtotal);
      validatedCouponCode = coupon.code;
    }

    const serverTotal = Math.max(0, serverSubtotal - serverDiscount) + serverShipping + serverExtraChargesTotal;

    // Reject if client-sent total differs by more than ₹1 (floating point tolerance)
    if (Math.abs(parseFloat(total_amount) - serverTotal) > 1) {
      return res.status(400).json({
        message: 'Order total mismatch. Please refresh your cart and try again.',
      });
    }

    // ── DELIVERY DATE ESTIMATE ────────────────────────────────────────────────
    let estimatedDays = 5;
    try {
      if (pincode) {
        const pinRecord = await Pincode.findOne({ where: { pincode: pincode.toString() } });
        if (pinRecord && pinRecord.estimated_days) estimatedDays = pinRecord.estimated_days;
      }
    } catch (err) {
      // Non-fatal — use default
    }
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + estimatedDays);

    const existingUser = await User.findOne({ where: { email: customer_email } });

    const order = await Order.create({
      userId,
      customer_name,
      customer_email,
      customer_address,
      customer_phone,
      alt_phone,
      district,
      city,
      landmark,
      pincode,
      country,
      order_notes,
      location_lat,
      location_lng,
      couponCode: validatedCouponCode,
      discountAmount: serverDiscount,   // Server-calculated
      total_amount: serverTotal,         // Server-calculated
      payment_method: payment_method || 'COD',
      payment_receipt: payment_receipt || null,
      is_registered_user: !!existingUser,
      estimatedDeliveryDate,
    });

    // Auto-save phone number to user profile if it's missing
    if (existingUser && !existingUser.phone && customer_phone) {
      try {
        existingUser.phone = customer_phone;
        await existingUser.save();
      } catch (err) {
        // Non-fatal
      }
    }

    // Use DB-fetched prices for OrderItems — never trust client item prices
    const items = orderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: Number(item.quantity),
      price: parseFloat(productMap[item.product_id].price), // DB price
    }));

    await OrderItem.bulkCreate(items);

    // Increment coupon usedCount if coupon was applied
    if (couponCode) {
      const { Coupon } = require('../models');
      const couponToUpdate = await Coupon.findOne({ where: { code: couponCode.toUpperCase() } });
      if (couponToUpdate) {
        couponToUpdate.usedCount = (couponToUpdate.usedCount || 0) + 1;
        if (couponToUpdate.usageLimit && couponToUpdate.usedCount >= couponToUpdate.usageLimit) {
          couponToUpdate.isActive = false;
        }
        await couponToUpdate.save();
      }
    }

    // Send order confirmation email with optional PDF attachment (fire-and-forget so API responds fast)
    (async () => {
      try {
        const fullOrder = await Order.findByPk(order.id, {
          include: [{ model: OrderItem, include: [Product] }],
        });
        const emailData = orderConfirmationEmail(fullOrder, fullOrder.OrderItems || []);

        // Try to generate PDF, but don't fail the email if it doesn't work
        let emailOptions = {
          email: order.customer_email,
          subject: emailData.subject,
          message: emailData.text,
          html: emailData.html,
        };

        // Skip PDF generation on Render because Puppeteer crashes the server (OOM/No Chrome)
        if (process.env.RENDER) {
          console.log('Skipping PDF generation on Render to prevent OOM crashes.');
        } else {
          try {
            const pdfBuffer = await generateInvoicePDF(fullOrder, fullOrder.OrderItems || []);
            emailOptions.attachments = [{
              filename: `Invoice_W!FOMART${String(order.id).padStart(6, '0')}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }];
          } catch (pdfErr) {
            console.warn('PDF generation skipped:', pdfErr.message);
          }
        }

        await sendEmail(emailOptions);
        console.log(`📧 Order confirmation email sent for W!FOMART${String(order.id).padStart(6, '0')}`);

        // --- ADMIN EMAIL NOTIFICATION ---
        try {
          const adminEmailData = adminNewOrderEmail(fullOrder, fullOrder.OrderItems || []);
          await sendEmail({
            email: process.env.EMAIL_USER, // Admin's own email address
            subject: adminEmailData.subject,
            text: adminEmailData.text,
            html: adminEmailData.html
          });
          console.log(`📧 Admin order notification sent.`);
        } catch (adminErr) {
          console.error('Failed to send admin notification:', adminErr.message);
        }

        // --- GOOGLE SHEETS WEBHOOK ---
        if (process.env.GOOGLE_SHEET_WEBHOOK_URL) {
          try {
            const sheetData = {
              orderId: `W!FOMART${String(order.id).padStart(6, '0')}`,
              date: new Date(order.createdAt).toLocaleString(),
              customerName: order.customer_name,
              customerEmail: order.customer_email,
              phone: order.customer_phone,
              altPhone: order.alt_phone || '',
              address: `${order.customer_address}, ${order.city}, ${order.district} - ${order.pincode}, ${order.country}`,
              totalAmount: order.total_amount,
              paymentMethod: order.payment_method,
              status: order.status || 'Pending Confirmation',
              notes: order.order_notes || ''
            };

            await fetch(process.env.GOOGLE_SHEET_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sheetData)
            });
            console.log(`📊 Order successfully synced to Google Sheets!`);
          } catch (sheetErr) {
            console.error('Failed to sync to Google Sheets:', sheetErr.message);
          }
        }

      } catch (emailErr) {
        console.error('Order confirmation email failed (order still placed):', emailErr.message);
      }
    })();

    // Create automated notification for logged-in user
    if (userId) {
      Notification.create({
        userId,
        title: '🎉 Order Placed Successfully!',
        message: `Awesome news! Your order #W!FOMART${String(order.id).padStart(6, '0')} has been placed successfully and is currently ${order.status}. 🛒✨`,
        type: 'order'
      }).then(notif => {
        emitToUser(userId, {
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          isRead: false,
          createdAt: notif.createdAt
        });
      }).catch(err => console.error('Failed to create order notification:', err));
    }

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public (in real app, Admin)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          include: [{
            model: Product,
            attributes: ['id', 'images', 'title']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Public (in real app, Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, estimated_delivery_time, confirmedAt, processingAt, shippedAt, deliveredAt, cancelledAt, updatedDeliveryDate } = req.body;
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If transitioning to Confirmed, reduce stock
    if (status === 'Confirmed' && order.status !== 'Confirmed') {
      for (const item of order.OrderItems) {
        const product = await Product.findByPk(item.product_id);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save();
        }
      }
    }

    // If transitioning from Confirmed to Cancelled, restore stock
    if (status === 'Cancelled' && order.status === 'Confirmed') {
      for (const item of order.OrderItems) {
        const product = await Product.findByPk(item.product_id);
        if (product) {
          product.stock = product.stock + item.quantity;
          await product.save();
        }
      }
    }

    const prevStatus = order.status;
    order.status = status;
    if (estimated_delivery_time !== undefined) {
      order.estimated_delivery_time = estimated_delivery_time;
    }

    // Set timeline dates automatically if transitioned
    if (status !== prevStatus) {
      const now = new Date();
      if (status === 'Confirmed') {
        if (!order.confirmedAt) order.confirmedAt = now;
      }
      if (status === 'Processing') {
        if (!order.confirmedAt) order.confirmedAt = now;
        if (!order.processingAt) order.processingAt = now;
      }
      if (status === 'Shipped') {
        if (!order.confirmedAt) order.confirmedAt = now;
        if (!order.processingAt) order.processingAt = now;
        if (!order.shippedAt) order.shippedAt = now;
      }
      if (status === 'Delivered') {
        if (!order.confirmedAt) order.confirmedAt = now;
        if (!order.processingAt) order.processingAt = now;
        if (!order.shippedAt) order.shippedAt = now;
        if (!order.deliveredAt) order.deliveredAt = now;
      }
      if (status === 'Cancelled' && !order.cancelledAt) order.cancelledAt = now;
    }

    // Allow manual overrides of dates if provided in request
    if (confirmedAt !== undefined) order.confirmedAt = confirmedAt ? new Date(confirmedAt) : null;
    if (processingAt !== undefined) order.processingAt = processingAt ? new Date(processingAt) : null;
    if (shippedAt !== undefined) order.shippedAt = shippedAt ? new Date(shippedAt) : null;
    if (deliveredAt !== undefined) order.deliveredAt = deliveredAt ? new Date(deliveredAt) : null;
    if (cancelledAt !== undefined) order.cancelledAt = cancelledAt ? new Date(cancelledAt) : null;
    if (updatedDeliveryDate !== undefined) order.updatedDeliveryDate = updatedDeliveryDate ? new Date(updatedDeliveryDate) : null;

    await order.save();

    // Send status update email if status changed (fire-and-forget so API is fast)
    if (status !== prevStatus) {
      (async () => {
        try {
          const fullOrder = await Order.findByPk(order.id, {
            include: [{ model: OrderItem, include: [Product] }],
          });

          const emailData = orderStatusEmail(fullOrder);

          let emailOptions = {
            email: order.customer_email,
            subject: emailData.subject,
            message: emailData.text,
            html: emailData.html,
          };

          // Skip PDF generation on Render because Puppeteer crashes the server (OOM/No Chrome)
          if (process.env.RENDER) {
            console.log('Skipping PDF generation on Render to prevent OOM crashes.');
          } else {
            try {
              const pdfBuffer = await generateInvoicePDF(fullOrder, fullOrder.OrderItems || []);
              emailOptions.attachments = [{
                filename: `Invoice_W!FOMART${String(order.id).padStart(6, '0')}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
              }];
            } catch (pdfErr) {
              console.warn('PDF generation skipped:', pdfErr.message);
            }
          }

          await sendEmail(emailOptions);
          console.log(`📧 Status email [${status}] sent for W!FOMART${String(order.id).padStart(6, '0')}`);
        } catch (emailErr) {
          console.error('Status update email failed:', emailErr.message);
        }
      })();

      // Create automated notification for logged-in user
      if (order.userId) {
        const statusDetails = {
          'Confirmed': { emoji: '✅', msg: 'Awesome! Your order is confirmed and we are getting it ready for you.' },
          'Processing': { emoji: '📦', msg: 'Your order is now being processed. We are packing it up carefully!' },
          'Shipped': { emoji: '🚚', msg: 'Good news! Your order is on the way. Keep an eye out for the delivery.' },
          'Delivered': { emoji: '🎉', msg: 'Yay! Your order has been delivered. We hope you love it!' },
          'Cancelled': { emoji: '❌', msg: 'Your order has been cancelled. If you have any questions, please contact support.' }
        };
        const s = statusDetails[status] || { emoji: '🔔', msg: `Your order is now ${status}.` };

        Notification.create({
          userId: order.userId,
          title: `${s.emoji} Order ${status}`,
          message: `${s.msg} (Order #W!FOMART${String(order.id).padStart(6, '0')})`,
          type: 'order'
        }).then(notif => {
          emitToUser(order.userId, {
            id: notif.id,
            title: notif.title,
            message: notif.message,
            type: notif.type,
            isRead: false,
            createdAt: notif.createdAt
          });

          // Send Web Push notification
          sendWebPush(order.userId, {
            title: notif.title,
            message: notif.message,
            url: `/order/${order.id}`
          });
        }).catch(err => console.error('Failed to create status notification:', err));
      }
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Track an order by ID
// @route   GET /api/orders/track/:id
// @access  Public
const trackOrder = async (req, res) => {
  try {
    let raw = req.params.id.trim();

    // Must start with W!FOMART or #W!FOMART (case-insensitive)
    if (!/^#?W!FOMART/i.test(raw)) {
      return res.status(400).json({ message: 'Invalid Order ID format. Please use the exact order ID provided in your email (e.g. W!FOMART000022)' });
    }

    // Strip leading # if present
    raw = raw.replace(/^#/, '');
    // Strip W!FOMART prefix (case-insensitive)
    raw = raw.replace(/^W!FOMART/i, '');

    // Parse the remaining digits as the order ID
    const orderId = parseInt(raw, 10);

    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid Order ID format. Please use the exact order ID provided in your email (e.g. W!FOMART000022)' });
    }

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['id', 'title', 'images', 'description', 'return_policy', 'replacement_policy'] }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: `Order not found. Please check your Order ID (e.g. W!FOMART${String(orderId).padStart(6, '0')})` });
    }

    // ── RETURN ONLY SAFE TRACKING FIELDS ────────────────────────────────────────
    // Never expose customer_email, customer_phone, customer_address etc.
    // Enumeration attack: attacker increments ID to harvest all customer PII.
    const safeResponse = {
      id: order.id,
      orderId: `W!FOMART${String(order.id).padStart(6, '0')}`,
      status: order.status,
      payment_method: order.payment_method,
      createdAt: order.createdAt,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      updatedDeliveryDate: order.updatedDeliveryDate,
      confirmedAt: order.confirmedAt,
      processingAt: order.processingAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      customer_name: order.customer_name,
      // Mask phone number
      customer_phone: order.customer_phone ? '*'.repeat(Math.max(0, String(order.customer_phone).length - 4)) + String(order.customer_phone).slice(-4) : null,
      total_amount: order.total_amount,
      discountAmount: order.discountAmount,
      couponCode: order.couponCode,
      // Masked delivery city only (no full address)
      city: order.city,
      pincode: order.pincode,
      OrderItems: order.OrderItems, // Safe because it only has product id, title, image, price, qty
    };

    res.json(safeResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update order details (Admin)
// @route   PUT /api/orders/:id
// @access  Public (in real app, Admin)
const updateOrderDetails = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const {
      customer_name,
      customer_email,
      customer_phone,
      alt_phone,
      customer_address,
      district,
      city,
      landmark,
      pincode,
      country
    } = req.body;

    order.customer_name = customer_name || order.customer_name;
    order.customer_email = customer_email || order.customer_email;
    order.customer_phone = customer_phone || order.customer_phone;
    order.alt_phone = alt_phone !== undefined ? alt_phone : order.alt_phone;
    order.customer_address = customer_address || order.customer_address;
    order.district = district || order.district;
    order.city = city || order.city;
    order.landmark = landmark !== undefined ? landmark : order.landmark;
    order.pincode = pincode || order.pincode;
    order.country = country || order.country;

    await order.save();
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Bulk delete orders
// @route   DELETE /api/orders/bulk
// @access  Public (in real app, Admin)
const bulkDeleteOrders = async (req, res) => {
  try {
    const { ids, orderIds } = req.body; // accept both 'ids' and 'orderIds' for compatibility
    const idsToDelete = ids || orderIds;
    if (!idsToDelete || !Array.isArray(idsToDelete) || idsToDelete.length === 0) {
      return res.status(400).json({ message: 'No orders provided for deletion' });
    }

    const orders = await Order.findAll({ where: { id: idsToDelete } });

    // Process cloudinary image deletion in parallel
    const cloudinaryDeletions = orders
      .filter(o => o.payment_receipt)
      .map(order => {
        try {
          const urlParts = order.payment_receipt.split('/');
          const filename = urlParts.pop();
          const folder = urlParts.pop();
          const publicId = `${folder}/${filename.split('.')[0]}`;
          return cloudinary.uploader.destroy(publicId).catch(e => console.warn(`Cloudinary delete warn for order ${order.id}:`, e.message));
        } catch (err) {
          console.error(`Failed to extract Cloudinary public_id for order ${order.id}:`, err.message);
          return Promise.resolve();
        }
      });
    await Promise.allSettled(cloudinaryDeletions);

    // Delete associated items and orders
    await OrderItem.destroy({ where: { order_id: idsToDelete } });
    const deletedCount = await Order.destroy({ where: { id: idsToDelete } });

    res.json({ message: `Successfully deleted ${deletedCount} order(s) and all associated data`, deletedCount });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ message: 'Server Error during bulk delete' });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Public (in real app, Admin)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // First delete associated OrderItems
    await OrderItem.destroy({ where: { order_id: order.id } }); // Fixed foreign key to order_id

    // Then delete the order
    await order.destroy();

    res.json({ message: 'Order completely deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Request a return for an order item (User)
// @route   POST /api/orders/:orderId/item/:itemId/return
const requestItemReturn = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { reason } = req.body;

    // ── OWNERSHIP CHECK ────────────────────────────────────────────────────
    // Verify the order belongs to the currently authenticated user
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to manage this order' });
    }

    const item = await OrderItem.findOne({
      where: { id: itemId, order_id: orderId },
      include: [Product]
    });

    if (!item) {
      return res.status(404).json({ message: 'Order item not found' });
    }

    if (!item.Product.return_policy && !item.Product.replacement_policy) {
      return res.status(400).json({ message: 'Item is not returnable or replaceable' });
    }

    item.return_status = 'Requested';
    item.return_reason = reason;

    // Handle image upload if a file was provided
    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'ecommerce/returns', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      try {
        const imageUrl = await uploadPromise;
        item.return_image = imageUrl;
      } catch (err) {
        return res.status(500).json({ message: 'Failed to upload return image' });
      }
    }

    await item.save();

    // Fetch all admins to notify them
    const adminUsers = await User.findAll({ where: { role: 'admin' } });
    const { getIO } = require('../socket/socketManager');
    const io = getIO();

    // Create Notification for Admins
    for (const admin of adminUsers) {
      const notif = await Notification.create({
        userId: admin.id,
        title: 'New Return/Replacement Request',
        message: `Customer ${order.customer_name} has requested a return/replacement for Order #W!FOMART${String(orderId).padStart(6, '0')}.`,
        type: 'Order',
        isRead: false
      });
      if (io) {
        io.to(`user_${admin.id}`).emit('notification', {
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          url: `/admin/returns`,
          playSound: true
        });
      }
    }

    // Optionally generate a support ticket automatically for the admin
    const { SupportTicket } = require('../models');
    if (SupportTicket) {
      await SupportTicket.create({
        name: order.customer_name,
        email: order.customer_email,
        subject: `Return Request for ${item.Product.title || 'Item'} (Order #W!FOMART${String(orderId).padStart(6, '0')})`,
        message: `Reason: ${reason}${item.return_image ? `\n\nReturn Image: ${item.return_image}` : ''}`,
        status: 'Open',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    res.json({ message: 'Return request submitted successfully', item });
  } catch (error) {
    console.error('Error requesting return:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update return status of an order item (Admin)
// @route   PUT /api/orders/admin/:orderId/item/:itemId/return-status
const updateItemReturnStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body; // 'Approved', 'Rejected', 'Returned'

    const item = await OrderItem.findOne({
      where: { id: itemId, order_id: orderId }
    });

    if (!item) {
      return res.status(404).json({ message: 'Order item not found' });
    }

    item.return_status = status;
    await item.save();

    // Notify the user about their return status
    const order = await Order.findByPk(orderId);
    if (order) {
      const notif = await Notification.create({
        userId: order.userId,
        title: `Return Request ${status}`,
        message: `Your return/replacement request for an item in Order #W!FOMART${String(order.id).padStart(6, '0')} has been marked as ${status}.`,
        type: 'Order',
        isRead: false
      });

      const { getIO } = require('../socket/socketManager');
      const io = getIO();
      if (io && order.userId) {
        io.to(`user_${order.userId}`).emit('notification', {
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          url: `/order/${order.id}`,
          playSound: true
        });
      }
    }

    res.json({ message: 'Return status updated', item });
  } catch (error) {
    console.error('Error updating return status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get order by ID (for logged in user)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['id', 'title', 'images', 'description', 'return_policy', 'replacement_policy'] }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check ownership
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const cancelOrderUser = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Check ownership
    if (order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (order.status === 'Delivered' || order.status === 'Cancelled' || order.status === 'Shipped') {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'Cancelled';
    order.cancelledAt = new Date();
    await order.save();

    // Fetch admins for notification and email
    const adminUsers = await User.findAll({ where: { role: 'admin' } });

    // Create Notification for the user who cancelled
    try {
      const userNotif = await Notification.create({
        userId: req.user.id,
        title: '❌ Order Cancelled',
        message: `Your order ${order.orderId || ('#W!FOMART' + order.id.toString().padStart(6, '0'))} has been successfully cancelled.`,
        type: 'order',
        link: `/order/${order.id}`,
        isRead: false
      });
      emitToUser(req.user.id, {
        id: userNotif.id,
        title: userNotif.title,
        message: userNotif.message,
        type: userNotif.type,
        isRead: false,
        createdAt: userNotif.createdAt
      });
    } catch (err) {
      console.error('Failed to create notification for user:', err);
    }

    // Create Notification for admins and emit real-time event
    for (const admin of adminUsers) {
      try {
        const notif = await Notification.create({
          userId: admin.id,
          title: 'Order Cancelled by User',
          message: `User ${req.user.name || req.user.email} cancelled order ${order.orderId || ('#W!FOMART' + order.id.toString().padStart(6, '0'))}`,
          type: 'order',
          link: '/admin/orders',
          isRead: false
        });
        emitToUser(admin.id, {
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          isRead: false,
          createdAt: notif.createdAt
        });
      } catch (err) {
        console.error('Failed to create notification for admin:', err);
      }
    }

    // Send email to admins
    try {
      const adminEmails = adminUsers.map(u => u.email).filter(Boolean);
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e11d48;">Order Cancelled</h2>
          <p>Order <strong>${order.orderId || ('#W!FOMART' + order.id.toString().padStart(6, '0'))}</strong> has been cancelled by the user.</p>
          <p><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</p>
          <p><strong>Total Amount:</strong> ₹${order.total_amount}</p>
        </div>
      `;
      if (adminEmails.length > 0) {
        await sendEmail({
          email: adminEmails.join(','),
          subject: 'Order Cancelled - Wifo Mart',
          html: emailContent,
        });
      }
    } catch (e) {
      console.error('Failed to send admin cancellation email', e);
    }

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all return and replacement requests across all orders
// @route   GET /api/orders/admin/returns/all
// @access  Private/Admin
const getAllReturnRequests = async (req, res) => {
  try {
    const returnItems = await OrderItem.findAll({
      where: {
        return_status: { [Op.ne]: 'None' }
      },
      include: [
        {
          model: Order,
          attributes: ['id', 'order_id', 'customer_name', 'customer_email', 'customer_address', 'customer_phone', 'createdAt', 'status', 'total_amount']
        },
        {
          model: Product,
          attributes: ['id', 'title', 'price', 'images']
        }
      ],
      order: [['updatedAt', 'DESC']] // Show most recently updated requests first
    });

    res.json(returnItems);
  } catch (error) {
    console.error('Error fetching all return requests:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  trackOrder,
  updateOrderDetails,
  deleteOrder,
  bulkDeleteOrders,
  requestItemReturn,
  updateItemReturnStatus,
  getOrderById,
  cancelOrderUser,
  getAllReturnRequests
};

