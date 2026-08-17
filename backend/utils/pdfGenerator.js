const puppeteer = require('puppeteer');

/**
 * Generate a beautiful PDF invoice using Puppeteer
 * @param {Object} order - The full order object
 * @param {Array} orderItems - Array of order items with Product included
 * @returns {Promise<Buffer>} - PDF Buffer
 */
const generateInvoicePDF = async (order, orderItems) => {
  const orderId = `W!FOMART${String(order.id).padStart(6, '0')}`;
  const invoiceNo = `BASRIC-${new Date().getFullYear()}-${orderId}`;
  
  const subtotal = orderItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
  const discount = Number(order.discountAmount) || 0;
  const total = Number(order.total_amount) || 0;
  
  const isCOD = order.payment_method === 'COD';
  const status = order.status || (isCOD ? 'Confirmed' : 'Pending Confirmation');
  const isConfirmed = ['Confirmed', 'Processing', 'Shipped', 'Delivered'].includes(status);
  const isCancelled = status === 'Cancelled';
  const statusColor = isCancelled ? '#dc2626' : isConfirmed ? '#16a34a' : '#d97706';
  const statusBg = isCancelled ? '#fef2f2' : isConfirmed ? '#f0fdf4' : '#fffbeb';
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const itemRows = orderItems.map((item, idx) => `
    <tr style="background:${idx % 2 === 0 ? '#fff' : '#f8fafc'}">
      <td style="padding:11px 10px;border-bottom:1px solid #e2e8f0;text-align:left;">
        <strong style="color:#1e293b; display: block;">${item.Product?.title || item.title || 'Product'}</strong>
      </td>
      <td style="padding:11px 10px;border-bottom:1px solid #e2e8f0;text-align:center;color:#64748b;">${item.quantity}</td>
      <td style="padding:11px 10px;border-bottom:1px solid #e2e8f0;text-align:right;color:#64748b;">&#8377;${Number(item.price).toFixed(2)}</td>
      <td style="padding:11px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;color:#1e293b;">&#8377;${(Number(item.quantity) * Number(item.price)).toFixed(2)}</td>
    </tr>
  `).join('');

  const charges = total - subtotal + discount;
  const statusText = isCOD ? 'Confirmed' : status;

  let receiptBase64 = '';
  if (order.payment_method === 'Online' && order.payment_receipt) {
    try {
      const response = await fetch(order.payment_receipt);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      receiptBase64 = `data:${contentType};base64,${buffer.toString('base64')}`;
    } catch (e) {
      console.error('Failed to fetch payment receipt for PDF:', e.message);
    }
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${invoiceNo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #1e293b; background: #fff; font-size: 13px; }
    .page { padding: 36px 44px; max-width: 860px; margin: 0 auto; }
    /* Header */
    .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 3px solid #FF8C00; margin-bottom: 24px; }
    .logo-area { display: flex; align-items: center; gap: 12px; }
    .logo-img { width: 52px; height: 52px; border-radius: 12px; object-fit: contain; }
    .brand-name { font-size: 30px; font-weight: 900; line-height: 1; }
    .brand-name .live { color: #1e293b; }
    .brand-name .mart { color: #FF8C00; }
    .brand-tagline { font-size: 9px; color: #94a3b8; letter-spacing: 2.5px; margin-top: 3px; text-transform: uppercase; }
    .BASRIC-meta { text-align: right; }
    .BASRIC-title { font-size: 26px; font-weight: 900; color: #FF8C00; letter-spacing: 1px; }
    .BASRIC-sub { font-size: 12px; color: #64748b; margin-top: 3px; }
    .BASRIC-no { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    /* Status Banner */
    .status-banner { display: flex; align-items: center; justify-content: space-between; background: ${statusBg}; border: 1.5px solid ${statusColor}40; border-radius: 10px; padding: 12px 20px; margin-bottom: 22px; }
    .status-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; }
    .status-value { font-size: 16px; font-weight: 900; color: ${statusColor}; }
    .order-id-block { text-align: right; }
    .order-id-value { font-size: 22px; font-weight: 900; color: #1e293b; text-align: right; }
    .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
    .info-box h3 { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 7px; margin-bottom: 8px; }
    .info-box p { font-size: 12px; color: #475569; margin: 3px 0; line-height: 1.5; }
    .info-box p strong { color: #1e293b; }
    /* Table */
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead { background: #1e293b; }
    th { padding: 11px 10px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #fff; }
    th:first-child { text-align: left; border-radius: 6px 0 0 6px; }
    th:last-child { border-radius: 0 6px 6px 0; }
    th:not(:first-child) { text-align: right; }
    th:nth-child(2) { text-align: center; }
    /* Totals */
    .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 24px; }
    .totals-box { width: 300px; }
    .t-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #475569; border-bottom: 1px dashed #e2e8f0; }
    .t-row:last-child { border-bottom: none; }
    .t-final { display: flex; justify-content: space-between; padding: 14px 0 0; font-size: 20px; font-weight: 900; color: #1e293b; border-top: 2.5px solid #1e293b; margin-top: 10px; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 20px; }
    }
  </style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div class="logo-area">
      <div>
        <div class="brand-name"><span class="live">Live</span><span class="mart">Mart</span></div>
        <div class="brand-tagline">Live Better, Shop Smarter</div>
      </div>
    </div>
    <div class="BASRIC-meta">
      <div class="BASRIC-title">INVOICE</div>
      <div class="BASRIC-sub">Order Date: ${order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</div>
      <div class="BASRIC-no">Invoice No: ${invoiceNo}</div>
    </div>
  </div>

  <!-- Status Banner -->
  <div class="status-banner">
    <div>
      <div class="status-label">Order Status</div>
      <div class="status-value">${isCancelled ? '✗ Cancelled' : isConfirmed || isCOD ? '✓ ' + statusText : '⏳ ' + statusText}</div>
    </div>
    <div class="order-id-block">
      <div class="status-label" style="text-align: right;">Order ID</div>
      <div class="order-id-value">#${orderId}</div>
    </div>
  </div>

  <!-- Info Grid -->
  <div class="info-grid">
    <div class="info-box">
      <h3>Account Info</h3>
      ${order.is_registered_user
        ? '<p><strong>ID:</strong> #' + (order.user_id || 'N/A') + '</p><p><strong>Name:</strong> ' + order.customer_name + '</p><p><strong>Email:</strong> ' + order.customer_email + '</p><p style="margin-top:8px;"><span class="badge-member" style="background:#f1f5f9; color:#64748b; border: 1px solid #cbd5e1; padding: 2px 6px; border-radius: 4px; font-size: 10px;">✓ Registered</span></p>'
        : '<p><strong>Status:</strong> Guest User</p><p><strong>Name:</strong> ' + order.customer_name + '</p><p style="margin-top:8px;"><span class="badge-member" style="background:#f1f5f9; color:#64748b; border: 1px solid #cbd5e1; padding: 2px 6px; border-radius: 4px; font-size: 10px;">Guest</span></p>'
      }
    </div>
    <div class="info-box">
      <h3>Billed To</h3>
      <p><strong>${order.customer_name || ''}</strong></p>
      <p>${order.customer_email || ''}</p>
      <p>${order.customer_phone || ''}${order.alt_phone ? ' / ' + order.alt_phone : ''}</p>
    </div>
    <div class="info-box">
      <h3>Shipping Address</h3>
      <p>${order.customer_address || ''}</p>
      ${order.landmark ? '<p>Near: ' + order.landmark + '</p>' : ''}
      <p>${order.city || ''}, ${order.district || ''}</p>
      <p>${order.country || 'India'} - ${order.pincode || ''}</p>
    </div>
    <div class="info-box">
      <h3>Payment Info</h3>
      <p><strong>Method:</strong> ${order.payment_method === 'Online' ? 'Online (UPI/Bank)' : 'Cash on Delivery'}</p>
      <p><strong>Total Paid:</strong> &#8377;${total.toFixed(2)}</p>
      ${order.couponCode ? '<p><strong>Coupon:</strong> ' + order.couponCode + '</p>' : ''}
      ${order.order_notes ? '<p style="margin-top:6px; font-style:italic; color:#94a3b8; font-size:11px;">Note: ' + order.order_notes + '</p>' : ''}
    </div>
  </div>

  <!-- Items Table -->
  <table>
    <thead>
      <tr>
        <th style="text-align:left;">#&nbsp; Item</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Unit Price</th>
        <th style="text-align:right;">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <!-- Totals -->
  <div class="totals-wrap">
    <div class="totals-box">
      <div class="t-row"><span>Subtotal</span><span>&#8377;${subtotal.toFixed(2)}</span></div>
      <div class="t-row"><span>Delivery &amp; Extra Charges</span><span>+&#8377;${charges.toFixed(2)}</span></div>
      <div class="t-row" style="color:#16a34a;"><span>Discount${order.couponCode ? ' (' + order.couponCode + ')' : ''}</span><span>-&#8377;${discount.toFixed(2)}</span></div>
      <div class="t-final"><span>Grand Total</span><span>&#8377;${total.toFixed(2)}</span></div>
    </div>
  </div>
  
  ${receiptBase64 ? `
  <div style="page-break-before: always;"></div>
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 22px; margin-top: 22px;">
    <h3 style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">Payment Screenshot / Proof of Payment</h3>
    <img src="${receiptBase64}" alt="Payment Screenshot" style="max-width: 260px; max-height: 200px; border-radius: 8px; border: 1.5px solid #e2e8f0; object-fit: contain;" />
    <p style="font-size:11px; color:#94a3b8; margin-top:8px;">Screenshot submitted by customer at time of order placement.</p>
  </div>
  ` : ''}
  
  <div style="background: #111827; border-radius: 12px; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; color: white; margin-top: 40px;">
    <div>
      <div style="color: #94a3b8; font-size: 10px; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px;">
        <span style="color: #ec4899; margin-right: 4px;">📞</span> PHONE / WHATSAPP
      </div>
      <div style="color: #facc15; font-size: 14px; font-weight: 700;">9339840967</div>
    </div>
    <div style="text-align: center;">
      <div style="color: #94a3b8; font-size: 10px; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px;">
        <span style="color: #94a3b8; margin-right: 4px;">✉</span> EMAIL
      </div>
      <div style="color: #facc15; font-size: 14px; font-weight: 700;">support@W!FOMART.in</div>
    </div>
    <div style="text-align: right;">
      <div style="color: #94a3b8; font-size: 10px; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px;">
        <span style="color: #ec4899; margin-right: 4px;">📍</span> ADDRESS
      </div>
      <div style="color: #fff; font-size: 14px; font-weight: 700;">xxxvtg</div>
    </div>
  </div>
  
  <div style="border-top: 1.5px dashed #cbd5e1; margin: 24px 0;"></div>
  
  <div style="text-align: center; margin-bottom: 12px;">
    <span style="font-size: 20px; font-weight: 900; color: #1e293b;">W!FOMART</span>
    <span style="font-size: 16px; color: #64748b; margin: 0 8px;">—</span>
    <span style="font-size: 20px; font-weight: 900; color: #f97316;">Live Better, Shop Smarter 🛍️</span>
  </div>
  
  <div style="text-align: center; color: #64748b; font-size: 12px; margin-bottom: 16px;">
    Thank you for your business! This is a computer-generated invoice. No signature required.
  </div>
  
  <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 30px; padding: 10px; text-align: center; color: #64748b; font-size: 10px; font-weight: 700;">
    Invoice No: ${invoiceNo} &nbsp;|&nbsp; Order ID: #${orderId} &nbsp;|&nbsp; Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
  </div>

</div>
</body>
</html>`;

  // Use puppeteer to render the PDF
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Use a safer wait condition and a 15-second timeout so it never hangs indefinitely
  await page.setContent(htmlContent, { waitUntil: 'networkidle2', timeout: 15000 });
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });
  
  await browser.close();
  
  return pdfBuffer;
};

module.exports = { generateInvoicePDF };


