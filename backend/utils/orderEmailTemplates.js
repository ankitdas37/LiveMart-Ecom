/**
 * Email Templates for W!FO MART Order Notifications
 * Style: Cute Anime / Kawaii ✨
 */

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toFixed(2)}`;

const emailWrapper = (content, accentColor = '#f472b6') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background:linear-gradient(135deg,#fdf2f8,#eff6ff);font-family:'Nunito',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(244,114,182,0.15),0 2px 8px rgba(0,0,0,0.06);max-width:580px;border:2px solid ${accentColor}30;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${accentColor},#a78bfa);padding:28px 40px;text-align:center;position:relative;">
              <p style="margin:0 0 4px;font-size:26px;line-height:1;">✨🛍️✨</p>
              <h1 style="margin:4px 0;color:#fff;font-size:30px;font-weight:900;letter-spacing:-1px;text-shadow:0 2px 8px rgba(0,0,0,0.15);">W!FO <span style="color:#fef9c3;">MART</span></h1>
              <p style="margin:4px 0 0;color:#fff;font-size:12px;opacity:0.9;font-weight:700;letter-spacing:2px;">✦ YOUR HAPPY SHOPPING BUDDY ✦</p>
            </td>
          </tr>
          ${content}
          <!-- Footer -->
          <tr>
            <td style="background:linear-gradient(135deg,#fdf2f8,#eff6ff);padding:20px 40px;text-align:center;border-top:2px dashed ${accentColor}40;">
              <p style="margin:0;font-size:16px;">🌸 💜 🌸</p>
              <p style="margin:6px 0 0;color:#a78bfa;font-size:12px;font-weight:700;">© 2026 W!FOMART. A BASRIC Company. All rights reserved.</p>
              <p style="margin:4px 0 0;color:#c084fc;font-size:11px;">This is an automated email, please do not reply (≧◡≦)</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/**
 * Build items table HTML from OrderItems array
 */
const buildItemsTable = (orderItems) => {
  const rows = orderItems.map((item, idx) => {
    const name = item.Product ? item.Product.title : `Product #${item.product_id}`;
    const subtotal = parseFloat(item.price) * parseInt(item.quantity);
    const bg = idx % 2 === 0 ? '#fdf2f8' : '#eff6ff';
    return `
      <tr style="background:${bg};">
        <td style="padding:12px 16px;vertical-align:middle;">
          <p style="margin:0;color:#7c3aed;font-size:14px;font-weight:800;">${name}</p>
          <p style="margin:3px 0 0;color:#a78bfa;font-size:12px;">🛒 Qty: ${item.quantity} × ${formatCurrency(item.price)}</p>
        </td>
        <td style="padding:12px 16px;vertical-align:middle;text-align:right;white-space:nowrap;">
          <p style="margin:0;color:#ec4899;font-size:15px;font-weight:900;">${formatCurrency(subtotal)}</p>
        </td>
      </tr>`;
  }).join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:16px;overflow:hidden;margin-bottom:20px;border:2px solid #f9a8d4;">
      <thead>
        <tr style="background:linear-gradient(90deg,#f9a8d4,#c4b5fd);">
          <th style="padding:10px 16px;text-align:left;color:#7c3aed;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">🎁 Product</th>
          <th style="padding:10px 16px;text-align:right;color:#7c3aed;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">💰 Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
};

/**
 * ORDER CONFIRMATION EMAIL ✨
 */
