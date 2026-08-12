import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Package, CheckCircle, Truck, MapPin, XCircle, ArrowRight, Download, Star, ExternalLink, CreditCard } from 'lucide-react';
import { generatePDFInvoice } from '../utils/pdfGenerator';
import { useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const TrackOrder = () => {
  const location = useLocation();
  const [orderId, setOrderId] = useState(location.state?.orderId ? String(location.state.orderId) : '');
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAutoLoaded, setIsAutoLoaded] = useState(!!location.state?.orderId);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    if (isAutoLoaded && orderId) {
      fetchOrder(orderId);
    }
  }, []);

  const fetchOrder = async (idToFetch) => {
    setIsLoading(true);
    setError('');
    setOrderData(null);

    try {
      const { data } = await axios.get(`/api/orders/track/${idToFetch}`);
      setOrderData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found. Please check your Order ID.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setIsAutoLoaded(false);
    await fetchOrder(orderId);
  };

  const handleDownloadInvoice = async () => {
    if (!orderData) return;
    try {
      setIsLoading(true);
      await generatePDFInvoice(orderData);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStep = (status) => {
    if (status === 'Cancelled') return -1;
    const steps = ['Pending Confirmation', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
    return steps.indexOf(status);
  };

  const formatTimelineDate = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    if (isNaN(d)) return null;
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header & Search */}
        {/* Header & Search */}
        {(!isAutoLoaded || error) && (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Track Your Order</h1>
            <p className="text-slate-600 mb-8 max-w-xl mx-auto">
              Enter your Order ID to get real-time updates on your shipment status.
            </p>
            
            <form onSubmit={handleTrack} className="max-w-md mx-auto">
              <div className="relative">
                <input 
                  type="text" 
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value.toUpperCase().trim())}
                  placeholder="e.g. LIVEMART000022"
                  className="w-full pl-12 pr-32 py-4 rounded-2xl border-none shadow-lg focus:ring-4 focus:ring-amber-500/20 text-lg font-mono tracking-wider outline-none"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-6 rounded-xl font-semibold hover:bg-slate-800 transition-colors disabled:opacity-70"
                >
                  {isLoading ? 'Searching...' : 'Track'}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                Format: <span className="font-mono font-bold text-amber-600">LIVEMART000022</span> or <span className="font-mono font-bold text-amber-600">#LIVEMART000022</span>
              </p>
            </form>
            
            {error && (
              <div className="mt-6 inline-flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-lg font-medium shadow-sm">
                <XCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}
            
            {isAutoLoaded && error && (
              <div className="mt-4">
                <Link to="/profile" className="text-amber-500 hover:text-amber-600 font-bold text-sm inline-flex items-center gap-1">
                  &larr; Back to Profile
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Loading State for AutoLoad */}
        {isAutoLoaded && isLoading && !orderData && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-slate-700">Fetching Order Details...</h2>
            <p className="text-slate-500 text-sm mt-2">Please wait while we securely retrieve your order.</p>
          </div>
        )}

        {/* Action Header: Show Download Invoice whenever orderData is loaded */}
        {orderData && (
          <div className="mb-8 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
            <div>
              {isAutoLoaded && (
                <Link to="/profile" className="text-slate-500 hover:text-amber-500 font-bold text-sm mb-2 inline-flex items-center gap-1 transition-colors">
                  &larr; Back to Profile
                </Link>
              )}
              <h1 className="text-3xl font-black text-slate-900">Order Details</h1>
            </div>
            <button 
              onClick={handleDownloadInvoice}
              disabled={isLoading}
              className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" /> : <Download className="w-5 h-5" />}
              {isLoading ? 'Generating...' : 'Download Invoice'}
            </button>
          </div>
        )}

        {/* Order Results */}
        {orderData && (
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-500/10 overflow-hidden border border-slate-100 mt-4">
            {/* Top Details - Animated Hero Banner */}
            <div className="relative overflow-hidden">
              {/* Animated premium gradient background */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(135deg, #020617 0%, #0f172a 25%, #1e1b4b 75%, #312e81 100%)',
                  backgroundSize: '400% 400%',
                  animation: 'gradientShift 12s ease infinite',
                }}
              />
              {/* Glowing aesthetic orbs */}
              <div className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.6), transparent 70%)', transform: 'translate(-30%, -30%)', animation: 'pulse 6s infinite alternate' }} />
              <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.6), transparent 70%)', transform: 'translate(30%, 30%)', animation: 'pulse 8s infinite alternate' }} />
              <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.6), transparent 70%)', transform: 'translate(-50%, -50%)' }} />

              {/* Content Grid */}
              <div className="relative z-10 p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Order ID */}
                <div
                  className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-rose-400/50 rounded-3xl p-5 md:p-6 transition-all duration-300 cursor-default min-w-0 overflow-hidden shadow-lg shadow-black/20"
                  style={{ backdropFilter: 'blur(12px)' }}
                >
                  <p className="text-[10px] md:text-xs font-bold text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" style={{ animation: 'pulse 2s infinite', boxShadow: '0 0 10px rgba(251,113,133,0.8)' }} />
                    Order ID
                  </p>
                  <h2 className="text-base md:text-xl font-black text-white leading-tight group-hover:text-rose-300 transition-colors duration-300 break-all">
                    #{'LIVEMART' + orderData.id.toString().padStart(6, '0')}
                  </h2>
                </div>

                {/* Order Date */}
                <div
                  className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 rounded-3xl p-5 md:p-6 transition-all duration-300 cursor-default shadow-lg shadow-black/20"
                  style={{ backdropFilter: 'blur(12px)' }}
                >
                  <p className="text-[10px] md:text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" style={{ animation: 'pulse 2s infinite 0.3s', boxShadow: '0 0 10px rgba(96,165,250,0.8)' }} />
                    Order Date
                  </p>
                  <h2 className="text-base md:text-xl font-bold text-white leading-tight group-hover:text-blue-300 transition-colors duration-300">
                    {formatTimelineDate(orderData.createdAt)}
                  </h2>
                </div>

                {/* Expected Delivery */}
                <div
                  className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/50 rounded-3xl p-5 md:p-6 transition-all duration-300 cursor-default shadow-lg shadow-black/20"
                  style={{ backdropFilter: 'blur(12px)' }}
                >
                  <p className="text-[10px] md:text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" style={{ animation: 'pulse 2s infinite 0.6s', boxShadow: '0 0 10px rgba(52,211,153,0.8)' }} />
                    Expected Delivery
                  </p>
                  {orderData.status === 'Delivered' ? (
                    <h2 className="text-lg md:text-xl font-black text-emerald-400 flex items-center gap-2">
                      <span className="bg-emerald-500/20 text-emerald-400 rounded-full px-2 py-0.5">✓</span> Delivered!
                    </h2>
                  ) : orderData.updatedDeliveryDate ? (
                    <div>
                      <span className="text-xs md:text-sm text-slate-400 line-through mr-2">{formatTimelineDate(orderData.estimatedDeliveryDate)}</span>
                      <h2 className="text-base md:text-xl font-black text-amber-400 group-hover:text-amber-300 transition-colors">{formatTimelineDate(orderData.updatedDeliveryDate)}</h2>
                    </div>
                  ) : (
                    <h2 className="text-base md:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {orderData.estimatedDeliveryDate ? formatTimelineDate(orderData.estimatedDeliveryDate) : (
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" style={{ animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite' }} />
                          Processing…
                        </span>
                      )}
                    </h2>
                  )}
                </div>
              </div>
            </div>

            {/* Keyframe styles injected */}
            <style>{`
              @keyframes gradientShift {
                0%   { background-position: 0% 50%; }
                50%  { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              @keyframes shimmer {
                0%   { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
              @keyframes bounceY {
                0%, 100% { transform: translateY(0); }
                50%       { transform: translateY(-3px); }
              }
            `}</style>

            {/* Timeline */}
            <div className="px-6 md:px-10 py-10">
              {orderData.status === 'Cancelled' ? (
                <div className="text-center py-10">
                  <div className="relative w-24 h-24 mx-auto mb-5">
                    <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/40">
                      <XCircle className="w-11 h-11" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Order Cancelled</h3>
                  <p className="text-slate-500">This order has been cancelled and will not be delivered.</p>
                </div>
              ) : (() => {
                const steps = [
                  { title: 'Order Placed', icon: Package, step: 0, date: orderData.createdAt },
                  { title: 'Confirmed',    icon: CheckCircle, step: 1, date: orderData.confirmedAt },
                  { title: 'Processing',  icon: Package, step: 2, date: orderData.processingAt },
                  { title: 'Shipped',     icon: Truck, step: 3, date: orderData.shippedAt },
                  { title: 'Delivered',   icon: MapPin, step: 4, date: orderData.deliveredAt },
                ];
                const currentStep = getStatusStep(orderData.status);
                const pct = Math.max(0, Math.min(100, (currentStep / (steps.length - 1)) * 100));

                return (
                  <div className="relative">

                    {/* ── Track rail (desktop) ── */}
                    <div className="absolute top-7 left-[3.5rem] right-[3.5rem] h-2 rounded-full bg-slate-100 hidden md:block overflow-hidden">
                      {/* Filled portion */}
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)', backgroundSize: '200% 100%', animation: 'shimmerBar 2s linear infinite' }}
                      >
                        {/* Moving light bead on the fill */}
                        <span
                          className="absolute top-0 right-0 h-full w-6 rounded-full"
                          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)', animation: 'beadSlide 1.4s ease-in-out infinite' }}
                        />
                      </div>
                    </div>

                    {/* ── Steps ── */}
                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 md:gap-0">
                      {steps.map((item) => {
                        const isCompleted = currentStep >= item.step;
                        const isCurrent   = currentStep === item.step;
                        const isFuture    = currentStep < item.step;

                        return (
                          <div key={item.step} className="flex md:flex-col items-center md:items-center group relative w-full md:w-auto" style={{ animation: `fadeSlideUp 0.5s ease both`, animationDelay: `${item.step * 0.08}s` }}>

                            {/* Node */}
                            <div className="relative flex-shrink-0">

                              {/* Triple-ring pulse on current */}
                              {isCurrent && (
                                <>
                                  <span className="absolute -inset-4 rounded-full bg-amber-400/10 animate-ping" style={{ animationDuration: '2s' }} />
                                  <span className="absolute -inset-2 rounded-full bg-amber-400/20 animate-ping" style={{ animationDuration: '1.4s', animationDelay: '0.2s' }} />
                                  <span className="absolute -inset-1 rounded-full bg-amber-400/30 animate-ping" style={{ animationDuration: '1s', animationDelay: '0.4s' }} />
                                </>
                              )}

                              {/* Sparkle dots on completed (not current) */}
                              {isCompleted && !isCurrent && (
                                <>
                                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-300" style={{ animation: 'sparkle 2s ease-in-out infinite' }} />
                                  <span className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full bg-amber-400" style={{ animation: 'sparkle 2s ease-in-out infinite 0.6s' }} />
                                </>
                              )}

                              {/* Main circle */}
                              <div
                                className={[
                                  'relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500',
                                  isCompleted
                                    ? 'text-white'
                                    : 'bg-slate-100 text-slate-300 border-2 border-slate-200',
                                  isCurrent ? 'scale-110' : isCompleted ? 'hover:scale-110' : '',
                                ].join(' ')}
                                style={isCompleted ? {
                                  background: isCurrent
                                    ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                                    : 'linear-gradient(135deg, #f59e0b, #fb923c)',
                                  boxShadow: isCurrent
                                    ? '0 0 0 4px rgba(245,158,11,0.2), 0 8px 24px rgba(245,158,11,0.5)'
                                    : '0 4px 14px rgba(245,158,11,0.35)',
                                } : {}}
                              >
                                <item.icon
                                  className="w-6 h-6"
                                  style={ isCurrent ? { animation: 'iconWiggle 1.2s ease-in-out infinite' } : {} }
                                />
                              </div>
                            </div>

                            {/* Label (sits below on desktop, to the right on mobile) */}
                            <div className="ml-4 md:ml-0 md:mt-5 text-left md:text-center md:w-28 md:-mx-7">
                              <h4
                                className={`text-sm font-black tracking-tight transition-colors ${
                                  isCurrent   ? 'text-amber-600' :
                                  isCompleted ? 'text-slate-800' :
                                               'text-slate-350 text-slate-400'
                                }`}
                              >
                                {item.title}
                              </h4>
                              {item.date && isCompleted && (
                                <p className={`text-[10px] mt-0.5 whitespace-nowrap leading-tight ${isCurrent ? 'text-amber-500 font-bold' : 'text-slate-400 font-medium'}`}>
                                  {formatTimelineDate(item.date)}
                                </p>
                              )}
                              {isCurrent && (
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white" style={{ background: 'linear-gradient(90deg,#f59e0b,#ef4444)', animation: 'pulseBadge 1.5s ease-in-out infinite' }}>
                                  <span className="w-1 h-1 rounded-full bg-white inline-block" style={{ animation: 'ping 1s infinite' }} />
                                  Live
                                </span>
                              )}
                              {isFuture && (
                                <p className="text-[10px] text-slate-300 mt-0.5 font-medium">Pending</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Extra keyframes */}
                    <style>{`
                      @keyframes shimmerBar  { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
                      @keyframes beadSlide   { 0%,100%{opacity:0;transform:translateX(-100%)} 50%{opacity:1;transform:translateX(0)} }
                      @keyframes sparkle     { 0%,100%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)} }
                      @keyframes iconWiggle  { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(8deg)} }
                      @keyframes pulseBadge  { 0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0.5)} 50%{box-shadow:0 0 0 6px rgba(245,158,11,0)} }
                      @keyframes fadeSlideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                    `}</style>
                  </div>
                );
              })()}
            </div>

            {/* Delivery Experience (Only if delivered) */}
            {orderData.status === 'Delivered' && (
              <div className="bg-emerald-50/50 border-t border-emerald-100 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-200/20 rounded-full -translate-x-1/2 translate-y-1/2 blur-2xl"></div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-2 relative z-10">How was your delivery experience?</h3>
                <p className="text-slate-600 mb-6 text-sm font-medium relative z-10">Your feedback helps us improve our service.</p>
                <div className="flex justify-center gap-4 relative z-10">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      onClick={() => toast.success('Thanks for your feedback!')}
                      className="group p-4 bg-white rounded-full border-2 border-emerald-100 hover:border-amber-400 hover:bg-amber-50 transition-all shadow-md hover:shadow-xl hover:shadow-amber-500/20 hover:-translate-y-1"
                    >
                      <Star className="w-8 h-8 text-slate-200 group-hover:text-amber-400 group-hover:fill-amber-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Order Items & Details */}
            <div className="bg-slate-50 border-t border-slate-100 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">Delivery & Payment</h3>
                <div className="space-y-2 text-sm text-slate-600 mb-6">
                  <p><span className="font-medium text-slate-900">Name:</span> {orderData.customer_name}</p>
                  <p><span className="font-medium text-slate-900">Email:</span> {orderData.customer_email || 'Not provided'}</p>
                  <p><span className="font-medium text-slate-900">Phone:</span> {orderData.customer_phone ? '*'.repeat(Math.max(0, String(orderData.customer_phone).length - 2)) + String(orderData.customer_phone).slice(-2) : 'N/A'}</p>
                  <p><span className="font-medium text-slate-900">Address:</span> {orderData.customer_address} {orderData.landmark ? `, Landmark: ${orderData.landmark}` : ''}</p>
                  <p><span className="font-medium text-slate-900">City/Pincode:</span> {orderData.city}, {orderData.district}, {orderData.pincode}</p>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Method</p>
                    <p className="font-bold text-slate-900 text-lg">{orderData.payment_method || 'Cash on Delivery'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-4 border-b pb-2 flex justify-between items-center">
                  <span>Order Summary</span>
                  <span className="text-sm font-normal text-slate-500">{orderData.OrderItems?.length || 0} items</span>
                </h3>
                <div className="space-y-4">
                  {(orderData.OrderItems || []).map(item => (
                    <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm transition-all hover:border-amber-200">
                      <div className="flex items-center space-x-4">
                        <Link to={`/product/${item.product_id}`} className="shrink-0 relative group">
                          <img src={(item.Product?.images && item.Product.images[0]) ? item.Product.images[0] : 'https://via.placeholder.com/60'} alt={item.Product?.title || 'Product'} className="w-16 h-16 rounded-lg object-cover border border-slate-100" />
                          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="w-5 h-5 text-white" />
                          </div>
                        </Link>
                        
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${item.product_id}`} className="text-sm font-bold text-slate-900 truncate block hover:text-amber-600 transition-colors">
                            {item.Product?.title || 'Product'}
                          </Link>
                          <p className="text-xs text-slate-500 mt-1">Qty: {item.quantity} × ₹{item.price}</p>
                          
                          {/* Write Review Button (Only if Delivered) */}
                          {orderData.status === 'Delivered' && (
                            <button 
                              onClick={() => {
                                setReviewProduct(item.Product);
                                setIsReviewModalOpen(true);
                              }}
                              className="mt-2 text-xs font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 transition-colors"
                            >
                              <Star className="w-3 h-3 fill-amber-500" />
                              Write a Review
                            </button>
                          )}
                        </div>
                        
                        <div className="text-sm font-black text-slate-900 shrink-0">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 mt-2 space-y-2 bg-slate-100/50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between text-sm text-slate-600 font-medium">
                      <span>Subtotal</span>
                      <span>₹{(orderData.OrderItems || []).reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}</span>
                    </div>
                    {(orderData.discountAmount || 0) > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600 font-bold">
                        <span>Discount {orderData.couponCode ? `(${orderData.couponCode})` : ''}</span>
                        <span>-₹{Number(orderData.discountAmount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center font-black text-xl text-slate-900 pt-3 border-t border-slate-200 mt-3">
                      <span>Total Paid</span>
                      <span className="text-indigo-600">₹{Number(orderData.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>

      {/* Product Review Modal */}
      {isReviewModalOpen && reviewProduct && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => {
                setIsReviewModalOpen(false);
                setReviewProduct(null);
                setRating(0);
                setHoverRating(0);
                setReviewText('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Write a Review</h3>
            <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <img src={reviewProduct.images?.[0] || 'https://via.placeholder.com/50'} alt="product" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
              <p className="font-semibold text-slate-700 text-sm line-clamp-2">{reviewProduct.title}</p>
            </div>
            
            <div className="mb-6 text-center">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Overall Rating</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <Star 
                      className={`w-10 h-10 transition-all duration-300 ${
                        star <= (hoverRating || rating) 
                          ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-md' 
                          : 'text-slate-200 hover:scale-110'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Your Review</label>
              <textarea 
                rows="4" 
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you like or dislike? How did you use the product?"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none resize-none transition-all"
              />
            </div>
            
            <button
              onClick={() => {
                if (rating === 0) {
                  toast.error('Please select a star rating');
                  return;
                }
                if (!reviewText.trim()) {
                  toast.error('Please write a review');
                  return;
                }
                // Simulating review submission
                const loadingToast = toast.loading('Submitting review...');
                setTimeout(() => {
                  toast.dismiss(loadingToast);
                  toast.success('Review submitted successfully!');
                  setIsReviewModalOpen(false);
                  setReviewProduct(null);
                  setRating(0);
                  setHoverRating(0);
                  setReviewText('');
                }, 800);
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Error Boundary wrapper to catch render crashes
import React from 'react';

class TrackOrderErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("TrackOrder Crash:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-24 flex items-center justify-center">
          <div className="max-w-3xl w-full bg-white p-8 rounded-2xl shadow-xl border-2 border-red-200">
            <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
              <XCircle className="w-8 h-8" />
              Oops! The page crashed.
            </h2>
            <p className="text-slate-700 mb-4 font-medium">Please send a screenshot of this error box back to Antigravity so I can fix it immediately:</p>
            <div className="bg-slate-900 text-red-400 p-4 rounded-xl font-mono text-sm overflow-auto mb-4 max-h-64">
              <strong>{this.state.error && this.state.error.toString()}</strong>
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </div>
            <Link to="/profile" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
              &larr; Go Back to Profile
            </Link>
          </div>
        </div>
      );
    }
    return <TrackOrder {...this.props} />;
  }
}

export default TrackOrderErrorBoundary;
