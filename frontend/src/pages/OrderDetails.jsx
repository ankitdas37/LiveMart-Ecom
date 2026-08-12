import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { generatePDFInvoice } from '../utils/pdfGenerator';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft, Download, Package, CheckCircle, Truck, MapPin, XCircle,
  Star, ExternalLink, CreditCard, Copy, Phone, Mail, Tag, Clock,
  Shield, RefreshCw, ChevronRight, MessageSquare, ThumbsUp,
  Receipt, Hash, Calendar
} from 'lucide-react';

const STATUS_STEPS = ['Pending Confirmation', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

const getStatusStep = (status) => {
  if (status === 'Cancelled') return -1;
  return STATUS_STEPS.indexOf(status);
};

const statusColor = (status) => {
  if (status === 'Delivered') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (status === 'Cancelled') return 'bg-red-100 text-red-700 border-red-200';
  if (status === 'Shipped') return 'bg-blue-100 text-blue-700 border-blue-200';
  if (status === 'Processing') return 'bg-purple-100 text-purple-700 border-purple-200';
  return 'bg-amber-100 text-amber-700 border-amber-200';
};

const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return '—';
  return (
    dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' +
    dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  );
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard!'));
};

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [genPdf, setGenPdf] = useState(false);
  const [tickets, setTickets] = useState([]);

  // Review modal state
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Delivery experience state
  const [deliveryRated, setDeliveryRated] = useState(false);
  const [deliveryRating, setDeliveryRating] = useState(0);

  // Return modal state
  const [returnModal, setReturnModal] = useState(false);
  const [returnItem, setReturnItem] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const paddedId = String(id).padStart(6, '0');
      const orderId = `LIVEMART${paddedId}`;
      const { data } = await axios.get(`/api/orders/track/${orderId}`);
      setOrder(data);
      
      // Fetch support tickets for this order
      if (data && data.customer_email) {
        try {
          const ticketsRes = await axios.get(`/api/support/order/${data.id}?email=${encodeURIComponent(data.customer_email)}`);
          setTickets(ticketsRes.data || []);
        } catch (tErr) {
          console.error("Failed to fetch tickets:", tErr);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    try {
      setGenPdf(true);
      await generatePDFInvoice(order);
      toast.success('Invoice downloaded successfully!');
    } catch {
      toast.error('Failed to generate invoice. Please try again.');
    } finally {
      setGenPdf(false);
    }
  };

  const openReview = (product) => {
    setReviewProduct(product);
    setRating(0);
    setHoverRating(0);
    setReviewText('');
    setReviewModal(true);
  };

  const closeReview = () => {
    setReviewModal(false);
    setReviewProduct(null);
    setRating(0);
    setHoverRating(0);
    setReviewText('');
  };

  const handleReviewSubmit = async () => {
    if (rating === 0) { toast.error('Please select a star rating'); return; }
    if (!reviewText.trim()) { toast.error('Please write a review'); return; }
    
    setReviewSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/reviews', {
        productId: reviewProduct.id,
        rating,
        comment: reviewText
      }, config);
      toast.success('Review submitted! Thank you.');
      closeReview();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const openReturnModal = (item) => {
    setReturnItem(item);
    setReturnReason('');
    setReturnModal(true);
  };

  const closeReturnModal = () => {
    setReturnModal(false);
    setReturnItem(null);
    setReturnReason('');
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnReason.trim()) return toast.error('Please provide a reason for the return');
    
    setReturnSubmitting(true);
    try {
      await axios.post(`/api/orders/${order.id}/item/${returnItem.id}/return`, {
        reason: returnReason
      });
      toast.success('Return request submitted successfully');
      closeReturnModal();
      fetchOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit return request');
    } finally {
      setReturnSubmitting(false);
    }
  };

  /* ─── LOADING STATE ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-slate-600 font-semibold text-lg">Loading your order…</p>
        <p className="text-slate-400 text-sm">Please wait a moment</p>
      </div>
    );
  }

  /* ─── ERROR STATE ─── */
  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Order Not Found</h2>
        <p className="text-slate-500 max-w-sm text-center text-sm">{error || 'This order could not be loaded.'}</p>
        <button
          onClick={() => navigate('/profile')}
          className="mt-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-amber-500 transition-colors"
        >
          ← Back to My Orders
        </button>
      </div>
    );
  }

  /* ─── COMPUTED VALUES ─── */
  const orderId = `LIVEMART${String(order.id).padStart(6, '0')}`;
  const currentStep = getStatusStep(order.status);
  const progressPct = currentStep <= 0 ? 0 : Math.round((currentStep / (STATUS_STEPS.length - 1)) * 100);
  const items = order.OrderItems || [];
  const subtotal = items.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);

  const steps = [
    { label: 'Placed', icon: Package, date: order.createdAt },
    { label: 'Confirmed', icon: CheckCircle, date: order.confirmedAt },
    { label: 'Processing', icon: RefreshCw, date: order.processingAt },
    { label: 'Shipped', icon: Truck, date: order.shippedAt },
    { label: 'Delivered', icon: MapPin, date: order.deliveredAt },
  ];

  const ratingLabels = ['', 'Poor 😞', 'Fair 😐', 'Good 😊', 'Great 😄', 'Excellent! 🤩'];

  return (
    <div className="min-h-screen bg-slate-50 pb-40 sm:pb-24">

      {/* ════ HERO BANNER ════ */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
        />
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 right-0 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-12">
          {/* Back */}
          <button
            onClick={() => navigate('/profile')}
            className="inline-flex items-center gap-2 text-white/60 hover:text-amber-400 transition-colors font-semibold text-sm mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to My Orders
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            {/* Left: Order ID + status */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-black text-xs uppercase tracking-widest">Order Details</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white mb-3 break-all">{orderId}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${statusColor(order.status)}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {order.status}
                </span>
                <span className="text-white/40 text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {fmtDate(order.createdAt)}
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:flex-col sm:items-end">
              <button
                onClick={() => copyToClipboard(orderId)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all backdrop-blur"
              >
                <Copy className="w-4 h-4" /> Copy Order ID
              </button>
              <button
                onClick={handleDownloadInvoice}
                disabled={genPdf}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg shadow-amber-500/30 disabled:opacity-70"
              >
                {genPdf
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Download className="w-4 h-4" />}
                {genPdf ? 'Generating…' : 'Download Invoice'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6 space-y-5">

        {/* ════ TRACKING SECTION ════ */}
        {order.status === 'Cancelled' ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h2 className="font-black text-red-700 text-xl">Order Cancelled</h2>
              <p className="text-red-500 text-sm mt-1">This order has been cancelled and will not be delivered.</p>
              {order.cancelledAt && <p className="text-red-400 text-xs mt-1">{fmtDate(order.cancelledAt)}</p>}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-lg">Order Tracking</h2>
                  {order.status === 'Delivered' && (
                    <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                      <CheckCircle className="w-3 h-3" /> Delivered on {fmtDate(order.deliveredAt)}
                    </p>
                  )}
                </div>
              </div>
              {order.estimatedDeliveryDate && order.status !== 'Delivered' && (
                <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  Est. Delivery: {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                </span>
              )}
            </div>

            {/* Desktop timeline */}
            <div className="hidden sm:block relative mb-2">
              {/* Progress rail */}
              <div className="absolute top-5 left-[2.5rem] right-[2.5rem] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${progressPct}%`,
                    background: 'linear-gradient(90deg, #f59e0b, #fb923c)',
                  }}
                />
              </div>
              <div className="relative z-10 flex justify-between">
                {steps.map((s, i) => {
                  const done = currentStep >= i;
                  const active = currentStep === i;
                  const Icon = s.icon;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2" style={{ width: '20%' }}>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                          done
                            ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/30'
                            : 'bg-white border-slate-200 text-slate-300'
                        } ${active ? 'scale-125 ring-4 ring-amber-500/20' : ''}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-center px-1">
                        <p className={`text-[11px] font-black ${done ? 'text-slate-800' : 'text-slate-400'}`}>
                          {s.label}
                        </p>
                        {active && (
                          <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                            CURRENT
                          </span>
                        )}
                        {s.date && done && !active && (
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile timeline */}
            <div className="sm:hidden space-y-2">
              {steps.map((s, i) => {
                const done = currentStep >= i;
                const active = currentStep === i;
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      active ? 'bg-amber-50 border border-amber-200' : done ? 'bg-slate-50' : ''
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        done ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-black ${done ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</p>
                      {s.date && done && (
                        <p className="text-xs text-slate-400">{fmtDate(s.date)}</p>
                      )}
                    </div>
                    {active && (
                      <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                        LIVE
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════ MAIN GRID ════ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* ── LEFT: Products + Bill + Delivery Experience ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Products card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                <Package className="w-4 h-4 text-amber-500" />
                <h2 className="font-black text-slate-900">Order Items</h2>
                <span className="ml-auto text-xs text-slate-400 font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="divide-y divide-slate-50">
                {items.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex gap-4 hover:bg-slate-50/70 transition-colors group">
                    {/* Image */}
                    <Link
                      to={`/product/${item.product_id}`}
                      className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-slate-100 shadow-sm block"
                    >
                      <img
                        src={item.Product?.images?.[0] || 'https://via.placeholder.com/80x80?text=Product'}
                        alt={item.Product?.title || 'Product'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-white" />
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product_id}`}
                        className="block font-bold text-slate-900 text-sm leading-snug hover:text-amber-600 transition-colors line-clamp-2"
                      >
                        {item.Product?.title || 'Product'}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-xs text-slate-500 bg-slate-100 rounded-md px-2 py-0.5">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-xs text-slate-500">
                          ₹{Number(item.price).toLocaleString('en-IN')} each
                        </span>
                      </div>

                      {/* Return & Replacement Policy */}
                      {(item.Product?.return_policy || item.Product?.replacement_policy) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.Product.return_policy && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                              <RefreshCw className="w-3 h-3" /> {item.Product.return_policy}
                            </span>
                          )}
                          {item.Product.replacement_policy && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                              <Package className="w-3 h-3" /> {item.Product.replacement_policy}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mt-2">
                        <Link
                          to={`/product/${item.product_id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" /> View Product
                        </Link>
                        {order.status === 'Delivered' && (
                          <button
                            onClick={() => openReview(item.Product)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <Star className="w-3 h-3 fill-amber-500" /> Write Review
                          </button>
                        )}
                        {/* Return Logic */}
                        {order.status === 'Delivered' && item.Product?.is_returnable && item.return_status === 'None' && (
                          <button
                            onClick={() => openReturnModal(item)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" /> Return Item
                          </button>
                        )}
                        {item.return_status !== 'None' && item.return_status !== undefined && (
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${
                            item.return_status === 'Requested' ? 'bg-amber-100 text-amber-700' :
                            item.return_status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                            item.return_status === 'Returned' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            <RefreshCw className="w-3 h-3" /> Return {item.return_status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="shrink-0 text-right">
                      <p className="font-black text-slate-900 text-sm">
                        ₹{(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Summary */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border-t border-slate-100 p-5">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5" /> Bill Summary
                </h3>

                <div className="space-y-2.5">
                  {/* Subtotal */}
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>

                  {/* Shipping & Extra Charges */}
                  {(() => {
                    const discount = Number(order.discountAmount) || 0;
                    const totalPaid = Number(order.total_amount) || 0;
                    const otherCharges = totalPaid - (subtotal - discount);
                    
                    if (otherCharges > 0.01) {
                      return (
                        <div className="flex justify-between text-sm text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                            Shipping & Other Charges
                          </span>
                          <span className="font-semibold">+₹{otherCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      );
                    } else {
                      return (
                        <div className="flex justify-between text-sm text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                            Shipping & Other Charges
                          </span>
                          <span className="font-bold text-emerald-600">FREE</span>
                        </div>
                      );
                    }
                  })()}

                  {/* Coupon Discount */}
                  {Number(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        Coupon Discount {order.couponCode && `(${order.couponCode})`}
                      </span>
                      <span>−₹{Number(order.discountAmount).toFixed(2)}</span>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t-2 border-dashed border-slate-200 pt-3 mt-1">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-900 text-base">Total Paid</span>
                      <div className="text-right">
                        <span className="font-black text-xl text-indigo-600">
                          ₹{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        {order.payment_method && (
                          <p className="text-xs text-slate-400 mt-0.5">via {order.payment_method}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Delivery Experience (only if Delivered) ── */}
            {order.status === 'Delivered' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 text-center">
                  <div className="w-14 h-14 bg-emerald-50 rounded-full mx-auto flex items-center justify-center mb-3">
                    <ThumbsUp className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h3 className="font-black text-slate-900 text-xl mb-1">How was your delivery?</h3>
                  <p className="text-slate-500 text-sm mb-5">Your feedback helps us improve our service</p>
                  {deliveryRated ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl py-4 px-6 inline-flex items-center gap-2 text-emerald-700 font-black">
                      <CheckCircle className="w-5 h-5" />
                      Thanks for your {deliveryRating}-star feedback!
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center gap-3 mb-3">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            onClick={() => { setDeliveryRated(true); setDeliveryRating(s); toast.success(`You rated ${s} star${s > 1 ? 's' : ''}! ⭐`); }}
                            className="w-12 h-12 bg-slate-50 hover:bg-amber-50 border-2 border-slate-200 hover:border-amber-400 rounded-full flex items-center justify-center transition-all hover:-translate-y-1 hover:shadow-md"
                          >
                            <Star className="w-5 h-5 text-slate-300 hover:text-amber-400" />
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400">Tap a star to rate your experience</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Sidebar cards ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Order Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-500" />
                <h2 className="font-black text-slate-900">Order Info</h2>
              </div>
              <div className="p-5 space-y-3.5">
                {[
                  { label: 'Order ID', value: orderId, copy: true },
                  { label: 'Placed On', value: fmtDate(order.createdAt) },
                  ...(order.estimatedDeliveryDate
                    ? [{ label: 'Est. Delivery', value: fmtDate(order.estimatedDeliveryDate) }]
                    : []),
                  ...(order.deliveredAt
                    ? [{ label: 'Delivered On', value: fmtDate(order.deliveredAt) }]
                    : []),
                ].map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0">
                      {row.label}
                    </span>
                    {row.copy ? (
                      <button
                        onClick={() => copyToClipboard(row.value)}
                        className="flex items-center gap-1 text-xs font-black text-slate-900 hover:text-amber-600 transition-colors text-right"
                      >
                        {row.value} <Copy className="w-3 h-3 shrink-0" />
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-900 text-right">{row.value}</span>
                    )}
                  </div>
                ))}
                {/* Status badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</span>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-500" />
                <h2 className="font-black text-slate-900">Payment</h2>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-sm">{order.payment_method || 'Cash on Delivery'}</p>
                    <p className="text-xs text-slate-400">
                      ₹{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} paid
                    </p>
                  </div>
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                
                {order.payment_receipt && (
                  <div className="mt-2 bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200">
                        <img src={order.payment_receipt} alt="Receipt" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">Payment Screenshot</span>
                    </div>
                    <a 
                      href={order.payment_receipt} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {order.couponCode && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3 mt-2">
                    <Tag className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-emerald-700">Coupon: {order.couponCode}</p>
                      <p className="text-xs text-emerald-500">
                        You saved ₹{Number(order.discountAmount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <h2 className="font-black text-slate-900">Delivery Address</h2>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-black">
                      {order.customer_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <p className="font-black text-slate-900">{order.customer_name}</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {order.customer_address}
                    {order.landmark ? `, Near ${order.landmark}` : ''}
                  </p>
                  <p className="text-sm text-slate-600 font-semibold">
                    {order.city}, {order.district} — {order.pincode}
                  </p>
                  <p className="text-sm text-slate-500">{order.country}</p>
                </div>

                <div className="space-y-2">
                  {order.customer_phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-mono text-sm font-semibold">{String(order.customer_phone)}</span>
                    </div>
                  )}
                  {order.customer_email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 min-w-0">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate text-sm">{order.customer_email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Support Tickets */}
            {tickets.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  <h2 className="font-black text-slate-900">Support Tickets</h2>
                </div>
                <div className="p-5 space-y-4">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="border border-slate-100 rounded-xl overflow-hidden text-sm">
                      <div className="bg-slate-50 p-3 flex justify-between items-center border-b border-slate-100">
                        <span className="font-bold text-slate-700">Ticket #{ticket.id}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          ticket.status === 'Open' ? 'bg-amber-100 text-amber-700' :
                          ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <div className="p-3 bg-white">
                        <p className="text-slate-600 mb-2"><strong>You:</strong> {ticket.message}</p>
                        {ticket.admin_reply && (
                          <div className="bg-slate-50 p-3 rounded-lg border-l-4 border-amber-500 mt-3">
                            <p className="text-slate-900 font-bold text-xs mb-1">Admin Reply:</p>
                            <p className="text-slate-700 whitespace-pre-wrap">{ticket.admin_reply}</p>
                            {ticket.admin_attachment_url && (
                              <div className="mt-3 border border-slate-200 rounded-lg p-2 bg-white flex items-center justify-between">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                  </div>
                                  <span className="text-xs text-slate-600 truncate font-medium">Attachment File</span>
                                </div>
                                <a 
                                  href={ticket.admin_attachment_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-amber-600 hover:text-amber-700 text-xs font-bold px-3 py-1.5 rounded-md hover:bg-amber-50 transition-colors shrink-0"
                                >
                                  View
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className="fixed sm:relative bottom-0 left-0 right-0 p-4 sm:p-0 bg-white sm:bg-transparent border-t sm:border-t-0 border-slate-200 z-40 sm:z-auto space-y-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] sm:shadow-none animate-in slide-in-from-bottom-full sm:animate-none">
              <button
                onClick={handleDownloadInvoice}
                disabled={genPdf}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-amber-500 text-white py-4 sm:py-4 rounded-2xl font-black transition-all shadow-sm hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-70 text-sm"
              >
                {genPdf
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Download className="w-5 h-5" />}
                {genPdf ? 'Generating PDF…' : 'Download Invoice PDF'}
              </button>

              <Link
                to={`/order-help/${id}`}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 py-3.5 sm:py-3.5 rounded-2xl font-bold text-sm transition-all shadow-sm sm:shadow-none"
              >
                <MessageSquare className="w-4 h-4 text-slate-400" />
                Need help with this order?
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ════ REVIEW MODAL ════ */}
      {reviewModal && reviewProduct && (
        <div
          className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeReview}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'slideUp 0.3s ease' }}
          >
            <style>{`@keyframes slideUp { from { transform: translateY(40px); opacity:0; } to { transform:translateY(0); opacity:1; } }`}</style>

            {/* Modal Header */}
            <div className="relative overflow-hidden p-6" style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
              <div className="relative flex items-start gap-3">
                <img
                  src={reviewProduct.images?.[0] || 'https://via.placeholder.com/48x48?text=P'}
                  alt={reviewProduct.title}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-white/20 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">Write a Review</p>
                  <p className="text-white font-bold text-sm leading-snug line-clamp-2">{reviewProduct.title}</p>
                </div>
                <button onClick={closeReview} className="text-white/50 hover:text-white transition-colors shrink-0">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Stars */}
              <div className="text-center">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Overall Rating</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star
                        className={`w-10 h-10 transition-all duration-200 ${
                          s <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow'
                            : 'text-slate-200 hover:text-amber-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm font-black text-amber-600 mt-2">{ratingLabels[rating]}</p>
                )}
              </div>

              {/* Text */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                  Your Review
                </label>
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  maxLength={500}
                  placeholder="What did you like or dislike? Share your honest experience…"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none resize-none transition-all"
                />
                <p className="text-xs text-slate-400 mt-1 text-right">{reviewText.length}/500</p>
              </div>

              {/* Submit */}
              <button
                onClick={handleReviewSubmit}
                disabled={reviewSubmitting}
                className="w-full bg-slate-900 hover:bg-amber-500 text-white py-4 rounded-xl font-black transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
              >
                {reviewSubmitting
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Star className="w-5 h-5" />}
                {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RETURN MODAL ── */}
        {returnModal && returnItem && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm sm:animate-in sm:fade-in duration-200">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-red-500" /> Return Item
                </h3>
                <button
                  onClick={closeReturnModal}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-200 transition-all hover:rotate-90"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <img src={returnItem.Product?.images?.[0] || 'https://via.placeholder.com/60'} alt={returnItem.Product?.title} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{returnItem.Product?.title}</p>
                    <p className="text-xs text-slate-500">Qty: {returnItem.quantity}</p>
                  </div>
                </div>

                <form onSubmit={handleReturnSubmit}>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Why are you returning this item? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="E.g. Item is defective, wrong size, etc."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all h-28 resize-none mb-6"
                    required
                  ></textarea>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeReturnModal}
                      className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={returnSubmitting}
                      className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-600/20 disabled:opacity-70 flex items-center justify-center"
                    >
                      {returnSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Submit Request'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
  );
}