const orderConfirmationEmail = (order, orderItems) => {
  const orderId = `W!FOMART${String(order.id).padStart(6, '0')}`;
  const payMethod = order.payment_method === 'COD' ? '💵 Cash on Delivery' : '💳 Online Payment';
  const itemsHtml = buildItemsTable(orderItems);

  const content = `
    <tr>
      <td style="padding:32px 40px;">
        <!-- Kawaii success banner -->
        <div style="text-align:center;margin-bottom:28px;">
          <div style="font-size:48px;line-height:1;margin-bottom:8px;">🎀</div>
          <h2 style="margin:0 0 8px;color:#7c3aed;font-size:24px;font-weight:900;">Yay! Order Received! (≧▽≦)</h2>
          <p style="margin:0;color:#a78bfa;font-size:14px;font-weight:600;">
            Thank you so much, <span style="color:#ec4899;font-weight:900;">${order.customer_name}</span>! Your goodies are coming~ ✨
          </p>
          <div style="background:#fef3c7;border:2px dashed #f59e0b;padding:12px;margin-top:16px;border-radius:12px;text-align:center;">
            <p style="margin:0;color:#d97706;font-size:14px;font-weight:800;">📞 Order Pending Confirmation</p>
            <p style="margin:4px 0 0;color:#b45309;font-size:13px;font-weight:600;">Our executive officer will call you shortly to confirm or cancel your order! ✨</p>
          </div>
        </div>

        <!-- Order ID card -->
        <div style="background:linear-gradient(135deg,#fdf2f8,#eff6ff);border:2px solid #f9a8d4;border-radius:20px;padding:20px;text-align:center;margin-bottom:24px;">
          <p style="margin:0;color:#a78bfa;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:800;">⭐ Your Order ID ⭐</p>
          <p style="margin:8px 0 4px;color:#7c3aed;font-size:32px;font-weight:900;letter-spacing:3px;">${orderId}</p>
          <p style="margin:0;color:#c084fc;font-size:12px;font-weight:600;">🗓️ Placed on ${formatDate(order.createdAt)}</p>
        </div>

        <!-- Items -->
        <p style="margin:0 0 10px;color:#7c3aed;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">🛍️ What You Ordered</p>
        ${itemsHtml}

        <!-- Totals -->
        <div style="background:linear-gradient(135deg,#fdf2f8,#eff6ff);border-radius:16px;padding:16px 20px;margin-bottom:24px;border:2px dashed #f9a8d4;">
          ${order.discountAmount && parseFloat(order.discountAmount) > 0 ? `
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="color:#a78bfa;font-size:13px;font-weight:700;">🎟️ Coupon (${order.couponCode || ''})</span>
            <span style="color:#10b981;font-size:13px;font-weight:800;">- ${formatCurrency(order.discountAmount)}</span>
          </div>` : ''}
          <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:2px dashed #f9a8d4;">
            <span style="color:#7c3aed;font-size:16px;font-weight:900;">💎 Total Amount</span>
            <span style="color:#ec4899;font-size:22px;font-weight:900;">${formatCurrency(order.total_amount)}</span>
          </div>
        </div>

        <!-- Details -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td style="padding-right:8px;vertical-align:top;width:50%;">
              <div style="background:#eff6ff;border:2px solid #c4b5fd;border-radius:16px;padding:16px;">
                <p style="margin:0 0 6px;color:#7c3aed;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">📍 Delivery To</p>
                <p style="margin:0;color:#6d28d9;font-size:13px;line-height:1.6;font-weight:600;">
                  ${order.customer_address}, ${order.city},<br/>${order.district} - ${order.pincode}<br/>${order.country}
                </p>
              </div>
            </td>
            <td style="padding-left:8px;vertical-align:top;width:50%;">
              <div style="background:#fdf2f8;border:2px solid #f9a8d4;border-radius:16px;padding:16px;margin-bottom:8px;">
                <p style="margin:0 0 6px;color:#ec4899;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">💳 Payment</p>
                <p style="margin:0;color:#be185d;font-size:13px;font-weight:700;">${payMethod}</p>
              </div>
              ${order.estimatedDeliveryDate ? `
              <div style="background:linear-gradient(135deg,#fdf2f8,#eff6ff);border:2px solid #f9a8d4;border-radius:16px;padding:14px;">
                <p style="margin:0 0 4px;color:#7c3aed;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">🚀 Est. Delivery</p>
                <p style="margin:0;color:#ec4899;font-size:13px;font-weight:800;">${formatDate(order.estimatedDeliveryDate)}</p>
              </div>` : ''}
            </td>
          </tr>
        </table>

        <!-- CTA -->
        <div style="background:linear-gradient(135deg,#fdf4ff,#eff6ff);border-radius:16px;padding:16px;text-align:center;border:2px solid #e9d5ff;">
          <p style="margin:0;color:#7c3aed;font-size:13px;font-weight:700;">
            🔍 Track your order anytime with <strong style="color:#ec4899;">${orderId}</strong><br/>
            <span style="color:#a78bfa;font-size:12px;">on our website~ We'll keep you updated! 💌</span>
          </p>
        </div>
      </td>
    </tr>`;

  return {
    subject: `🎀 Order Confirmed ${orderId} – Thank you! | W!FOMART`,
    html: emailWrapper(content, '#f472b6'),
    text: `Your order ${orderId} has been placed! Total: ${formatCurrency(order.total_amount)}. Track it on our website.`,
  };
};

