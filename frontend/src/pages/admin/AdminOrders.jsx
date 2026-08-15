import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { ChevronDown, ChevronUp, MapPin, Phone, Mail, CheckCircle, XCircle, Trash2, Edit2, RefreshCw, Download, FileText, Upload, Image as ImageIcon } from 'lucide-react';
import ImageModal from '../../components/ImageModal';
import AdminDeleteModal from '../../components/admin/AdminDeleteModal';


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

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const [expandedOrderId, setExpandedOrderId] = useState(location.state?.highlightOrderId || null);
  const [activeTab, setActiveTab] = useState('Pending Confirmation');
  const [selectedOrders, setSelectedOrders] = useState([]);

  // Edit state
  const [editingOrder, setEditingOrder] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const toLocalISOString = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d)) return '';
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Delete state
  const [orderToDelete, setOrderToDelete] = useState(null); // null | orderId | 'bulk'
  const [showDeleteModal, setShowDeleteModal] = useState(false);


  // Quick Note state
  const [noteOrder, setNoteOrder] = useState(null);
  const [quickNote, setQuickNote] = useState('');
  const [isNotePublic, setIsNotePublic] = useState(true);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [quickNoteFileUrl, setQuickNoteFileUrl] = useState('');
  const [quickNoteFileType, setQuickNoteFileType] = useState('other');
  const [quickNoteFileName, setQuickNoteFileName] = useState('');
  const [isUploadingQuickNote, setIsUploadingQuickNote] = useState(false);

  // Image Viewer state
  const [viewImage, setViewImage] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders');
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Expanded Order Notes state
  const [expandedOrderNotes, setExpandedOrderNotes] = useState([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  useEffect(() => {
    if (expandedOrderId) {
      fetchExpandedOrderNotes(expandedOrderId);
    } else {
      setExpandedOrderNotes([]);
    }
  }, [expandedOrderId]);

  const fetchExpandedOrderNotes = async (orderId) => {
    setIsLoadingNotes(true);
    try {
      const { data } = await axios.get(`/api/admin-notes/public?order_id=${orderId}&include_inactive=true`);
      setExpandedOrderNotes(data);
    } catch (e) {
      console.error('Failed to fetch notes', e);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const toggleNoteVisibility = async (note) => {
    try {
      await axios.put(`/api/admin-notes/${note.id}`, { is_active: !note.is_active });
      if (expandedOrderId) fetchExpandedOrderNotes(expandedOrderId);
    } catch (e) {
      alert('Failed to update note visibility');
    }
  };

  const deleteOrderNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await axios.delete(`/api/admin-notes/${noteId}`);
      if (expandedOrderId) fetchExpandedOrderNotes(expandedOrderId);
    } catch (e) {
      alert('Failed to delete note');
    }
  };

  useEffect(() => {
    fetchOrders();
    // If navigated from another page to highlight a specific order, make sure we switch to its tab when data loads
  }, []);

  useEffect(() => {
    if (location.state?.highlightOrderId && orders.length > 0) {
      const targetOrder = orders.find(o => o.id === location.state.highlightOrderId);
      if (targetOrder) {
        setActiveTab(targetOrder.status);
        setTimeout(() => {
          const el = document.getElementById(`order-row-${targetOrder.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [location.state, orders]);

  const handleUpdateStatus = async (orderId, newStatus, estimatedTime = null) => {
    const statusEmoji = {
      'Confirmed': '✅',
      'Processing': '📦',
      'Shipped': '🚚',
      'Delivered': '🎉',
      'Cancelled': '❌',
    };
    const emoji = statusEmoji[newStatus] || '📋';
    try {
      const payload = { status: newStatus };
      if (estimatedTime) payload.estimated_delivery_time = estimatedTime;
      await axios.put(`/api/orders/${orderId}/status`, payload);
      fetchOrders();
      toast.success(
        `${emoji} Status → ${newStatus}\n📧 Email sent to customer`,
        {
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontSize: '13px',
            whiteSpace: 'pre-line',
          },
          iconTheme: { primary: '#f59e0b', secondary: '#1e293b' },
        }
      );
    } catch (error) {
      toast.error('Failed to update order status', {
        style: { background: '#1e293b', color: '#fca5a5', border: '1px solid #ef4444', borderRadius: '12px' }
      });
    }
  };

  const handleUpdateReturnStatus = async (orderId, itemId, status) => {
    try {
      await axios.put(`/api/orders/admin/${orderId}/item/${itemId}/return-status`, { status });
      toast.success(`Return request ${status.toLowerCase()} successfully`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update return status');
    }
  };

  const downloadInvoice = async (order) => {
    // Always fetch the LATEST order data from server before generating PDF
    // so the status reflects the most recent admin update
    let freshOrder = order;
    try {
      const { data: allOrders } = await axios.get('/api/orders');
      const found = allOrders.find(o => o.id === order.id);
      if (found) freshOrder = found;
    } catch (e) { /* fall back to passed order */ }

    const order_id = 'LIVEMART' + (freshOrder.id || '0').toString().padStart(6, '0');
    const invoice_no = `AKKU-${new Date().getFullYear()}-${order_id}`;
    const orderItems = freshOrder.OrderItems || [];
    const subtotal = orderItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
    const discount = Number(freshOrder.discount_amount) || 0;
    const total = Number(freshOrder.total_amount) || 0;
    const charges = Math.max(0, total - subtotal + discount);

    // Status styling — always uses freshOrder.status (latest from server)
    const isCOD = freshOrder.payment_method === 'COD';
    const status = freshOrder.status || (isCOD ? 'Confirmed' : 'Pending Confirmation');
    const isConfirmed = ['Confirmed', 'Processing', 'Shipped', 'Delivered'].includes(status);
    const isCancelled = status === 'Cancelled';
    const statusColor = isCancelled ? '#dc2626' : isConfirmed ? '#16a34a' : '#d97706';
    const statusBg = isCancelled ? '#fef2f2' : isConfirmed ? '#f0fdf4' : '#fffbeb';
    const statusIcon = isCancelled ? '✗' : isConfirmed ? '✓' : '⏳';

    // Fetch admin contact settings
    let contactPhone = '', contactEmail = 'support@livemart.in', contactAddress = '';
    try {
      const { data } = await axios.get('/api/settings');
      contactPhone = data.CONTACT_PHONE || '';
      contactEmail = data.CONTACT_EMAIL || 'support@livemart.in';
      contactAddress = data.CONTACT_ADDRESS || '';
    } catch (e) { /* use defaults */ }

    let orderNotesHTML = '';
    let notesBase64 = {};
    try {
      const { data: notes } = await axios.get(`/api/admin-notes/public?order_id=${freshOrder.id}&order_status=${status}&include_inactive=true`);

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
                ${note.priority === 'urgent' ? '🚨' : note.priority === 'high' ? '⭐' : '📝'} 
                ${!note.is_active ? '<span style="color:#ef4444; font-size:10px; border:1px solid #fca5a5; padding:2px 6px; border-radius:4px; margin-right:4px; background:#fef2f2;">INTERNAL</span> ' : ''}
                ${note.title}
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

    // Logo as base64
    let logoBase64 = '';
    try {
      const resp = await fetch('/logo.png');
      const blob = await resp.blob();
      logoBase64 = await new Promise(res => { const r = new FileReader(); r.onloadend = () => res(r.result); r.readAsDataURL(blob); });
    } catch (e) { /* skip */ }


    // Payment screenshot as base64
    let receiptBase64 = '';
    if (freshOrder.payment_method === 'Online' && freshOrder.payment_receipt) {
      try {
        const resp = await fetch(freshOrder.payment_receipt);
        const blob = await resp.blob();
        receiptBase64 = await new Promise(res => { const r = new FileReader(); r.onloadend = () => res(r.result); r.readAsDataURL(blob); });
      } catch (e) { /* skip */ }
    }
    // Pre-fetch product images to base64 to avoid CORS/loading issues in html2canvas
    const itemImagesBase64 = {};
    for (const item of orderItems) {
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

    const itemRows = orderItems.map((item, idx) => `
      <tr style="background:${idx % 2 === 0 ? '#fff' : '#f8fafc'}">
        <td style="padding:11px 10px;border-bottom:1px solid #e2e8f0;">
          <div style="display: flex; align-items: center; gap: 10px;">
            ${item.image_url ? `<img src="${itemImagesBase64[item.id || item.image_url] || item.image_url}" alt="item" style="width: 64px; height: 64px; border-radius: 6px; object-fit: cover; border: 1px solid #e2e8f0; flex-shrink: 0;" />` : ''}
            <div>
              <strong style="color:#1e293b; display: block;">${item.Product?.title || item.title || 'Product'}</strong>
              ${item.Product?.description ? `<span style="font-size: 10px; color: #64748b; margin-top: 2px; display: block; max-width: 250px; line-height: 1.3;">${item.Product.description.replace(/<[^>]*>?/gm, '').substring(0, 60)}${item.Product.description.length > 60 ? '...' : ''}</span>` : ''}
            </div>
          </div>
        </td>
        <td style="padding:11px 10px;border-bottom:1px solid #e2e8f0;text-align:center;color:#64748b;">${item.quantity}</td>
        <td style="padding:11px 10px;border-bottom:1px solid #e2e8f0;text-align:right;color:#64748b;">&#8377;${Number(item.price).toFixed(2)}</td>
        <td style="padding:11px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;color:#1e293b;">&#8377;${(Number(item.quantity) * Number(item.price)).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${invoice_no}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <style>
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:Arial,sans-serif; color:#1e293b; background:#fff; font-size:13px; }
.page { padding:36px 44px; max-width:860px; margin:0 auto; }
.header { display:flex; justify-content:space-between; align-items:center; padding-bottom:20px; border-bottom:3px solid #FF8C00; margin-bottom:22px; }
.logo-area { display:flex; align-items:center; gap:12px; }
.logo-img { width:52px; height:52px; border-radius:12px; object-fit:contain; }
.brand-name { font-size:30px; font-weight:900; line-height:1; }
.brand-name .live { color:#1e293b; } .brand-name .mart { color:#FF8C00; }
.brand-tagline { font-size:9px; color:#94a3b8; letter-spacing:2.5px; margin-top:3px; text-transform:uppercase; }
.inv-meta { text-align:right; }
.inv-title { font-size:26px; font-weight:900; color:#FF8C00; letter-spacing:1px; }
.inv-sub { font-size:12px; color:#64748b; margin-top:3px; }
.inv-no { font-size:11px; color:#94a3b8; margin-top:2px; }
.status-banner { display:flex; align-items:center; justify-content:space-between; background:${statusBg}; border:1.5px solid ${statusColor}40; border-radius:10px; padding:12px 20px; margin-bottom:20px; }
.status-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#64748b; }
.status-value { font-size:17px; font-weight:900; color:${statusColor}; }
.order-id-value { font-size:22px; font-weight:900; color:#1e293b; text-align:right; }
.info-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; margin-bottom:20px; }
.info-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px; }
.info-box h3 { font-size:9px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1.5px; border-bottom:1px solid #e2e8f0; padding-bottom:7px; margin-bottom:8px; }
.info-box p { font-size:12px; color:#475569; margin:3px 0; line-height:1.5; }
.info-box p strong { color:#1e293b; }
table { width:100%; border-collapse:collapse; margin-bottom:20px; }
thead { background:#1e293b; }
th { padding:11px 10px; font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:0.8px; color:#fff; }
th:first-child { text-align:left; border-radius:6px 0 0 6px; }
th:last-child { border-radius:0 6px 6px 0; }
th:not(:first-child) { text-align:right; } th:nth-child(2) { text-align:center; }
.totals-wrap { display:flex; justify-content:flex-end; margin-bottom:22px; }
.totals-box { width:300px; }
.t-row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; color:#475569; border-bottom:1px dashed #e2e8f0; }
.t-row:last-child { border-bottom:none; }
.t-final { display:flex; justify-content:space-between; padding:14px 0 0; font-size:20px; font-weight:900; color:#1e293b; border-top:2.5px solid #1e293b; margin-top:10px; }
.receipt-section { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin-bottom:20px; }
.receipt-section h3 { font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:10px; }
.receipt-section img { max-width:260px; max-height:200px; border-radius:8px; border:1.5px solid #e2e8f0; object-fit:contain; }
.contact-bar { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 12px; padding: 20px 24px; display: flex; justify-content: space-around; margin-bottom: 24px; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.15); border: 1px solid #334155; }
.contact-item { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.c-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; display: flex; align-items: center; gap: 6px; font-weight: 800; }
.c-val { font-size: 14px; font-weight: 800; color: #f8fafc; }
.c-val a { color: #facc15; text-decoration: none; transition: 0.2s; }
.footer { text-align: center; margin-top: 30px; padding-top: 24px; border-top: 2px dashed #e2e8f0; color: #64748b; font-size: 12px; line-height: 1.6; }
.footer .thank { font-size: 18px; font-weight: 900; color: #1e293b; margin-bottom: 8px; letter-spacing: 0.5px; }
.footer .thank span { color: #FF8C00; }
.footer-meta { display: inline-block; background: #f8fafc; padding: 8px 16px; border-radius: 20px; font-size: 10px; color: #64748b; margin-top: 12px; font-weight: 600; border: 1px solid #e2e8f0; letter-spacing: 0.5px; }
.badge-member { background:#dcfce7; color:#166534; font-size:10px; font-weight:700; padding:3px 8px; border-radius:999px; display:inline-block; }
@media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } .page { padding:20px; } }
</style></head>
<body><div class="page">

<div class="header">
  <div class="logo-area">
    ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="LiveMart" />` : ''}
    <div>
      <div class="brand-name"><span class="live">Live</span><span class="mart">Mart</span></div>
      <div class="brand-tagline">Live Better, Shop Smarter</div>
    </div>
  </div>
  <div class="inv-meta">
    <div class="inv-title">INVOICE</div>
    <div class="inv-sub">Order Date: ${freshOrder.createdAt ? new Date(freshOrder.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</div>
    <div class="inv-no">Invoice No: ${invoice_no}</div>
  </div>
</div>

<div class="status-banner">
  <div>
    <div class="status-label">Order Status</div>
    <div class="status-value">${statusIcon} ${status}</div>
  </div>
  <div>
    <div class="order-id-label">Order ID</div>
    <div class="order-id-value">#${order_id}</div>
  </div>
</div>

<div class="info-grid">
  <div class="info-box">
    <h3>Account Info</h3>
    ${freshOrder.is_registered_user
        ? `<p><strong>ID:</strong> #${freshOrder.user_id || 'N/A'}</p>
         <p><strong>Name:</strong> ${freshOrder.customer_name}</p>
         <p><strong>Email:</strong> ${freshOrder.customer_email}</p>
         <p style="margin-top:8px;"><span class="badge-member">✓ Registered</span></p>`
        : `<p><strong>Status:</strong> Guest User</p>
         <p><strong>Name:</strong> ${freshOrder.customer_name}</p>
         <p style="margin-top:8px;"><span class="badge-member" style="background:#f1f5f9; color:#64748b; border: 1px solid #cbd5e1;">Guest</span></p>`
      }
  </div>
  <div class="info-box">
    <h3>Billed To</h3>
    <p><strong>${freshOrder.customer_name || ''}</strong></p>
    <p>${freshOrder.customer_email || ''}</p>
    <p>${freshOrder.customer_phone || ''}${freshOrder.alt_phone ? ' / ' + freshOrder.alt_phone : ''}</p>
  </div>
  <div class="info-box">
    <h3>Shipping Address</h3>
    <p>${freshOrder.customer_address || ''}</p>
    ${freshOrder.landmark ? `<p>Near: ${freshOrder.landmark}</p>` : ''}
    <p>${freshOrder.city || ''}, ${freshOrder.district || ''}</p>
    <p>${freshOrder.country || 'India'} - ${freshOrder.pincode || ''}</p>
  </div>
  <div class="info-box">
    <h3>Payment Info</h3>
    <p><strong>Method:</strong> ${freshOrder.payment_method === 'Online' ? 'Online (UPI/Bank)' : 'Cash on Delivery'}</p>
    <p><strong>Grand Total:</strong> &#8377;${total.toFixed(2)}</p>
    ${freshOrder.coupon_code ? `<p><strong>Coupon:</strong> ${freshOrder.coupon_code}</p>` : ''}
    ${freshOrder.estimated_delivery_time ? `<p><strong>Est. Delivery:</strong> ${freshOrder.estimated_delivery_time}</p>` : ''}
    ${freshOrder.order_notes ? `<p style="margin-top:5px;font-style:italic;color:#94a3b8;font-size:11px;">Note: ${freshOrder.order_notes}</p>` : ''}
  </div>
</div>

<table>
  <thead><tr>
    <th style="text-align:left;">Item</th>
    <th style="text-align:center;">Qty</th>
    <th style="text-align:right;">Unit Price</th>
    <th style="text-align:right;">Total</th>
  </tr></thead>
  <tbody>${itemRows}</tbody>
</table>

<div class="totals-wrap"><div class="totals-box">
  <div class="t-row"><span>Subtotal</span><span>&#8377;${subtotal.toFixed(2)}</span></div>
  ${charges > 0 ? `<div class="t-row"><span>Delivery &amp; Charges</span><span>+&#8377;${charges.toFixed(2)}</span></div>` : ''}
  ${discount > 0 ? `<div class="t-row" style="color:#16a34a;"><span>Discount</span><span>-&#8377;${discount.toFixed(2)}</span></div>` : ''}
  <div class="t-final"><span>Grand Total</span><span>&#8377;${total.toFixed(2)}</span></div>
</div></div>

${receiptBase64 ? `
<div class="receipt-section">
  <h3>Payment Screenshot / Proof</h3>
  <img src="${receiptBase64}" alt="Payment Screenshot" />
  <p style="font-size:11px;color:#94a3b8;margin-top:8px;">Submitted by customer at order time.</p>
</div>` : ''}

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
      headerEl.style.display = 'none';
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
</body></html>`;

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

  const triggerDelete = (orderId) => {
    setOrderToDelete(orderId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (orderToDelete === 'bulk') {
        await axios.delete('/api/orders/bulk', { data: { ids: selectedOrders } });
        setSelectedOrders([]);
        toast.success(`✅ Deleted ${selectedOrders.length} order(s) successfully!`);
      } else {
        await axios.delete(`/api/orders/${orderToDelete}`);
        toast.success('✅ Order deleted successfully!');
      }
      setOrderToDelete(null);
      setShowDeleteModal(false);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || '❌ Failed to delete order');
      throw error; // re-throw so modal stays open on failure
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const statusChanged = editFormData.status && orders.find(o => o.id === editingOrder)?.status !== editFormData.status;

      await axios.put(`/api/orders/${editingOrder}`, editFormData);

      if (statusChanged) {
        await axios.put(`/api/orders/${editingOrder}/status`, { status: editFormData.status });
      }

      setEditingOrder(null);
      fetchOrders();
    } catch (error) {
      alert('Failed to update order details');
    } finally {
      setIsSaving(false);
    }
  };

  const submitQuickNote = async (e) => {
    e.preventDefault();
    if (!quickNote.trim() && !quickNoteFileUrl) return; // Allow empty text if file is attached
    setIsSubmittingNote(true);
    try {
      await axios.post('/api/admin-notes', {
        title: `Note for Order #${noteOrder}`,
        content: quickNote,
        priority: 'normal',
        target_type: 'order',
        target_order_id: noteOrder,
        file_url: quickNoteFileUrl,
        file_type: quickNoteFileType,
        file_name: quickNoteFileName,
        is_active: isNotePublic
      });
      setNoteOrder(null);
      setQuickNote('');
      setIsNotePublic(true);
      setQuickNoteFileUrl('');
      setQuickNoteFileName('');
      setQuickNoteFileType('other');
      alert('Note added successfully and will appear on the invoice!');
    } catch (error) {
      alert('Failed to add note');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleQuickNoteFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setIsUploadingQuickNote(true);
      const res = await axios.post('/api/upload', uploadData);

      let fileType = 'other';
      if (file.type.startsWith('image/')) fileType = 'image';
      else if (file.type === 'application/pdf') fileType = 'pdf';

      setQuickNoteFileUrl(res.data.url);
      setQuickNoteFileType(fileType);
      setQuickNoteFileName(file.name);
    } catch (error) {
      alert('Failed to upload file');
    } finally {
      setIsUploadingQuickNote(false);
    }
  };

  const removeQuickNoteFile = () => {
    setQuickNoteFileUrl('');
    setQuickNoteFileType('other');
    setQuickNoteFileName('');
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending Confirmation':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">Pending Confirmation</span>;
      case 'Confirmed':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">Confirmed</span>;
      case 'Processing':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">Processing</span>;
      case 'Shipped':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">Shipped</span>;
      case 'Delivered':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">Delivered</span>;
      case 'Cancelled':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">{status}</span>;
    }
  };

  const filteredOrders = activeTab === 'All Orders' ? orders : orders.filter(o => o.status === activeTab);
  const tabs = ['Pending Confirmation', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Orders Management</h1>
        <p className="text-slate-500 dark:text-slate-400">Review, edit, delete, and approve incoming orders</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Tabs */}
        <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedOrders([]); }}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-200'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {selectedOrders.length > 0 && (
          <button
            onClick={() => triggerDelete('bulk')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm whitespace-nowrap hover:bg-red-700 shadow-md flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete Selected ({selectedOrders.length})
          </button>
        )}
      </div>

      {filteredOrders.length > 0 && (
        <div className="flex items-center px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl">
          <input
            type="checkbox"
            className="w-5 h-5 mr-3 rounded border-slate-300 dark:border-slate-600 text-amber-600 focus:ring-amber-500 cursor-pointer"
            checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
            onChange={handleSelectAll}
          />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select All in {activeTab}</span>
        </div>
      )}

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl text-center text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
            No orders found.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} id={`order-row-${order.id}`} className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border overflow-hidden ${expandedOrderId === order.id ? 'border-amber-400 shadow-md ring-2 ring-amber-100' : 'border-slate-100'}`}>
              {/* Order Header (Always Visible) */}
              <div
                className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => toggleExpand(order.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-8">
                  <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-amber-600 focus:ring-amber-500 cursor-pointer"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Order ID</p>
                    <p className="font-bold text-slate-900 dark:text-white">#{'LIVEMART' + order.id.toString().padStart(6, '0')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Date & Time</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Customer</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                      <span>{order.customer_name}</span>
                      {order.is_registered_user
                        ? <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">Registered</span>
                        : <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">Guest</span>
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total</p>
                    <p className="font-bold text-amber-600">₹{order.total_amount}</p>
                  </div>
                  <div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
                <div className="mt-4 md:mt-0 text-slate-400">
                  {expandedOrderId === order.id ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                </div>
              </div>

              {/* Order Details (Expanded) */}
              {expandedOrderId === order.id && (
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Customer Info */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-900 dark:text-white border-b pb-2 flex justify-between items-center">
                        Customer Details
                        <div className="flex space-x-2">
                          <button onClick={(e) => { e.stopPropagation(); setNoteOrder(order.id); setQuickNote(''); setIsNotePublic(true); removeQuickNoteFile(); }} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Add Note to Order">
                            <FileText className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); downloadInvoice(order); }} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Download Invoice">
                            <Download className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingOrder(order.id); setEditFormData(order); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Customer Details">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); triggerDelete(order.id); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Order">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start text-slate-700 dark:text-slate-300">
                          <Mail className="w-4 h-4 mr-2 mt-0.5 text-slate-400 flex-shrink-0" />
                          <span>{order.customer_email}</span>
                        </div>
                        <div className="flex items-start text-slate-700 dark:text-slate-300">
                          <Phone className="w-4 h-4 mr-2 mt-0.5 text-slate-400 flex-shrink-0" />
                          <div>
                            <div>{order.customer_phone}</div>
                            {order.alt_phone && <div className="text-slate-500 dark:text-slate-400">Alt: {order.alt_phone}</div>}
                          </div>
                        </div>
                        <div className="flex items-start text-slate-700 dark:text-slate-300">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 text-slate-400 flex-shrink-0" />
                          <div>
                            <p>{order.customer_address}</p>
                            {order.landmark && <p>Landmark: {order.landmark}</p>}
                            <p>{order.city}, {order.district}</p>
                            <p>{order.country} - {order.pincode}</p>
                            {order.location_lat && order.location_lng && (
                              <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <p className="text-xs text-slate-700 dark:text-slate-300">
                                  <span className="font-semibold text-blue-800">Exact GPS:</span> {order.location_lat}, {order.location_lng}
                                </p>
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${order.location_lat},${order.location_lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center bg-white dark:bg-slate-900 px-3 py-1.5 rounded shadow-sm border border-blue-200 w-max transition-colors"
                                >
                                  <MapPin className="w-3 h-3 mr-1" /> View on Map
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        {order.order_notes && (
                          <div className="mt-4 p-3 bg-white dark:bg-slate-900 rounded-lg border border-amber-100">
                            <p className="text-xs font-semibold text-amber-800 mb-1">Order Notes:</p>
                            <p className="text-slate-700 dark:text-slate-300">{order.order_notes}</p>
                          </div>
                        )}
                        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2">Payment Details:</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">Method: <span className="font-bold text-slate-900 dark:text-white">{order.payment_method}</span></p>
                          {order.payment_method === 'Online' && order.payment_receipt && (
                            <div className="mt-2">
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Payment Receipt:</p>
                              <button type="button" onClick={(e) => { e.stopPropagation(); setViewImage(order.payment_receipt); }}>
                                <img src={order.payment_receipt} alt="Receipt" className="h-20 w-20 object-cover rounded border border-slate-300 dark:border-slate-600 shadow-sm hover:opacity-80 transition-opacity" />
                              </button>
                            </div>
                          )}
                          {order.estimated_delivery_time && (
                            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">Est. Delivery: <span className="font-semibold text-emerald-600">{order.estimated_delivery_time}</span></p>
                          )}
                          {order.is_registered_user && (
                            <div className="mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded">✓ Registered User</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Products Ordered */}
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="font-bold text-slate-900 dark:text-white border-b pb-2">Order Items</h3>
                      <div className="space-y-3">
                        {order.OrderItems.map((item) => (
                          <div key={item.id} className="flex flex-col bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 relative">
                            <div className="flex items-center space-x-4">
                              <img
                                src={(item.Product?.images && item.Product.images.length > 0 ? item.Product.images[0] : null) || 'https://via.placeholder.com/100'}
                                alt={item.Product?.title}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-grow">
                                <p className="font-semibold text-slate-900 dark:text-white">{item.Product?.title || 'Unknown Product'}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Qty: {item.quantity} x ₹{item.price}</p>
                              </div>
                              <div className="flex flex-col items-end">
                                {item.Product?.discount_price && (
                                  <span className="text-xs text-slate-400 line-through font-medium">₹{(item.Product.discount_price * item.quantity).toFixed(2)}</span>
                                )}
                                <span className="font-bold text-slate-900 dark:text-white">
                                  ₹{(item.quantity * item.price).toFixed(2)}
                                </span>
                                {item.Product?.discount_price && (
                                  <span className="text-xs text-green-600 font-bold bg-green-50 px-1 rounded mt-0.5 whitespace-nowrap">Save ₹{((item.Product.discount_price - item.price) * item.quantity).toFixed(2)}</span>
                                )}
                              </div>
                            </div>

                            {/* Return Request UI */}
                            {item.return_status && item.return_status !== 'None' && (
                              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/50 p-3 rounded-lg border border-amber-100/50">
                                <div>
                                  <p className="text-xs font-bold text-amber-800 flex items-center gap-1 mb-1">
                                    <RefreshCw className="w-3 h-3" /> Return {item.return_status}
                                  </p>
                                  {item.return_reason && (
                                    <p className="text-xs text-amber-700/80 italic">Reason: {item.return_reason}</p>
                                  )}
                                </div>
                                {item.return_status === 'Requested' && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleUpdateReturnStatus(order.id, item.id, 'Approved')}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleUpdateReturnStatus(order.id, item.id, 'Rejected')}
                                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Order Summary Math */}
                      {(() => {
                        const subtotal = order.OrderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
                        const discount = Number(order.discountAmount) || 0;
                        const total = Number(order.total_amount) || 0;
                        const charges = total - subtotal + discount;

                        let totalSaved = discount;
                        order.OrderItems.forEach(item => {
                          const regular = Number(item.Product?.discount_price) || 0;
                          const sale = Number(item.price) || 0;
                          if (regular > sale) {
                            totalSaved += (regular - sale) * item.quantity;
                          }
                        });

                        return (
                          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mt-4 space-y-2">
                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                              <span>Subtotal ({order.OrderItems.length} {order.OrderItems.length === 1 ? 'item' : 'items'})</span>
                              <span>₹{subtotal.toFixed(2)}</span>
                            </div>

                            {charges > 0 && (
                              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                <span>Delivery & Extra Charges</span>
                                <span>+₹{charges.toFixed(2)}</span>
                              </div>
                            )}

                            {order.couponCode && (
                              <div className="flex justify-between text-sm text-green-600">
                                <span>Discount ({order.couponCode})</span>
                                <span>-₹{discount.toFixed(2)}</span>
                              </div>
                            )}

                            <div className="flex justify-between font-bold text-lg text-slate-900 dark:text-white pt-2 border-t mt-2">
                              <span>Final Total</span>
                              <span>₹{total.toFixed(2)}</span>
                            </div>

                            {totalSaved > 0 && (
                              <div className="flex justify-between font-bold text-sm text-green-700 bg-green-50 p-3 rounded-xl mt-2 border border-green-100">
                                <span>Total Saved</span>
                                <span>₹{totalSaved.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Action Buttons for Pending Orders */}
                      {order.status === 'Pending Confirmation' && (
                        <div className="flex space-x-4 pt-4 border-t mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const time = window.prompt("Enter estimated delivery time (e.g. 3-5 Business Days):", "3-5 Business Days");
                              if (time !== null) {
                                handleUpdateStatus(order.id, 'Confirmed', time);
                              }
                            }}
                            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center hover:bg-emerald-700 transition-colors"
                          >
                            <CheckCircle className="w-5 h-5 mr-2" /> Confirm Order
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to reject and cancel this order?')) {
                                handleUpdateStatus(order.id, 'Cancelled');
                              }
                            }}
                            className="flex-1 bg-red-100 text-red-700 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-red-200 transition-colors"
                          >
                            <XCircle className="w-5 h-5 mr-2" /> Reject Order
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inline Order Notes Section */}
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-900 dark:text-white">Order Notes & Attachments</h3>
                      <button onClick={() => { setNoteOrder(order.id); setQuickNote(''); setIsNotePublic(true); removeQuickNoteFile(); }} className="px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center">
                        <FileText className="w-3 h-3 mr-1.5" /> Add Note
                      </button>
                    </div>

                    {isLoadingNotes ? (
                      <div className="text-slate-500 dark:text-slate-400 text-sm">Loading notes...</div>
                    ) : expandedOrderNotes.length === 0 ? (
                      <div className="text-slate-500 dark:text-slate-400 text-sm italic bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">No notes found for this order.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {expandedOrderNotes.map(note => (
                          <div key={note.id} className={`bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm relative ${!note.is_active ? 'border-red-200 bg-red-50/30' : 'border-slate-200 dark:border-slate-700'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center">
                                {note.title}
                              </h4>
                              <div className="flex space-x-1 ml-2">
                                <button
                                  onClick={() => toggleNoteVisibility(note)}
                                  className={`px-2 py-1 text-[10px] font-bold rounded flex items-center transition-colors ${note.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-700 dark:text-slate-300 hover:bg-slate-300'}`}
                                  title="Toggle Visibility"
                                >
                                  {note.is_active ? 'Public' : 'Internal'}
                                </button>
                                <button onClick={() => deleteOrderNote(note.id)} className="text-slate-400 hover:text-red-600 p-1 bg-slate-50 dark:bg-slate-800/50 hover:bg-red-50 rounded transition-colors" title="Delete Note">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            {note.content && <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap mb-3 leading-relaxed">{note.content}</p>}
                            {note.file_url && (
                              <div className="mt-2 pt-3 border-t border-slate-100/80">
                                {note.file_type === 'image' ? (
                                  <img src={note.file_url} alt="Attachment" className="max-h-20 rounded-lg object-contain cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition-colors bg-slate-50 dark:bg-slate-800/50" onClick={() => setViewImage(note.file_url)} />
                                ) : (
                                  <a href={note.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 font-medium hover:underline flex items-center bg-indigo-50 w-max px-3 py-1.5 rounded-lg">
                                    <FileText className="w-3.5 h-3.5 mr-1.5" /> View Attached File
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {/* Edit Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Order #{editingOrder} Details</h2>
              <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow">
              <form id="editOrderForm" onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer Name</label>
                    <input type="text" name="customer_name" value={editFormData.customer_name || ''} onChange={handleEditChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input type="email" name="customer_email" value={editFormData.customer_email || ''} onChange={handleEditChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                    <input type="text" name="customer_phone" value={editFormData.customer_phone || ''} onChange={handleEditChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alt Phone</label>
                    <input type="text" name="alt_phone" value={editFormData.alt_phone || ''} onChange={handleEditChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                    <input type="text" name="customer_address" value={editFormData.customer_address || ''} onChange={handleEditChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
                    <input type="text" name="city" value={editFormData.city || ''} onChange={handleEditChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">District</label>
                    <input type="text" name="district" value={editFormData.district || ''} onChange={handleEditChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
                    <input type="text" name="pincode" value={editFormData.pincode || ''} onChange={handleEditChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                    <select name="status" value={editFormData.status || ''} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                      <option value="Pending Confirmation">Pending Confirmation</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Timeline Overrides */}
                  <div className="md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Timeline Dates (Overrides)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Confirmed At</label>
                        <input type="datetime-local" name="confirmedAt" value={toLocalISOString(editFormData.confirmedAt)} onChange={handleEditChange} className="w-full px-3 py-1.5 border rounded focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Processing At</label>
                        <input type="datetime-local" name="processingAt" value={toLocalISOString(editFormData.processingAt)} onChange={handleEditChange} className="w-full px-3 py-1.5 border rounded focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Shipped At</label>
                        <input type="datetime-local" name="shippedAt" value={toLocalISOString(editFormData.shippedAt)} onChange={handleEditChange} className="w-full px-3 py-1.5 border rounded focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Delivered At</label>
                        <input type="datetime-local" name="deliveredAt" value={toLocalISOString(editFormData.deliveredAt)} onChange={handleEditChange} className="w-full px-3 py-1.5 border rounded focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Cancelled At</label>
                        <input type="datetime-local" name="cancelledAt" value={toLocalISOString(editFormData.cancelledAt)} onChange={handleEditChange} className="w-full px-3 py-1.5 border rounded focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                      </div>
                      <div className="md:col-span-1 lg:col-span-1 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        <label className="block text-xs font-bold text-amber-900 mb-1">Override Delivery Date</label>
                        <input type="datetime-local" name="updatedDeliveryDate" value={toLocalISOString(editFormData.updatedDeliveryDate)} onChange={handleEditChange} className="w-full px-3 py-1.5 border border-amber-300 rounded focus:ring-2 focus:ring-amber-600 outline-none text-sm bg-white dark:bg-slate-900" />
                        <p className="text-[10px] text-amber-700 mt-1">Crosses out original expected date</p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-4 bg-slate-50 dark:bg-slate-800/50">
              <button type="button" onClick={() => setEditingOrder(null)} className="px-6 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button type="submit" form="editOrderForm" disabled={isSaving} className="px-6 py-2 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors disabled:opacity-70">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <AdminDeleteModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setOrderToDelete(null); }}
        onConfirm={handleConfirmDelete}
        itemName={orderToDelete === 'bulk' ? `${selectedOrders.length} Order(s)` : `Order #LIVEMART${String(orderToDelete).padStart(6, '0')}`}
        isBulk={orderToDelete === 'bulk'}
      />

      {/* Quick Note Modal */}
      {noteOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Note to Order #{noteOrder}</h2>
              <button onClick={() => setNoteOrder(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Add a note to this order. It will appear on invoices.</p>
              <form id="quickNoteForm" onSubmit={submitQuickNote}>
                <textarea
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  rows="3"
                  placeholder="Enter your note here (optional if attaching a file)..."
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none resize-none mb-4"
                ></textarea>

                {/* File Upload for Quick Note */}
                <div className="w-full">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Attachment</label>
                  {!quickNoteFileUrl ? (
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative">
                      <input type="file" onChange={handleQuickNoteFileUpload} disabled={isUploadingQuickNote} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" accept="image/*,.pdf" />
                      <div className="flex flex-col items-center justify-center space-y-1 pointer-events-none">
                        <Upload className="w-6 h-6 text-slate-400" />
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {isUploadingQuickNote ? 'Uploading...' : 'Click to attach file'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                          {quickNoteFileType === 'image' ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{quickNoteFileName || 'Attached File'}</p>
                          <a href={quickNoteFileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 hover:underline">View</a>
                        </div>
                      </div>
                      <button type="button" onClick={removeQuickNoteFile} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2 flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="isNotePublicCheckbox"
                    checked={isNotePublic}
                    onChange={(e) => setIsNotePublic(e.target.checked)}
                    className="w-5 h-5 text-amber-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer"
                  />
                  <label htmlFor="isNotePublicCheckbox" className="ml-3 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Visible to Customer (Show on User PDF)
                  </label>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-4 bg-slate-50 dark:bg-slate-800/50">
              <button onClick={() => setNoteOrder(null)} className="px-6 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                form="quickNoteForm"
                disabled={isSubmittingNote || (!quickNote.trim() && !quickNoteFileUrl)}
                className="px-6 py-2 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {isSubmittingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Modal */}
      {viewImage && <ImageModal imageUrl={viewImage} onClose={() => setViewImage(null)} />}
    </div>
  );
};

export default AdminOrders;
