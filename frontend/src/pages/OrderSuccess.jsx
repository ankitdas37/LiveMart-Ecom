import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Truck } from 'lucide-react';
import axios from 'axios';
import InvoiceTemplate from '../components/InvoiceTemplate';
import ImageModal from '../components/ImageModal';

const loadPdfJs = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state?.order;
  const [viewImage, setViewImage] = useState(null);

  useEffect(() => {
    // If user tries to access this page directly without placing an order, redirect to shop
    if (!order) {
      navigate('/shop', { replace: true });
    }
  }, [order, navigate]);

  if (!order) return null;

  const downloadInvoice = async () => {
    const order_id = 'LIVEMART' + (order.id || '0').toString().padStart(6, '0');
    const invoice_no = `AKKU-${new Date().getFullYear()}-${order_id}`;
    const subtotal = (order.OrderItems || []).reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const discount = Number(order.discountAmount) || 0;
    const total = Number(order.total_amount) || 0;
    const charges = total - subtotal + discount;

    // Determine order status
    const isCOD = order.payment_method === 'COD';
    const orderStatus = order.status || (isCOD ? 'Confirmed' : 'Pending Verification');
    const isConfirmed = ['Confirmed', 'Processing', 'Shipped', 'Delivered'].includes(orderStatus);
    const isCancelled = orderStatus === 'Cancelled';
    const statusColor = isCancelled ? '#dc2626' : isConfirmed ? '#16a34a' : '#d97706';
    const statusBg = isCancelled ? '#fef2f2' : isConfirmed ? '#f0fdf4' : '#fffbeb';
    const statusText = isCOD ? 'Confirmed' : orderStatus;

    // Fetch admin contact settings
    let contactPhone = '', contactEmail = 'support@livemart.in', contactAddress = '';
    try {
      const { data } = await axios.get('/api/settings');
      contactPhone = data.CONTACT_PHONE || '';
      contactEmail = data.CONTACT_EMAIL || 'support@livemart.in';
      contactAddress = data.CONTACT_ADDRESS || '';
    } catch (e) { /* use defaults */ }

    // Fetch applicable notes for this order
    let orderNotesHTML = '';
    let notesBase64 = {};
    try {
      const { data: notes } = await axios.get(`/api/admin-notes/public?order_id=${order.id}&order_status=${order.status || (isCOD ? 'Confirmed' : 'Pending Confirmation')}`);

      // Pre-fetch note images
      if (notes && notes.length > 0) {
        for (const note of notes) {
          if (note.file_type === 'image' && note.file_url) {
            try {
              const resp = await fetch(note.file_url);
              const blob = await resp.blob();
              notesBase64[note.id] = await new Promise(r => { const rd = new FileReader(); rd.onloadend = () => r(rd.result); rd.readAsDataURL(blob); });
            } catch (e) { }
          } else if (note.file_type === 'pdf' && note.file_url) {
            try {
              const pdfjs = await loadPdfJs();
              const loadingTask = pdfjs.getDocument(note.file_url);
              const pdfDoc = await loadingTask.promise;
              const page = await pdfDoc.getPage(1);
              const viewport = page.getViewport({ scale: 1.5 });
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              await page.render({ canvasContext: context, viewport: viewport }).promise;
              notesBase64[note.id] = canvas.toDataURL('image/jpeg', 0.8);
            } catch (e) { console.error('PDF render error', e); }
          }
        }

        orderNotesHTML = `
        <div style="page-break-before: always; padding-top: 20px;">
          <div style="margin-bottom: 24px; padding: 20px; background: #fffcf8; border-radius: 16px; border: 2px dashed #fcd34d; box-shadow: 0 4px 14px rgba(251, 191, 36, 0.15);">
          <h3 style="font-size: 16px; font-weight: 800; color: #d97706; border-bottom: 2px solid #fde68a; padding-bottom: 8px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">✨</span> Updates & Notes for You
          </h3>
          ${notes.map(note => `
            <div style="background: ${note.priority === 'urgent' ? '#fff1f2' : note.priority === 'high' ? '#fffbeb' : '#f0fdf4'}; border-left: 6px solid ${note.priority === 'urgent' ? '#fb7185' : note.priority === 'high' ? '#fbbf24' : '#34d399'}; padding: 16px; margin-bottom: 12px; border-radius: 8px 16px 16px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
              <h4 style="font-size: 14px; font-weight: 800; color: ${note.priority === 'urgent' ? '#e11d48' : note.priority === 'high' ? '#d97706' : '#059669'}; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                ${note.priority === 'urgent' ? '🚨' : note.priority === 'high' ? '⭐' : '📝'} ${note.title}
              </h4>
              ${note.content ? `<p style="font-size: 12px; color: #334155; line-height: 1.6; white-space: pre-wrap; font-weight: 500;">${note.content}</p>` : ''}
              ${note.file_url ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed ${note.priority === 'urgent' ? '#fda4af' : note.priority === 'high' ? '#fcd34d' : '#6ee7b7'};">
                  ${(note.file_type === 'image' || note.file_type === 'pdf') && notesBase64[note.id]
              ? `<div><img src="${notesBase64[note.id]}" style="max-width: 250px; max-height: 250px; border-radius: 8px; border: 1px solid #e2e8f0; object-fit: contain;" alt="Attached Document" /></div>`
              : note.file_type === 'image' && note.file_url
              ? `<div><img src="${note.file_url}" style="max-width: 250px; max-height: 250px; border-radius: 8px; border: 1px solid #e2e8f0; object-fit: contain;" alt="Attached Image" /></div>`
              : `<a href="${note.file_url}" target="_blank" style="font-size: 12px; font-weight: 700; color: #4f46e5; display: inline-block; background: #eef2ff; border: 1px solid #c7d2fe; padding: 6px 12px; border-radius: 20px; text-decoration: none;">📎 View Attached Document</a>`
            }
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        </div>`;
      }
    } catch (e) { /* skip notes */ }

    // Convert logo to base64 for PDF embedding
    let logoBase64 = '';
    try {
      const imgResp = await fetch('/logo.png');
      const blob = await imgResp.blob();
      logoBase64 = await new Promise(res => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) { /* skip logo */ }


    // Convert payment screenshot to base64
    let receiptBase64 = '';
    if (order.payment_method === 'Online' && order.payment_receipt) {
      try {
        const imgResp = await fetch(order.payment_receipt);
        const blob = await imgResp.blob();
        receiptBase64 = await new Promise(res => {
          const reader = new FileReader();
          reader.onloadend = () => res(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch (e) { /* skip screenshot */ }
    }

    // Pre-fetch product images to base64 to avoid CORS/loading issues in html2canvas
    const itemImagesBase64 = {};
    for (const item of (order.OrderItems || [])) {
      if (item.image_url) {
        try {
          const imgResp = await fetch(item.image_url);
          const blob = await imgResp.blob();
          itemImagesBase64[item.id || item.image_url] = await new Promise(res => {
            const reader = new FileReader();
            reader.onloadend = () => res(reader.result);
            reader.readAsDataURL(blob);
          });
        } catch (e) { /* skip if fails */ }
      }
    }

    const itemRows = (order.OrderItems || []).map((item, idx) => `
      <tr style="background:${idx % 2 === 0 ? '#fff' : '#f8fafc'}">
        <td style="padding:12px 10px; border-bottom:1px solid #e2e8f0;">
          <div style="display: flex; align-items: center; gap: 10px;">
            ${item.image_url ? `<img src="${itemImagesBase64[item.id || item.image_url] || item.image_url}" alt="item" style="width: 64px; height: 64px; border-radius: 6px; object-fit: cover; border: 1px solid #e2e8f0; flex-shrink: 0;" />` : ''}
            <div>
              <strong style="color:#1e293b; display: block;">${item.Product?.title || item.title || 'Product'}</strong>
              ${item.Product?.description ? `<span style="font-size: 10px; color: #64748b; margin-top: 2px; display: block; max-width: 250px; line-height: 1.3;">${item.Product.description.replace(/<[^>]*>?/gm, '').substring(0, 60)}${item.Product.description.length > 60 ? '...' : ''}</span>` : ''}
            </div>
          </div>
        </td>
        <td style="padding:12px 10px; border-bottom:1px solid #e2e8f0; text-align:center; color:#64748b;">${item.quantity}</td>
        <td style="padding:12px 10px; border-bottom:1px solid #e2e8f0; text-align:right; color:#64748b;">&#8377;${Number(item.price).toFixed(2)}</td>
        <td style="padding:12px 10px; border-bottom:1px solid #e2e8f0; text-align:right; font-weight:700; color:#1e293b;">&#8377;${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${invoice_no}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
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
    .inv-meta { text-align: right; }
    .inv-title { font-size: 26px; font-weight: 900; color: #FF8C00; letter-spacing: 1px; }
    .inv-sub { font-size: 12px; color: #64748b; margin-top: 3px; }
    .inv-no { font-size: 11px; color: #94a3b8; margin-top: 2px; }
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
    /* Receipt */
    .receipt-section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 22px; }
    .receipt-section h3 { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .receipt-section img { max-width: 260px; max-height: 200px; border-radius: 8px; border: 1.5px solid #e2e8f0; object-fit: contain; }
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
      ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="LiveMart Logo" />` : ''}
      <div>
        <div class="brand-name"><span class="live">Live</span><span class="mart">Mart</span></div>
        <div class="brand-tagline">Live Better, Shop Smarter</div>
      </div>
    </div>
    <div class="inv-meta">
      <div class="inv-title">INVOICE</div>
      <div class="inv-sub">Order Date: ${order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</div>
      <div class="inv-no">Invoice No: ${invoice_no}</div>
    </div>
  </div>

  <!-- Status Banner -->
  <div class="status-banner">
    <div>
      <div class="status-label">Order Status</div>
      <div class="status-value">${isCancelled ? '✗ Cancelled' : isConfirmed || isCOD ? '✓ ' + statusText : '⏳ ' + statusText}</div>
    </div>
    <div class="order-id-block">
      <div class="order-id-label">Order ID</div>
      <div class="order-id-value">#${order_id}</div>
    </div>
  </div>

  <!-- Info Grid -->
  <div class="info-grid">
    <div class="info-box">
      <h3>Account Info</h3>
      ${order.is_registered_user
        ? `<p><strong>ID:</strong> #${order.user_id || 'N/A'}</p>
           <p><strong>Name:</strong> ${order.customer_name}</p>
           <p><strong>Email:</strong> ${order.customer_email}</p>
           <p style="margin-top:8px;"><span class="badge-member">✓ Registered</span></p>`
        : `<p><strong>Status:</strong> Guest User</p>
           <p><strong>Name:</strong> ${order.customer_name}</p>
           <p style="margin-top:8px;"><span class="badge-member" style="background:#f1f5f9; color:#64748b; border: 1px solid #cbd5e1;">Guest</span></p>`
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
      ${order.landmark ? `<p>Near: ${order.landmark}</p>` : ''}
      <p>${order.city || ''}, ${order.district || ''}</p>
      <p>${order.country || 'India'} - ${order.pincode || ''}</p>
    </div>
    <div class="info-box">
      <h3>Payment Info</h3>
      <p><strong>Method:</strong> ${order.payment_method === 'Online' ? 'Online (UPI/Bank)' : 'Cash on Delivery'}</p>
      <p><strong>Total Paid:</strong> &#8377;${total.toFixed(2)}</p>
      ${order.couponCode ? `<p><strong>Coupon:</strong> ${order.couponCode}</p>` : ''}
      ${order.order_notes ? `<p style="margin-top:6px; font-style:italic; color:#94a3b8; font-size:11px;">Note: ${order.order_notes}</p>` : ''}
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
      ${charges > 0 ? `<div class="t-row"><span>Delivery &amp; Extra Charges</span><span>+&#8377;${charges.toFixed(2)}</span></div>` : ''}
      ${discount > 0 ? `<div class="t-row" style="color:#16a34a;"><span>Discount${order.couponCode ? ' (' + order.couponCode + ')' : ''}</span><span>-&#8377;${discount.toFixed(2)}</span></div>` : ''}
      <div class="t-final"><span>Grand Total</span><span>&#8377;${total.toFixed(2)}</span></div>
    </div>
  </div>

  <!-- Payment Screenshot (Online only) -->
  ${receiptBase64 ? `
  <div class="receipt-section">
    <h3>Payment Screenshot / Proof of Payment</h3>
    <img src="${receiptBase64}" alt="Payment Screenshot" />
    <p style="font-size:11px; color:#94a3b8; margin-top:8px;">Screenshot submitted by customer at time of order placement.</p>
  </div>` : ''}

  <!-- Removed HTML Contact Bar and Footer to render them dynamically on every page via jsPDF -->

</div>
</div>
${orderNotesHTML}
  <!-- Hidden footer template to be captured by html2canvas -->
  <div id="pdf-footer-template" style="position: absolute; top: -9999px; left: -9999px; width: 800px; padding: 20px; background: white;">
    <div style="background: #111827; border-radius: 12px; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; color: white;">
      <div>
        <div style="color: #94a3b8; font-size: 10px; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px;">
          <span style="color: #ec4899; margin-right: 4px;">📞</span> PHONE / WHATSAPP
        </div>
        <div style="color: #facc15; font-size: 14px; font-weight: 700;">${contactPhone || '9339840967'}</div>
      </div>
      <div style="text-align: center;">
        <div style="color: #94a3b8; font-size: 10px; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px;">
          <span style="color: #94a3b8; margin-right: 4px;">✉</span> EMAIL
        </div>
        <div style="color: #facc15; font-size: 14px; font-weight: 700;">${contactEmail}</div>
      </div>
      <div style="text-align: right;">
        <div style="color: #94a3b8; font-size: 10px; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px;">
          <span style="color: #ec4899; margin-right: 4px;">📍</span> ADDRESS
        </div>
        <div style="color: #fff; font-size: 14px; font-weight: 700;">${contactAddress || 'xxxvtg'}</div>
      </div>
    </div>
    
    <div style="border-top: 1.5px dashed #cbd5e1; margin: 24px 0;"></div>
    
    <div style="text-align: center; margin-bottom: 12px;">
      <span style="font-size: 20px; font-weight: 900; color: #1e293b;">LiveMart</span>
      <span style="font-size: 16px; color: #64748b; margin: 0 8px;">—</span>
      <span style="font-size: 20px; font-weight: 900; color: #f97316;">Live Better, Shop Smarter 🛍️</span>
    </div>
    
    <div style="text-align: center; color: #64748b; font-size: 12px; margin-bottom: 16px;">
      Thank you for your business! This is a computer-generated invoice. No signature required.
    </div>
    
    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 30px; padding: 10px; text-align: center; color: #64748b; font-size: 10px; font-weight: 700;">
      Invoice No: ${invoice_no} &nbsp;|&nbsp; Order ID: #${order_id} &nbsp;|&nbsp; Downloaded: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
    </div>
  </div>

</div>
</div>
${orderNotesHTML}
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script>
  window.onload = function() {
    var headerEl = document.querySelector('.header');
    var footerEl = document.getElementById('pdf-footer-template');
    
    Promise.all([
      html2canvas(headerEl, { scale: 2, useCORS: true }),
      html2canvas(footerEl, { scale: 2, useCORS: true })
    ]).then(function(results) {
      var headerImgData = results[0].toDataURL('image/png');
      var footerImgData = results[1].toDataURL('image/png');
      
      var opt = {
        margin: [1.8, 0, 2.8, 0], // Top margin 1.8" for header, bottom margin 2.8" for footer
        filename: '${invoice_no}.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      document.body.style.overflow = 'hidden';
      headerEl.style.display = 'none'; // Hide so it doesn't render natively in body
      footerEl.style.display = 'none';
      
      html2pdf().set(opt).from(document.body).toPdf().get('pdf').then(function(pdf) {
        var totalPages = pdf.internal.getNumberOfPages();
        var pageWidth = pdf.internal.pageSize.getWidth();
        var pageHeight = pdf.internal.pageSize.getHeight();
        
        for (var i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          
          var marginX = 0.5;
          
          // --- Stamp Header Image on EVERY page ---
          var hdrWidth = pageWidth - (marginX * 2);
          var hdrHeight = (results[0].height / results[0].width) * hdrWidth;
          pdf.addImage(headerImgData, 'PNG', marginX, 0.4, hdrWidth, hdrHeight);
          
          // --- Stamp Footer Image on EVERY page ---
          var ftrWidth = pageWidth - (marginX * 2);
          var ftrHeight = (results[1].height / results[1].width) * ftrWidth;
          pdf.addImage(footerImgData, 'PNG', marginX, pageHeight - ftrHeight - 0.2, ftrWidth, ftrHeight);
          
          // Add page number at very bottom right
          pdf.setTextColor(148, 163, 184); // slate-400
          pdf.setFontSize(8);
          pdf.setFont(undefined, 'normal');
          pdf.text('Page ' + i + ' of ' + totalPages, pageWidth - marginX, pageHeight - 0.25, { align: 'right' });
        }
      }).save().then(function() {
        window.parent.postMessage('pdf-downloaded', '*');
      });
    });
  };
</script>
</body>
</html>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '800px';
    iframe.style.height = '1200px';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);

    const handleMessage = (e) => {
      if (e.data === 'pdf-downloaded') {
        setTimeout(() => document.body.removeChild(iframe), 500);
        window.removeEventListener('message', handleMessage);
      }
    };
    window.addEventListener('message', handleMessage);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors flex flex-col pt-10 pb-24 sm:py-12 px-3 sm:px-4">
      <div className="max-w-4xl w-full mx-auto">

        <div className="bg-white dark:bg-slate-800 transition-colors p-5 sm:p-8 md:p-12 rounded-3xl sm:rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700/50 transform transition-all duration-500 animate-in fade-in zoom-in-95 relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-emerald-50 rounded-full blur-[60px] sm:blur-[80px] -mr-10 sm:-mr-20 -mt-10 sm:-mt-20 z-0"></div>

          <div className="relative z-10 text-center border-b border-slate-100 dark:border-slate-700/50 pb-6 sm:pb-8 mb-6 sm:mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-emerald-400 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Order Successful!</h1>
            <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400 font-medium px-2">
              Thank you for your purchase. Your order has been placed.
            </p>
            <div className="mt-4 sm:mt-6 inline-flex flex-col items-center justify-center p-3 sm:p-4 bg-emerald-50 border border-emerald-100 rounded-2xl max-w-full">
              <span className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Your Order ID</span>
              <span className="text-xl sm:text-3xl font-black text-emerald-800 tracking-wider truncate px-2">#{'LIVEMART' + order.id.toString().padStart(6, '0')}</span>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left Column: Customer & Payment Details */}
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-900 transition-colors p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-600 pb-3 mb-4 uppercase tracking-wider text-sm flex justify-between items-center">
                  Customer Details
                  {order.is_registered_user ? <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">Registered</span> : <span className="text-xs bg-slate-200 dark:bg-slate-600 transition-colors text-slate-600 dark:text-slate-300 px-2 py-1 rounded font-bold">Guest</span>}
                </h3>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl overflow-hidden">
                    {(order.customer_name || 'G').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-lg">{order.customer_name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{order.customer_email}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {order.customer_phone}
                      {order.alt_phone && ` / ${order.alt_phone}`}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                      {order.customer_address}
                      {order.landmark && `, Landmark: ${order.landmark}`}
                      <br />
                      {order.city}, {order.district}, {order.pincode}
                    </p>
                    {order.order_notes && (
                      <div className="mt-3 p-3 bg-amber-50/50 rounded border border-amber-100">
                        <p className="text-xs font-bold text-amber-800 mb-1">Order Notes:</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{order.order_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-slate-50 dark:bg-slate-900 transition-colors p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-600 pb-3 mb-4 uppercase tracking-wider text-sm">
                  Delivery Info
                </h3>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Delivering to</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {order.customer_address}{order.landmark ? `, ${order.landmark}` : ''}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {[order.city, order.district, order.pincode].filter(Boolean).join(', ')}
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Expected Delivery</p>
                      {order.estimatedDeliveryDate ? (
                        <p className="font-black text-emerald-700 text-base">
                          📦 {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      ) : (
                        <p className="font-bold text-slate-900 dark:text-white text-base">
                          {order.estimated_delivery_time || 'Standard Delivery (3–5 Days)'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 transition-colors p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-600 pb-3 mb-4 uppercase tracking-wider text-sm">
                  Payment Info
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">Method</span>
                    <span className="font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 transition-colors px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                      {order.payment_method === 'Online' ? 'Online Transfer (UPI/Bank)' : 'Cash on Delivery (COD)'}
                    </span>
                  </div>
                  {order.payment_method === 'Online' && order.payment_receipt && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                      <span className="block text-slate-600 dark:text-slate-300 text-sm font-medium mb-2">Payment Receipt Preview:</span>
                      <button
                        onClick={() => setViewImage(order.payment_receipt)}
                        className="block w-32 h-32 rounded-xl overflow-hidden border-2 border-indigo-100 hover:border-indigo-300 transition-colors shadow-sm relative group"
                      >
                        <img src={order.payment_receipt} alt="Receipt" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-bold">View Full</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Order Bill Summary */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-transparent pointer-events-none"></div>
              <h3 className="font-bold text-white border-b border-slate-700 pb-3 mb-4 uppercase tracking-wider text-sm relative z-10 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="bg-amber-500 text-slate-900 dark:text-white text-xs px-2 py-0.5 rounded font-bold">Paid: ₹{Number(order.total_amount).toFixed(2)}</span>
              </h3>

              <div className="space-y-3 mb-6 relative z-10 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                {order.OrderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3 bg-slate-800/50 p-2 rounded-lg">
                    {(item.Product?.images && item.Product.images[0]) || item.image_url ? (
                      <img
                        src={(item.Product?.images && item.Product.images[0]) ? item.Product.images[0] : item.image_url}
                        alt={item.Product?.title || item.title || 'Product'}
                        className="w-10 h-10 rounded bg-white dark:bg-slate-800 transition-colors object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex-shrink-0"></div>
                    )}
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-semibold truncate text-slate-200">{item.Product?.title || item.title}</p>
                      <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-bold text-white">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm text-slate-300 relative z-10 border-t border-slate-700 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{(order.cartSubtotal || 0).toFixed(2)}</span>
                </div>
                {(order.shippingCharge || 0) > 0 && (
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>+₹{order.shippingCharge.toFixed(2)}</span>
                  </div>
                )}
                {(order.extraCharges || 0) > 0 && (
                  <div className="flex justify-between">
                    <span>Extra Charges</span>
                    <span>+₹{order.extraCharges.toFixed(2)}</span>
                  </div>
                )}
                {(order.discountAmount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Discount</span>
                    <span>-₹{Number(order.discountAmount).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-xl font-bold text-white pt-3 border-t border-slate-700 mt-2">
                  <span>Final Total</span>
                  <span>₹{Number(order.total_amount).toFixed(2)}</span>
                </div>

                {(order.totalSaved || 0) > 0 && (
                  <div className="flex justify-between font-bold text-xs text-emerald-900 bg-emerald-400 px-3 py-2 rounded-lg mt-4 shadow-inner">
                    <span>TOTAL SAVINGS ON THIS ORDER</span>
                    <span>₹{order.totalSaved.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Manual Confirmation Notice for Online Payments */}
          {order.payment_method === 'Online' && (
            <div className="relative z-10 bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-amber-900 text-xs sm:text-sm leading-relaxed shadow-inner">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                <div className="space-y-3 sm:space-y-4 font-medium">
                  <p>
                    <strong>English:</strong> Our executive officer will check if your payment is successful. If it is, your order will be confirmed; otherwise, it will fail. Our officer will update you via WhatsApp, SMS, Email, Call, etc. If you are not comfortable or do not trust this manual process, please choose Cash on Delivery (COD). If your order is not confirmed, you can contact us.
                  </p>
                  <p className="border-t border-amber-200/60 pt-3 sm:pt-4 font-bengali">
                    <strong>বাংলা:</strong> আমাদের এক্সিকিউটিভ অফিসার চেক করবেন আপনার পেমেন্ট সফল হয়েছে কিনা। যদি হয়, আপনার অর্ডার কনফার্ম করা হবে; অন্যথায়, এটি বাতিল হবে। আমাদের অফিসার আপনাকে হোয়াটসঅ্যাপ, এসএমএস, ইমেল, কল ইত্যাদির মাধ্যমে আপডেট করবেন। আপনি যদি এই ম্যানুয়াল প্রক্রিয়ায় স্বাচ্ছন্দ্যবোধ পণ্ডিত না করেন, তবে অনুগ্রহ করে ক্যাশ অন ডেলিভারি (COD) বেছে নিন। যদি আপনার অর্ডার কনফার্ম না হয়, তাহলে আপনি আমাদের সাথে যোগাযোগ করতে পারেন।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 border-t border-slate-100 dark:border-slate-700/50 pt-6 sm:pt-8 mt-2 sm:mt-4">
            <button
              onClick={downloadInvoice}
              className="w-full sm:w-auto bg-white dark:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-600 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:bg-slate-900 transition-colors hover:border-slate-300 dark:border-slate-500 hover:text-slate-900 dark:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center text-sm sm:text-base"
            >
              <svg className="w-5 h-5 mr-2 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download PDF Invoice
            </button>
            <button
              onClick={() => navigate('/shop', { replace: true })}
              className="w-full sm:w-auto bg-slate-900 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-slate-900/20 active:scale-95"
            >
              Continue Shopping
            </button>
          </div>

        </div>
      </div>

      {/* Hidden Invoice Template for PDF generation */}
      <InvoiceTemplate order={order} />

      {/* Fullscreen Image Modal */}
      {viewImage && <ImageModal imageUrl={viewImage} onClose={() => setViewImage(null)} />}

    </div>
  );
};

export default OrderSuccess;