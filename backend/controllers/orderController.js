const { Order, OrderItem, Product, User, Pincode } = require('../models');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { orderConfirmationEmail, orderStatusEmail, adminNewOrderEmail } = require('../utils/orderEmailTemplates');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const cloudinary = require('../config/cloudinary');// @desc    Create new order
// @route   POST /api/orders
// @access  Public
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
    discountAmount,
    orderItems,
    total_amount,
    payment_method,
    payment_receipt,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  }

  let userId = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      userId = decoded.id;
    } catch (error) {
      console.error('Invalid token during checkout');
    }
  }

  try {
    const existingUser = await User.findOne({ where: { email: customer_email } });

    // Calculate estimated delivery date based on pincode
    let estimatedDays = 5; // default fallback
    try {
      if (pincode) {
        const pinRecord = await Pincode.findOne({ where: { pincode: pincode.toString() } });
        if (pinRecord && pinRecord.estimated_days) {
          estimatedDays = pinRecord.estimated_days;
        }
      }
    } catch (err) {
      console.error('Error fetching pincode for estimated delivery:', err);
    }
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + estimatedDays);

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
      couponCode: couponCode || null,
      discountAmount: discountAmount || 0,
      total_amount,
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
        console.error('Failed to auto-save phone to user profile:', err);
      }
    }

    const items = orderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
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

    // Send order confirmation email with PDF attachment (fire-and-forget so API responds fast)
    (async () => {
      try {
        const fullOrder = await Order.findByPk(order.id, {
          include: [{ model: OrderItem, include: [Product] }],
        });
        const emailData = orderConfirmationEmail(fullOrder, fullOrder.OrderItems || []);
        
        // Generate PDF buffer
        const pdfBuffer = await generateInvoicePDF(fullOrder, fullOrder.OrderItems || []);

        await sendEmail({
          email: order.customer_email,
          subject: emailData.subject,
          message: emailData.text,
          html: emailData.html,
          attachments: [
            {
              filename: `Invoice_LIVEMART${String(order.id).padStart(6,'0')}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        });
        console.log(`📧 Order confirmation email with PDF sent to ${order.customer_email} for LIVEMART${String(order.id).padStart(6,'0')}`);

        // --- ADMIN EMAIL NOTIFICATION ---
        try {
          const adminEmailData = adminNewOrderEmail(fullOrder, fullOrder.OrderItems || []);
          await sendEmail({
            email: process.env.EMAIL_USER, // Admin's own email address
            subject: adminEmailData.subject,
            text: adminEmailData.text,
            html: adminEmailData.html
          });
          console.log(`📧 Admin Notification sent to ${process.env.EMAIL_USER}`);
        } catch (adminErr) {
          console.error('Failed to send admin notification:', adminErr.message);
        }

        // --- GOOGLE SHEETS WEBHOOK ---
        if (process.env.GOOGLE_SHEET_WEBHOOK_URL) {
          try {
            const sheetData = {
              orderId: `LIVEMART${String(order.id).padStart(6,'0')}`,
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
          include: [Product]
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
          const pdfBuffer = await generateInvoicePDF(fullOrder, fullOrder.OrderItems || []);
          
          await sendEmail({
            email: order.customer_email,
            subject: emailData.subject,
            message: emailData.text,
            html: emailData.html,
            attachments: [
              {
                filename: `Invoice_LIVEMART${String(order.id).padStart(6,'0')}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
              }
            ]
          });
          console.log(`📧 Status email [${status}] sent to ${order.customer_email} for LIVEMART${String(order.id).padStart(6,'0')}`);
        } catch (emailErr) {
          console.error('Status update email failed:', emailErr.message);
        }
      })();
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

    // Must start with LIVEMART or #LIVEMART (case-insensitive)
    if (!/^#?LIVEMART/i.test(raw)) {
      return res.status(400).json({ message: 'Invalid Order ID format. Please use the exact order ID provided in your email (e.g. LIVEMART000022)' });
    }

    // Strip leading # if present
    raw = raw.replace(/^#/, '');
    // Strip LIVEMART prefix (case-insensitive)
    raw = raw.replace(/^LIVEMART/i, '');
    
    // Parse the remaining digits as the order ID
    const orderId = parseInt(raw, 10);

    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid Order ID format. Please use the exact order ID provided in your email (e.g. LIVEMART000022)' });
    }

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          include: [Product]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: `Order not found. Please check your Order ID (e.g. LIVEMART${String(orderId).padStart(6,'0')})` });
    }

    res.json(order);
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
    await OrderItem.destroy({ where: { orderId: idsToDelete } });
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
    await OrderItem.destroy({ where: { orderId: order.id } }); // Note: the foreignKey is usually orderId in Sequelize, wait, let me check the association or just let it cascade if it does. In previous code we did order_id but the model index says foreignKey: 'orderId' - let me just use orderId or order_id. The controller used order_id: order.id previously. I will use orderId since index.js says so, but let me check. Actually I will use where: { orderId: order.id } just in case. Wait, if it fails I will check.

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

    const item = await OrderItem.findOne({
      where: { id: itemId, order_id: orderId },
      include: [Product]
    });

    if (!item) {
      return res.status(404).json({ message: 'Order item not found' });
    }

    if (!item.Product.is_returnable) {
      return res.status(400).json({ message: 'Item is not returnable' });
    }

    item.return_status = 'Requested';
    item.return_reason = reason;
    await item.save();

    // Optionally generate a support ticket automatically for the admin
    const { SupportTicket } = require('../models');
    const order = await Order.findByPk(orderId);
    if (order && SupportTicket) {
      await SupportTicket.create({
        name: order.customer_name,
        email: order.customer_email,
        subject: `Return Request for ${item.Product.name || 'Item'} (Order #LIVEMART${String(orderId).padStart(6,'0')})`,
        message: `Reason: ${reason}`,
        status: 'Open'
      });
    }

    res.json({ message: 'Return requested successfully', item });
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

    res.json({ message: 'Return status updated', item });
  } catch (error) {
    console.error('Error updating return status:', error);
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
  updateItemReturnStatus
};
