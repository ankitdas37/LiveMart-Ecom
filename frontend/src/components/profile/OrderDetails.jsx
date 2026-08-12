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
  if (!d) return null;
  const dt = new Date(d);
  if (isNaN(dt)) return null;
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => toast.success('Copied!'));
};

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [genPdf, setGenPdf] = useState(false);

  // Review modal
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Delivery experience
  const [deliveryRated, setDeliveryRated] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const orderId = `LIVEMART${String(id).padStart(6, '0')}`;
      const { data } = await axios.get(`/api/orders/track/${orderId}`);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    try {
      setGenPdf(true);
      await generatePDFInvoice(order);
      toast.success('Invoice downloaded!');
    } catch {
      toast.error('Failed to generate invoice.');
    } finally {
      setGenPdf(false);
    }
  };

  const handleReviewSubmit = () => {
    if (rating === 0) { toast.error('Please select a star rating'); return; }
    if (!reviewText.trim()) { toast.error('Please write a review'); return; }
    setReviewSubmitting(true);
    setTimeout(() => {
      toast.success('Review submitted! Thank you.');
      setReviewModal(false);
      setReviewProduct(null);
      setRating(0);
      setHoverRating(0);
      setReviewText('');
      setReviewSubmitting(false);
    }, 800);
  };

  const orderId = order ? `LIVEMART${String(order.id).padStart(6, '0')}` : '';
  const currentStep = order ? getStatusStep(order.status) : 0;
  const progressPct = currentStep <= 0 ? 0 : Math.round((currentStep / (STATUS_STEPS.length - 1)) * 100);

  /* ─── LOADING ─── */
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      <p className="text-slate-600 font-semibold">Loading your order…</p>
    </div>
  );

  /* ─── ERROR ─── */
  if (error) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-4">
      <XCircle className="w-16 h-16 text-red-400" />
      <h2 className="text-2xl font-bold text-slate-900">Order Not Found</h2>
      <p className="text-slate-500 max-w-sm text-center">{error}</p>
      <button onClick={() => navigate(-1)} className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-amber-500 transition-colors">
        ← Go Back
      </button>
    </div>
  );

  const steps = [
    { label: 'Placed', icon: Package, date: order.createdAt },
    { label: 'Confirmed', icon: CheckCircle, date: order.confirmedAt },
    { label: 'Processing', icon: RefreshCw, date: order.processingAt },
    { label: 'Shipped', icon: Truck, date: order.shippedAt },
    { label: 'Delivered', icon: MapPin, date: order.deliveredAt },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white pb-20">

      {/* ── TOP HERO BANNER ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
        {/* Decorative orbs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-20 bg-amber-500 blur-3xl" />
        <div className="absolute -bottom-10 right-10 w-48 h-48 rounded-full opacity-20 bg-indigo-400 blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-28 pb-10">
          {/* Back button */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-white/70 hover:text-amber-400 transition-colors font-semibold text-sm mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to My Orders
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-black text-sm uppercase tracking-widest">Order Details</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">{orderId}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusColor(order.status)}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {order.status}
                </span>
                <span className="text-white/50 text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {fmtDate(order.createdAt)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => { copyToClipboard(orderId); }}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm"
              >
                <Copy className="w-4 h-4" />
                Copy ID
              </button>
              <button
                onClick={handleDownloadInvoice}
                disabled={genPdf}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-500/30 disabled:opacity-70"
              >
                {genPdf
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Download className="w-4 h-4" />}
                {genPdf ? 'Generating…' : 'Invoice'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-4 space-y-6">

        {/* ── TRACKING TIMELINE ── */}
        {order.status !== 'Cancelled' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Truck className="w-4 h-4 text-amber-500" />
              </div>
              <h2 className="font-black text-slate-900 text-lg">Tracking</h2>
              {order.estimatedDeliveryDate && order.status !== 'Delivered' && (
                <span className="ml-auto text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Est. {fmtDate(order.estimatedDeliveryDate)}
                </span>
              )}
              {order.status === 'Delivered' && (
                <span className="ml-auto text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Delivered {fmtDate(order.deliveredAt)}
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="relative mb-8 hidden sm:block">
              <div className="absolute top-5 left-[2.5rem] right-[2.5rem] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #f59e0b, #fb923c)' }}
                />
              </div>
              <div className="relative z-10 flex justify-between">
                {steps.map((s, i) => {
                  const done = currentStep >= i;
                  const active = currentStep === i;
                  const Icon = s.icon;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 w-20">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        done
                          ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/30'
                          : 'bg-white border-slate-200 text-slate-300'
                      } ${active ? 'scale-110 ring-4 ring-amber-500/20' : ''}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-center">
                        <p className={`text-[11px] font-bold ${done ? 'text-amber-600' : 'text-slate-400'}`}>{s.label}</p>
                        {s.date && done && (
                          <p className="text-[9px] text-slate-400 leading-tight mt-0.5">
                            {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile tracking steps */}
            <div className="sm:hidden space-y-3">
              {steps.map((s, i) => {
                const done = currentStep >= i;
                const active = currentStep === i;
                const Icon = s.icon;
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${active ? 'bg-amber-50 border border-amber-200' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${done ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</p>
                      {s.date && done && <p className="text-xs text-slate-400">{fmtDate(s.date)}</p>}
                    </div>
                    {active && <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">LIVE</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h2 className="font-black text-red-700 text-lg">Order Cancelled</h2>
              <p className="text-red-500 text-sm">This order has been cancelled and will not be delivered.</p>
              {order.cancelledAt && <p className="text-red-400 text-xs mt-1">{fmtDate(order.cancelledAt)}</p>}
            </div>
          </div>
        )}

        {/* ── GRID: Order Summary + Delivery Info ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT: Product Items */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-500" />
                <h2 className="font-black text-slate-900">Order Items</h2>
                <span className="ml-auto text-xs text-slate-400 font-semibold">{order.OrderItems?.length || 0} item{order.OrderItems?.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="divide-y divide-slate-50">
                {(order.OrderItems || []).map(item => (
                  <div key={item.id} className="p-4 flex gap-4 hover:bg-slate-50/60 transition-colors group">
                    {/* Product image */}
                    <Link
                      to={`/product/${item.product_id}`}
                      className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-slate-100 shadow-sm"
                    >
                      <img
                        src={(item.Product?.images?.[0]) || 'https://via.placeholder.com/80'}
                        alt={item.Product?.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-white" />
                      </div>
                    </Link>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product_id}`}
                        className="font-bold text-slate-900 text-sm hover:text-amber-600 transition-colors line-clamp-2 leading-tight"
                      >
                        {item.Product?.title || 'Product'}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-xs text-slate-500">Qty: <strong className="text-slate-700">{item.quantity}</strong></span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500">₹{Number(item.price).toFixed(0)} each</span>
                      </div>

                      {/* Write Review button for delivered orders */}
                      {order.status === 'Delivered' && (
                        <button
                          onClick={() => { setReviewProduct(item.Product); setReviewModal(true); }}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors bg-amber-50 px-2 py-1 rounded-lg"
                        >
                          <Star className="w-3 h-3 fill-amber-400" />
                          Write a Review
                        </button>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-black text-slate-900 text-sm">₹{(Number(item.price) * item.quantity).toFixed(2)}</p>
                      <Link
                        to={`/product/${item.product_id}`}
                        className="text-xs text-slate-400 hover:text-amber-500 transition-colors mt-1 flex items-center gap-0.5 justify-end"
                      >
                        View <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Summary */}
              <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{(order.OrderItems || []).reduce((s, i) => s + Number(i.price) * i.quantity, 0).toFixed(2)}</span>
                </div>
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Discount {order.couponCode && `(${order.couponCode})`}</span>
                    <span>-₹{Number(order.discountAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-black text-slate-900">Total Paid</span>
                  <span className="font-black text-lg text-indigo-600">₹{Number(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* ── DELIVERY EXPERIENCE ── */}
            {order.status === 'Delivered' && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full mx-auto flex items-center justify-center mb-3">
                  <ThumbsUp className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-1">How was your delivery?</h3>
                <p className="text-slate-500 text-sm mb-4">Your feedback helps us serve you better</p>
                {deliveryRated ? (
                  <div className="bg-white rounded-xl py-3 px-6 inline-flex items-center gap-2 text-emerald-600 font-bold text-sm shadow-sm">
                    <CheckCircle className="w-4 h-4" /> Thanks for your feedback!
                  </div>
                ) : (
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        onClick={() => { setDeliveryRated(true); toast.success('Thanks for the rating! ⭐'); }}
                        className="w-12 h-12 bg-white rounded-full border-2 border-emerald-100 hover:border-amber-400 hover:bg-amber-50 hover:-translate-y-1 transition-all shadow-sm flex items-center justify-center"
                      >
                        <Star className="w-6 h-6 text-slate-300 group-hover:text-amber-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Delivery & Payment Details */}
          <div className="lg:col-span-2 space-y-4">

            {/* Order Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-500" />
                <h2 className="font-black text-slate-900">Order Info</h2>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Order ID</span>
                  <button onClick={() => copyToClipboard(orderId)} className="flex items-center gap-1 text-xs font-black text-slate-900 hover:text-amber-600 transition-colors">
                    {orderId} <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Placed On</span>
                  <span className="text-xs font-bold text-slate-900 text-right">{fmtDate(order.createdAt)}</span>
                </div>
                {order.estimatedDeliveryDate && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Est. Delivery</span>
                    <span className="text-xs font-bold text-slate-900 text-right">{fmtDate(order.estimatedDeliveryDate)}</span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${statusColor(order.status)}`}>{order.status}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-500" />
                <h2 className="font-black text-slate-900">Payment</h2>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{order.payment_method || 'Cash on Delivery'}</p>
                    <p className="text-xs text-slate-400">Amount: ₹{Number(order.total_amount).toFixed(2)}</p>
                  </div>
                  <Shield className="w-4 h-4 text-emerald-400 ml-auto" />
                </div>
                {order.couponCode && (
                  <div className="mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
                    <Tag className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p className="text-xs font-bold text-emerald-700">Coupon Applied: {order.couponCode}</p>
                      <p className="text-xs text-emerald-500">You saved ₹{Number(order.discountAmount).toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <h2 className="font-black text-slate-900">Delivery Address</h2>
              </div>
              <div className="p-5 space-y-2.5">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-black text-slate-600">{order.customer_name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{order.customer_name}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {order.customer_address}
                    {order.landmark && `, Near ${order.landmark}`}
                  </p>
                  <p className="text-sm text-slate-700">{order.city}, {order.district} - {order.pincode}</p>
                  <p className="text-sm text-slate-700">{order.country}</p>
                </div>
                {order.customer_phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{'*'.repeat(Math.max(0, String(order.customer_phone).length - 4))}{String(order.customer_phone).slice(-4)}</span>
                  </div>
                )}
                {order.customer_email && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{order.customer_email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Download Invoice */}
            <button
              onClick={handleDownloadInvoice}
              disabled={genPdf}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-amber-500 text-white py-4 rounded-2xl font-bold transition-all shadow-sm hover:shadow-amber-500/30 disabled:opacity-70"
            >
              {genPdf
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Download className="w-5 h-5" />}
              {genPdf ? 'Generating…' : 'Download Invoice PDF'}
            </button>

            {/* Need Help */}
            <Link
              to="/contact"
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-3 rounded-2xl font-bold text-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Need help with this order?
            </Link>
          </div>
        </div>
      </div>

      {/* ── REVIEW MODAL ── */}
      {reviewModal && reviewProduct && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-90 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
              </div>
              <div className="relative flex items-center gap-3">
                <img
                  src={reviewProduct.images?.[0] || 'https://via.placeholder.com/48'}
                  alt={reviewProduct.title}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-white/20"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-0.5">Writing review for</p>
                  <p className="text-white font-bold text-sm line-clamp-1">{reviewProduct.title}</p>
                </div>
                <button onClick={() => { setReviewModal(false); setRating(0); setHoverRating(0); setReviewText(''); }} className="text-white/60 hover:text-white transition-colors">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Star Rating */}
              <div className="text-center mb-5">
                <p className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3">Your Rating</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star className={`w-9 h-9 transition-all duration-200 ${
                        s <= (hoverRating || rating)
                          ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-md'
                          : 'text-slate-200 hover:scale-105'
                      }`} />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-xs font-bold text-amber-600 mt-2">
                    {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
                  </p>
                )}
              </div>

              {/* Review Text */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Your Review</label>
                <textarea
                  rows="4"
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="What did you like or dislike? How was the quality?"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none resize-none transition-all"
                />
                <p className="text-xs text-slate-400 mt-1">{reviewText.length}/500 characters</p>
              </div>

              {/* Submit */}
              <button
                onClick={handleReviewSubmit}
                disabled={reviewSubmitting}
                className="w-full bg-slate-900 hover:bg-amber-500 text-white py-4 rounded-xl font-black transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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
    </div>
  );
}