/**
 * STATUS UPDATE EMAIL ✨
 */
const orderStatusEmail = (order) => {
  const orderId = `W!FOMART${String(order.id).padStart(6, '0')}`;
  const status = order.status;

  const statusConfig = {
    'Confirmed': {
      emoji: '🎉', kaomoji: '(≧▽≦)', color: '#10b981', accent: '#34d399',
      bg: '#ecfdf5', title: 'Order Confirmed, Yay!',
      desc: "Woohoo~! Your order is confirmed and we'll start working on it soon! 🌟",
    },
    'Processing': {
      emoji: '📦', kaomoji: '(｀・ω・´)', color: '#3b82f6', accent: '#60a5fa',
      bg: '#eff6ff', title: "We're Packing Your Order!",
      desc: 'Our team is carefully packing your goodies right now! ✨ Almost there~',
    },
    'Shipped': {
      emoji: '🚀', kaomoji: '(っ˘ω˘ς)', color: '#8b5cf6', accent: '#a78bfa',
      bg: '#f5f3ff', title: 'Your Order is Flying to You!',
      desc: "Your package is on its way! Can't wait for it to reach you~ 🌈",
    },
    'Delivered': {
      emoji: '🎊', kaomoji: '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', color: '#ec4899', accent: '#f9a8d4',
      bg: '#fdf2f8', title: 'Delivered! Enjoy Your Goodies~',
      desc: "It's here!! Your order has been delivered! We hope you absolutely love it! 💝",
    },
    'Cancelled': {
      emoji: '😢', kaomoji: '(╥_╥)', color: '#ef4444', accent: '#fca5a5',
      bg: '#fff1f2', title: 'Order Cancelled',
      desc: "We're so sorry your order was cancelled. Please contact us if you need help! 🌸",
    },
    'Pickup': {
      emoji: '🛍️', kaomoji: '(ﾉ´ヮ`)ﾉ*: ･ﾟ', color: '#f59e0b', accent: '#fcd34d',
      bg: '#fffbeb', title: 'Ready for Pickup!',
      desc: "Your order is ready to be picked up! We can't wait to see you! 🌟",
    },
    'Replacement Successful': {
      emoji: '🔄', kaomoji: '(✧ω✧)', color: '#3b82f6', accent: '#93c5fd',
      bg: '#eff6ff', title: 'Replacement Successful!',
      desc: "Your replacement has been processed successfully. Enjoy! 🌸",
    },
    'Return Successful': {
      emoji: '💵', kaomoji: '(*^‿^*)', color: '#10b981', accent: '#6ee7b7',
      bg: '#ecfdf5', title: 'Return Successful!',
      desc: "Your return has been processed. The refund should reach you soon! 💖",
    },
    'Payment Successful': {
      emoji: '💳', kaomoji: '(☆ω☆)', color: '#8b5cf6', accent: '#c4b5fd',
      bg: '#f5f3ff', title: 'Payment Successful!',
      desc: "Your payment was successful. Thank you for your purchase! ✨",
    },
  };

  const cfg = statusConfig[status] || {
    emoji: '📋', kaomoji: '(・ω・)', color: '#7c3aed', accent: '#c4b5fd',
    bg: '#f5f3ff', title: `Status Updated: ${status}`,
    desc: "Your order status has been updated! Check below for details. ✨",
  };

  // Progress steps
  const steps = [
    { label: 'Confirmed', emoji: '✅' },
    { label: 'Processing', emoji: '📦' },
    { label: 'Shipped', emoji: '🚀' },
    { label: 'Delivered', emoji: '🎊' },
  ];
  const currentIdx = steps.findIndex(s => s.label === status);

  const timelineHtml = status !== 'Pending Confirmation' && status !== 'Cancelled' ? `
    <div style="background:${cfg.bg};border:2px solid ${cfg.accent};border-radius:16px;padding:16px 20px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          ${steps.map((step, i) => {
            const isDone = i < currentIdx;
            const isActive = i === currentIdx;
            const stepColor = isActive ? cfg.color : isDone ? '#10b981' : '#d1d5db';
            const textColor = isActive ? cfg.color : isDone ? '#10b981' : '#9ca3af';
            return `
              <td style="text-align:center;padding:0 2px;">
                <div style="font-size:${isActive ? '22px' : '16px'};line-height:1;margin-bottom:4px;">${isDone ? '✅' : isActive ? step.emoji : '⬜'}</div>
                <p style="margin:0;font-size:10px;color:${textColor};font-weight:${isActive ? '900' : '700'};line-height:1.3;">${step.label}</p>
              </td>`;
          }).join('')}
        </tr>
      </table>
    </div>` : '';

  const content = `
    <tr>
      <td style="padding:32px 40px;background:${cfg.bg}20;">
        <!-- Status badge -->
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:52px;line-height:1;margin-bottom:8px;">${cfg.emoji}</div>
          <h2 style="margin:0 0 6px;color:${cfg.color};font-size:22px;font-weight:900;">${cfg.title}</h2>
          <p style="margin:0 0 6px;color:#7c3aed;font-size:16px;font-weight:700;">${cfg.kaomoji}</p>
          <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;font-weight:600;">${cfg.desc}</p>
        </div>

        <!-- Order ID -->
        <div style="background:#fff;border:2px solid ${cfg.accent};border-radius:20px;padding:16px;text-align:center;margin-bottom:16px;">
          <p style="margin:0;color:#a78bfa;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;">⭐ Order ID ⭐</p>
          <p style="margin:8px 0 0;color:#7c3aed;font-size:26px;font-weight:900;letter-spacing:2px;">${orderId}</p>
        </div>

        <!-- Timeline -->
        ${timelineHtml}

        <!-- Info -->
        <div style="background:#fff;border:2px solid ${cfg.accent};border-radius:16px;padding:20px;margin-bottom:20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom:12px;border-bottom:1px dashed ${cfg.accent};">
                <p style="margin:0;color:#a78bfa;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">👤 Customer</p>
                <p style="margin:4px 0 0;color:#7c3aed;font-size:14px;font-weight:800;">${order.customer_name}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0 0;">
                <p style="margin:0;color:#a78bfa;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">💎 Total</p>
                <p style="margin:4px 0 0;color:#ec4899;font-size:18px;font-weight:900;">${formatCurrency(order.total_amount)}</p>
              </td>
            </tr>
            ${order.estimatedDeliveryDate && status !== 'Cancelled' && status !== 'Delivered' ? `
            <tr>
              <td style="padding-top:12px;border-top:1px dashed ${cfg.accent};">
                <p style="margin:0;color:#a78bfa;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">📅 Est. Delivery</p>
                <p style="margin:4px 0 0;color:#7c3aed;font-size:14px;font-weight:800;">${formatDate(order.estimatedDeliveryDate)}</p>
              </td>
            </tr>` : ''}
          </table>
        </div>

        <div style="background:linear-gradient(135deg,#fdf4ff,#eff6ff);border-radius:14px;padding:14px;text-align:center;border:2px dashed #c4b5fd;">
          <p style="margin:0;color:#7c3aed;font-size:13px;font-weight:700;">
            Track your order with <strong style="color:#ec4899;">${orderId}</strong> on our website~ 🌸
          </p>
        </div>
      </td>
    </tr>`;

  return {
    subject: `${cfg.emoji} Order ${status} – ${orderId} | W!FOMART`,
    html: emailWrapper(content, cfg.accent),
    text: `Your order ${orderId} status: ${status}. ${cfg.desc}`,
  };
};

