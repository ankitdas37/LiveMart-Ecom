import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CreditCard, Banknote, AlertCircle, ArrowLeft, UploadCloud, CheckCircle2, Tag, Trash2, X } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import html2pdf from 'html2pdf.js';
import InvoiceTemplate from '../components/InvoiceTemplate';
import ImageModal from '../components/ImageModal';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);

  const [checkoutData] = useState(location.state?.checkoutData || null);

  useEffect(() => {
    if (!checkoutData) {
      navigate('/cart');
    }
  }, [checkoutData, navigate]);

  const [availableCoupons, setAvailableCoupons] = useState(location.state?.availableCoupons || []);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(location.state?.appliedCoupon || null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [settings, setSettings] = useState({
    PAYMENT_UPI_ID: 'merchant@upi',
    PAYMENT_QR_CODE: '',
    PAYMENT_COD_ENABLED: true,
    PAYMENT_ONLINE_ENABLED: true
  });
  const [isLoading, setIsLoading] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [viewImage, setViewImage] = useState(null);

  // Check if COD is disabled by some products
  const isCodAvailableByProducts = checkoutData?.orderItems?.every(item => item.cod_available !== false) ?? true;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        if (data) {
          setSettings(prev => ({ ...prev, ...data }));

          // Auto-select first available payment method
          if (data.PAYMENT_COD_ENABLED && isCodAvailableByProducts) {
            setPaymentMethod('COD');
          } else if (data.PAYMENT_ONLINE_ENABLED) {
            setPaymentMethod('Online');
            setShowInfoModal(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [isCodAvailableByProducts]);

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 10MB limit validation
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      setIsUploadingReceipt(true);
      const res = await axios.post('/api/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPaymentReceiptUrl(res.data.url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload receipt image. Please try again.');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleApplyCoupon = async (codeToApply = couponCode) => {
    if (!codeToApply.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      const { data } = await axios.post('/api/coupons/validate', {
        code: codeToApply,
        cartValue: checkoutData.cartTotal || 0
      });
      setAppliedCoupon({
        ...data.coupon,
        calculatedDiscount: parseFloat(data.discountAmount)
      });
      setCouponCode('');
    } catch (error) {
      setAppliedCoupon(null);
      setCouponError(error.response?.data?.message || 'Invalid coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const cartSubtotal = checkoutData?.cartTotal || 0;
  const shippingCharge = checkoutData?.actualShippingCharge || 0;
  const extraCharges = checkoutData?.totalExtraCharges || 0;
  const discountAmount = appliedCoupon ? appliedCoupon.calculatedDiscount : 0;
  const finalTotalAmount = Math.max(0, cartSubtotal - discountAmount + shippingCharge + extraCharges);

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      setSubmitMessage({ type: 'error', text: 'Please select a payment method.' });
      return;
    }

    if (paymentMethod === 'Online' && !paymentReceiptUrl) {
      setSubmitMessage({ type: 'error', text: 'Please upload the payment receipt.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    // Prepare final payload
    const finalOrderPayload = {
      ...checkoutData,
      payment_method: paymentMethod,
      payment_receipt: paymentMethod === 'Online' ? paymentReceiptUrl : null,
      total_amount: finalTotalAmount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      discountAmount: discountAmount,
    };

    // Clean up UI helpers
    delete finalOrderPayload.cartTotal;
    delete finalOrderPayload.actualShippingCharge;
    delete finalOrderPayload.totalExtraCharges;
    delete finalOrderPayload.totalSaved;

    try {
      const config = {};
      if (user && user.token) {
        config.headers = { Authorization: `Bearer ${user.token}` };
      }
      
      const response = await axios.post('/api/orders', finalOrderPayload, config);

      const mockOrderForPdf = {
        ...response.data,
        cartSubtotal: cartSubtotal,
        shippingCharge: shippingCharge,
        extraCharges: extraCharges,
        discountAmount: discountAmount,
        totalSaved: checkoutData.totalSaved,
        OrderItems: checkoutData.orderItems.map(item => ({
          quantity: item.quantity,
          price: item.price,
          Product: {
            title: item.title,
            discount_price: item.discount_price,
            description: item.description,
            images: item.images || (item.image_url ? [item.image_url] : []),
          }
        }))
      };

      setPlacedOrder(response.data);
      clearCart();
      localStorage.removeItem('checkoutFormData');
      navigate('/order-success', { state: { order: mockOrderForPdf }, replace: true });
    } catch (error) {
      console.error("Order submission error:", error);
      setSubmitMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to place order. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>;
  }

  if (!checkoutData) return null; // Prevents render while redirecting

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/50 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-200/50 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">

        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white/80 backdrop-blur-md rounded-full hover:bg-white text-slate-700 transition-all shadow-sm border border-white/40"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500">
            Complete Payment
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Payment Selection Area */}
          <div className="lg:w-2/3 space-y-6">

            {submitMessage && submitMessage.type === 'error' && (
              <div className="p-4 rounded-2xl flex bg-red-50/90 backdrop-blur border border-red-200 text-red-800 shadow-sm">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <p className="font-medium">{submitMessage.text}</p>
              </div>
            )}

            {!isCodAvailableByProducts && settings.PAYMENT_COD_ENABLED && (
              <div className="p-4 bg-amber-50/90 backdrop-blur text-amber-800 rounded-2xl text-sm border border-amber-200 shadow-sm flex">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <p>One or more items in your order do not support Cash on Delivery. Online payment is required.</p>
              </div>
            )}

            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/50">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <ShieldCheck className="w-6 h-6 mr-2 text-indigo-500" />
                Select Payment Method
              </h2>

              <div className="grid grid-cols-1 gap-4">

                {/* COD Option */}
                {settings.PAYMENT_COD_ENABLED && (
                  <label
                    className={`relative flex items-center p-6 border-2 rounded-2xl transition-all duration-300 ${(!isCodAvailableByProducts)
                        ? 'opacity-50 cursor-not-allowed border-white bg-slate-50/50'
                        : paymentMethod === 'COD'
                          ? 'border-pink-500 bg-pink-50/50 shadow-md shadow-pink-100 ring-2 ring-pink-500/20 cursor-pointer'
                          : 'border-white hover:border-pink-200 hover:bg-white/80 bg-white/50 cursor-pointer'
                      }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => isCodAvailableByProducts && setPaymentMethod('COD')}
                      disabled={!isCodAvailableByProducts}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${paymentMethod === 'COD' ? 'border-pink-500 bg-pink-500' : 'border-slate-300'
                      }`}>
                      {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 mr-4">
                        <Banknote className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Cash on Delivery</h3>
                        <p className="text-sm text-slate-500 font-medium">Pay when your order arrives</p>
                      </div>
                    </div>
                  </label>
                )}

                {/* Online Payment Option */}
                {settings.PAYMENT_ONLINE_ENABLED && (
                  <label
                    className={`relative flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'Online'
                        ? 'border-indigo-500 bg-indigo-50/50 shadow-md shadow-indigo-100 ring-2 ring-indigo-500/20'
                        : 'border-white hover:border-indigo-200 hover:bg-white/80 bg-white/50'
                      }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Online"
                      checked={paymentMethod === 'Online'}
                      onChange={() => {
                        setPaymentMethod('Online');
                        setShowInfoModal(true);
                      }}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${paymentMethod === 'Online' ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                      }`}>
                      {paymentMethod === 'Online' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mr-4">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Pay Online</h3>
                        <p className="text-sm text-slate-500 font-medium">UPI, Net Banking, Card Transfer</p>
                      </div>
                    </div>
                  </label>
                )}

              </div>

              {/* Expandable Gateway Instructions */}
              {paymentMethod === 'Online' && (
                <div className="mt-8 p-6 bg-white/60 rounded-2xl border border-white/80 shadow-inner">
                  <h3 className="font-bold text-slate-800 text-lg mb-2">Secure Transfer Instructions</h3>
                  <p className="text-slate-600 text-sm mb-6">
                    Please transfer exactly <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">₹{finalTotalAmount.toFixed(2)}</span> to the details below, then upload a screenshot of your successful transaction.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-6 mb-6">
                    {/* UPI Box — only show if admin has set a real UPI ID */}
                    {settings.PAYMENT_UPI_ID && settings.PAYMENT_UPI_ID !== 'merchant@upi' && (
                      <div className="flex-1 bg-white p-5 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-[100%] -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 relative z-10">Scan & Pay via UPI</p>
                        <p className="font-extrabold text-xl text-slate-900 relative z-10">{settings.PAYMENT_UPI_ID}</p>
                      </div>
                    )}

                    {/* QR Code Option — only show if admin has uploaded a QR code */}
                    {settings.PAYMENT_QR_CODE && (
                      <button 
                        type="button"
                        onClick={() => setShowQrModal(true)}
                        className="flex-shrink-0 bg-white hover:bg-indigo-50 p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 shadow-sm transition-colors text-center flex flex-col items-center justify-center group"
                      >
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
                        </div>
                        <p className="text-xs font-bold text-indigo-600 uppercase">Show QR Code</p>
                      </button>
                    )}
                  </div>

                  <div className="pt-6 border-t border-indigo-100">
                    <label className="block text-sm font-bold text-slate-700 mb-3">Upload Payment Proof (Screenshot) *</label>

                    {paymentReceiptUrl ? (
                      <div className="relative w-full h-32 bg-indigo-50 rounded-xl border-2 border-indigo-200 overflow-hidden flex items-center justify-center group">
                        <img src={paymentReceiptUrl} alt="Receipt Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setPaymentReceiptUrl('')}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                          >
                            Remove & Re-upload
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-indigo-200 border-dashed rounded-xl cursor-pointer bg-white hover:bg-indigo-50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-8 h-8 text-indigo-400 mb-2" />
                          <p className="mb-1 text-sm text-indigo-600 font-semibold"><span className="font-bold">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-slate-500">PNG, JPG or JPEG (Max. 10MB)</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleReceiptUpload}
                          disabled={isUploadingReceipt}
                          className="hidden"
                        />
                      </label>
                    )}
                    {isUploadingReceipt && (
                      <div className="flex items-center space-x-2 mt-3 text-indigo-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-600"></div>
                        <p className="text-xs font-bold">Uploading proof securely...</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/50 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Payment Summary</h2>

              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-200">
                {checkoutData?.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                      <img src={item.image_url || 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=100'} alt="Product" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item.title || 'Product'}</h4>
                      <p className="text-xs text-slate-500 font-medium">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="mb-6 pt-4 border-t border-slate-200">
                {!appliedCoupon ? (
                  <>
                    <div className="flex space-x-2">
                      <div className="relative flex-grow">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Coupon Code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none uppercase font-medium placeholder-slate-400"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon(couponCode)}
                        disabled={isApplyingCoupon || !couponCode}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-70 transition-colors shadow-sm shadow-indigo-200"
                      >
                        {isApplyingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>

                    {couponError && <p className="text-red-500 text-xs mt-2 font-medium">{couponError}</p>}

                    {availableCoupons.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-medium text-slate-500">Available Coupons:</p>
                        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-indigo-200">
                          {availableCoupons.map(coupon => (
                            <div key={coupon.id} className="flex flex-col border border-indigo-100 bg-indigo-50/50 rounded-lg p-3 border-dashed">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-indigo-800 uppercase tracking-wider">{coupon.code}</span>
                                <button
                                  type="button"
                                  onClick={() => handleApplyCoupon(coupon.code)}
                                  className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-1 rounded hover:bg-indigo-700 transition-colors shadow-sm"
                                >
                                  Apply
                                </button>
                              </div>
                              <div className="mt-1">
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded mr-1">
                                  {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                                </span>
                                {coupon.description && (
                                  <span className="text-[10px] text-indigo-600">{coupon.description}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Tag className="text-green-600 w-4 h-4 mr-2" />
                      <div>
                        <p className="text-sm font-bold text-green-800">{appliedCoupon.code}</p>
                        <p className="text-xs text-green-600 font-medium">Saved ₹{appliedCoupon.calculatedDiscount?.toFixed(2) || 0}</p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                      title="Remove Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="flex justify-between text-slate-600 text-sm font-medium">
                  <span>Cart Total</span>
                  <span>₹{checkoutData?.cartTotal?.toFixed(2) || (checkoutData?.total_amount - checkoutData?.actualShippingCharge).toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-pink-600 text-sm font-bold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{appliedCoupon.calculatedDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 text-sm font-medium">
                  <span>Shipping</span>
                  <span>₹{checkoutData?.actualShippingCharge?.toFixed(2) || '0.00'}</span>
                </div>

                {checkoutData?.totalExtraCharges > 0 && (
                  <div className="flex justify-between text-amber-600 text-sm font-bold">
                    <span>Extra Charges</span>
                    <span>+₹{checkoutData.totalExtraCharges.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-900 pt-4 border-t border-slate-200 mt-2">
                  <span className="font-bold">Total Amount</span>
                  <span className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">
                    ₹{finalTotalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || !paymentMethod || (paymentMethod === 'Online' && !paymentReceiptUrl)}
                className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center relative overflow-hidden group"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-700 ease-out -translate-x-full skew-x-12"></div>
                {isSubmitting ? (
                  <div className="flex items-center space-x-2 relative z-10">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span className="relative z-10">Confirm & Pay ₹{finalTotalAmount.toFixed(2)}</span>
                )}
              </button>

              <p className="text-center text-xs text-slate-400 mt-4 font-medium flex items-center justify-center">
                <ShieldCheck className="w-3 h-3 mr-1" /> Secure checkout encrypted by 256-bit SSL
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Online Payment Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-6 sm:p-8 relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200">
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6 pr-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">Important Information</h3>
            </div>

            <div className="space-y-4 text-slate-600 text-sm leading-relaxed mb-8">
              <p className="font-medium text-slate-800 border-l-4 border-indigo-500 pl-3">
                First pay using the QR code or UPI ID, then upload the payment screenshot. Our executive officer will check if your payment is successful. If it is, your order will be confirmed; otherwise, it will fail.
              </p>
              <p>
                Our officer will update you via WhatsApp, SMS, Email, Call, etc. If you are not comfortable or do not trust this manual process, please choose Cash on Delivery (COD). If your order is not confirmed, you can <Link to="/contact" className="text-indigo-600 font-bold hover:underline" onClick={() => setShowInfoModal(false)}>contact us</Link>.
              </p>
              <hr className="border-slate-100" />
              <p className="font-medium text-slate-800 border-l-4 border-pink-500 pl-3" style={{ fontFamily: 'sans-serif' }}>
                প্রথমে QR কোড বা UPI ID ব্যবহার করে পেমেন্ট করুন, তারপর পেমেন্টের স্ক্রিনশট আপলোড করুন। আমাদের এক্সিকিউটিভ অফিসার চেক করবেন আপনার পেমেন্ট সফল হয়েছে কিনা। সফল হলে আপনার অর্ডার কনফার্ম করা হবে, অন্যথায় তা বাতিল হবে।
              </p>
              <p style={{ fontFamily: 'sans-serif' }}>
                আমাদের অফিসার আপনাকে WhatsApp, SMS, Email বা Call এর মাধ্যমে আপডেট করবেন। আপনি যদি এটি বিশ্বাস না করেন বা স্বাচ্ছন্দ্যবোধ না করেন, তবে অনুগ্রহ করে ক্যাশ অন ডেলিভারি (COD) বেছে নিন। যদি আপনার অর্ডার কনফার্ম না হয়, তবে আপনি আমাদের সাথে <Link to="/contact" className="text-pink-600 font-bold hover:underline" onClick={() => setShowInfoModal(false)}>যোগাযোগ করতে পারেন</Link>.
              </p>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
              I Understand / আমি বুঝতে পেরেছি
            </button>
          </div>
        </div>
      )}
      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in" onClick={() => setShowQrModal(false)}>
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl relative max-w-sm w-full text-center animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowQrModal(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">Scan QR Code</h3>
            <p className="text-slate-500 text-sm mb-6">Scan with any UPI app (GPay, PhonePe, Paytm)</p>
            
            <div className="bg-slate-50 p-4 rounded-2xl inline-block border border-slate-200 mb-6 shadow-inner">
               <img src={settings.PAYMENT_QR_CODE || `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`upi://pay?pa=${settings.PAYMENT_UPI_ID}&pn=Store&am=${finalTotalAmount.toFixed(2)}&cu=INR`)}`} alt="UPI QR Code" className="w-full max-w-[240px] mx-auto rounded-xl object-contain" />
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <p className="text-xs text-indigo-500 font-bold uppercase mb-1">Total Amount to Pay</p>
              <p className="text-2xl font-extrabold text-indigo-700">₹{finalTotalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Payment;