/**
 * ADMIN NEW ORDER EMAIL
 * Clean, professional template for the admin
 */
const adminNewOrderEmail = (order, orderItems) => {
  const orderId = `W!FOMART${String(order.id).padStart(6, '0')}`;
  
  const itemsHtml = orderItems.map(item => {
    const name = item.Product ? item.Product.title : `Product #${item.product_id}`;
    const subtotal = parseFloat(item.price) * parseInt(item.quantity);
    return `
      <tr>
        <td style="padding:10px; border-bottom: 1px solid #eee;">
          <strong>${name}</strong><br/>
          <span style="color:#666; font-size:12px;">Qty: ${item.quantity} × ${formatCurrency(item.price)}</span>
        </td>
        <td style="padding:10px; border-bottom: 1px solid #eee; text-align:right;">
          <strong>${formatCurrency(subtotal)}</strong>
        </td>
      </tr>
    `;
  }).join('');

  const content = `
    <tr>
      <td style="padding: 30px;">
        <h2 style="color: #333; margin-top:0;">New Order Received: ${orderId}</h2>
        <p style="color: #555;">A new order has been placed on W!FOMART. Here are the details:</p>
        
        <table width="100%" cellpadding="5" cellspacing="0" style="margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 8px;">
          <tr>
            <td width="35%" style="color:#777; font-size:13px;"><strong>Date & Time:</strong></td>
            <td style="color:#333; font-size:14px;">${new Date(order.createdAt).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="color:#777; font-size:13px;"><strong>Customer Name:</strong></td>
            <td style="color:#333; font-size:14px;">${order.customer_name}</td>
          </tr>
          <tr>
            <td style="color:#777; font-size:13px;"><strong>Mobile Number:</strong></td>
            <td style="color:#333; font-size:14px;">${order.customer_phone}</td>
          </tr>
          ${order.alt_phone ? `
          <tr>
            <td style="color:#777; font-size:13px;"><strong>Alt Number:</strong></td>
            <td style="color:#333; font-size:14px;">${order.alt_phone}</td>
          </tr>` : ''}
          <tr>
            <td style="color:#777; font-size:13px;"><strong>Full Address:</strong></td>
            <td style="color:#333; font-size:14px;">
              ${order.customer_address}, ${order.landmark ? order.landmark + ', ' : ''}<br/>
              ${order.city}, ${order.district} - ${order.pincode}<br/>
              ${order.country}
              ${order.location_lat && order.location_lng ? `<br/><br/><a href="https://www.google.com/maps/search/?api=1&query=${order.location_lat},${order.location_lng}" target="_blank" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;padding:6px 12px;border-radius:4px;font-size:12px;font-weight:bold;">📍 View on Google Maps</a>` : ''}
            </td>
          </tr>
          <tr>
            <td style="color:#777; font-size:13px;"><strong>Status:</strong></td>
            <td style="color:#d97706; font-size:14px; font-weight:bold;">${order.status || 'Pending Confirmation'}</td>
          </tr>
        </table>

        <h3 style="color: #333; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 5px;">Ordered Products</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
          ${itemsHtml}
          <tr>
            <td style="padding:15px 10px; text-align:right;"><strong>Total Amount:</strong></td>
            <td style="padding:15px 10px; text-align:right; color:#10b981; font-size:18px;"><strong>${formatCurrency(order.total_amount)}</strong></td>
          </tr>
        </table>

        ${order.order_notes ? `
        <h3 style="color: #333; margin-bottom: 10px;">Order Notes</h3>
        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; color: #92400e;">
          ${order.order_notes}
        </div>
        ` : ''}
        
      </td>
    </tr>
  `;

  // Provide a clean email wrapper without the pink cute anime styles for the admin
  const cleanWrapper = (content) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  </head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
            <tr style="background:#1f2937;">
              <td style="padding:20px;text-align:center;color:#fff;">
                <h1 style="margin:0;font-size:24px;">W!FOMART Admin</h1>
              </td>
            </tr>
            ${content}
            <tr style="background:#f9fafb;border-top:1px solid #eee;">
              <td style="padding:15px;text-align:center;color:#6b7280;font-size:12px;">
                Automated System Notification &bull; W!FOMART E-Commerce
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;

  return {
    subject: `🚨 New Order Received: ${orderId} - ${formatCurrency(order.total_amount)}`,
    html: cleanWrapper(content),
    text: `New Order ${orderId}\nCustomer: ${order.customer_name}\nTotal: ${formatCurrency(order.total_amount)}\nStatus: Pending Confirmation`,
  };
};

module.exports = { orderConfirmationEmail, orderStatusEmail, adminNewOrderEmail };

