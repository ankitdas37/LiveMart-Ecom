import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, MapPin, AlertCircle, ShieldCheck, Tag, Truck } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const WB_DISTRICTS = [
  "Hooghly",
  "Alipurduar",
  "Bankura",
  "Birbhum",
  "Cooch Behar",
  "Dakshin Dinajpur",
  "Darjeeling",
  "Howrah",
  "Jalpaiguri",
  "Jhargram",
  "Kalimpong",
  "Kolkata",
  "Malda",
  "Murshidabad",
  "Nadia",
  "North 24 Parganas",
  "Paschim Bardhaman",
  "Paschim Medinipur",
  "Purba Bardhaman",
  "Purba Medinipur",
  "Purulia",
  "South 24 Parganas",
  "Uttar Dinajpur"
];

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "United Arab Emirates",
  "Singapore",
  "Bangladesh",
  "Nepal",
  "Sri Lanka"
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('checkoutFormData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved form data', e);
      }
    }
    return {
      name: '',
      email: '',
      phone: '',
      alt_phone: '',
      address: '',
      district: 'Hooghly',
      city: '',
      landmark: '',
      pincode: '',
      country: 'India',
      order_notes: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('checkoutFormData', JSON.stringify(formData));
  }, [formData]);

  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locationStatus, setLocationStatus] = useState(''); // 'requesting', 'success', 'error'
  const [pincodeStatus, setPincodeStatus] = useState('idle'); // 'idle', 'checking', 'success', 'error'
  const [pincodeMessage, setPincodeMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState(null);

  // Coupon State
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [shippingCharge, setShippingCharge] = useState(40); // default fallback
  const [activeExtraCharges, setActiveExtraCharges] = useState([]);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  // Check if COD is disabled for any item
  const isCodAvailable = cartItems.every(item => item.cod_available !== false);

  useEffect(() => {
    if (!isCodAvailable) {
      setPaymentMethod('Online');
    }
  }, [isCodAvailable]);

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user && user.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    const fetchCouponsAndSettings = async () => {
      try {
        const [couponsRes, settingsRes, chargesRes] = await Promise.all([
          axios.get('/api/coupons/active').catch(() => ({ data: [] })),
          axios.get('/api/settings').catch(() => ({ data: {} })),
          axios.get('/api/extracharges/active').catch(() => ({ data: [] }))
        ]);
        
        setAvailableCoupons(couponsRes.data || []);
        setActiveExtraCharges(chargesRes.data || []);
        
        if (settingsRes.data && settingsRes.data.SHIPPING_CHARGE !== undefined) {
          setShippingCharge(parseFloat(settingsRes.data.SHIPPING_CHARGE));
        }
      } catch (error) {
        console.error('Failed to fetch checkout data', error);
      }
    };
    fetchCouponsAndSettings();
  }, []);

  useEffect(() => {
    const checkPincode = async () => {
      if (formData.pincode.length === 6) {
        setPincodeStatus('checking');
        setPincodeMessage('');
        try {
          const res = await axios.get(`/api/pincodes/check/${formData.pincode}`);
          if (res.data.serviceable) {
            setPincodeStatus('success');
            if (res.data.details && res.data.details.estimated_days) {
              const days = Number(res.data.details.estimated_days);
              setPincodeMessage(`Delivery available! Expected in ${days} days.`);
              setEstimatedDeliveryDays(days);
            } else {
              setPincodeMessage('Delivery available to this pincode!');
              setEstimatedDeliveryDays(null);
            }
          } else {
            setPincodeStatus('error');
            setPincodeMessage(res.data.message || 'Sorry, we do not deliver to this pincode.');
            setEstimatedDeliveryDays(null);
          }
        } catch (error) {
          setPincodeStatus('error');
          setPincodeMessage(error.response?.data?.message || 'Sorry, we do not deliver to this pincode.');
          setEstimatedDeliveryDays(null);
        }
      } else {
        setPincodeStatus('idle');
        setPincodeMessage('');
        setEstimatedDeliveryDays(null);
      }
    };
    
    const timeoutId = setTimeout(() => {
      checkPincode();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [formData.pincode]);

  const handleApplyCoupon = async (codeToApply = couponCode) => {
    if (!codeToApply.trim()) return;
    
    setIsApplyingCoupon(true);
    setCouponError('');
    
    try {
      const { data } = await axios.post('/api/coupons/validate', {
        code: codeToApply,
        cartValue: cartTotal
      });
      
      setAppliedCoupon({
        ...data.coupon,
        calculatedDiscount: parseFloat(data.discountAmount)
      });
      setCouponCode(data.coupon.code);
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

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
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

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Real-time stripping of invalid characters
    if (name === 'phone' || name === 'alt_phone') {
      value = value.replace(/\D/g, '').slice(0, 10); // Only digits, max 10
    }
    if (name === 'pincode') {
      value = value.replace(/\D/g, '').slice(0, 6); // Only digits, max 6
    }

    setFormData({ ...formData, [name]: value });
    
    // Real-time validation
    const errors = { ...formErrors };
    
    if (name === 'phone' || name === 'alt_phone') {
      if (value.length > 0 && (!/^[6-9]\d{9}$/.test(value) || value.length < 10)) {
        errors[name] = "Please enter a valid 10-digit Indian mobile number starting with 6-9.";
      } else {
        delete errors[name];
      }
    }

    if (name === 'pincode') {
      if (value.length > 0 && value.length < 6) {
        errors.pincode = "Please enter exactly a 6-digit pin code.";
      } else {
        delete errors.pincode;
      }
    }

    if (name !== 'phone' && name !== 'alt_phone' && name !== 'pincode') {
      delete errors[name];
    }
    
    setFormErrors(errors);
  };

  const requestLocation = () => {
    setLocationStatus('requesting');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng });
          
          try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (res.data && res.data.address) {
              const address = res.data.address;
              
              setFormData(prev => {
                const newForm = { ...prev };
                
                const roadParts = [address.road, address.suburb, address.neighbourhood].filter(Boolean);
                if (roadParts.length > 0) newForm.address = roadParts.join(', ');
                
                const city = address.city || address.town || address.village || address.state_district;
                if (city) newForm.city = city.replace(' District', '');
                
                if (address.state_district) {
                  const dist = address.state_district.replace(' District', '');
                  const matchedDist = WB_DISTRICTS.find(d => d.toLowerCase() === dist.toLowerCase());
                  if (matchedDist) newForm.district = matchedDist;
                }
                
                if (address.postcode) newForm.pincode = address.postcode.replace(/\D/g, '').slice(0, 6);
                
                if (address.country) {
                  const matchedCountry = COUNTRIES.find(c => c.toLowerCase() === address.country.toLowerCase());
                  if (matchedCountry) newForm.country = matchedCountry;
                }
                
                return newForm;
              });
            }
          } catch (err) {
            console.error("Geocoding failed", err);
          }
          setLocationStatus('success');
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationStatus('error');
        }
      );
    } else {
      setLocationStatus('error');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Indian Mobile Number: 10 digits starting with 6-9
    const mobileRegex = /^[6-9]\d{9}$/;
    
    if (!mobileRegex.test(formData.phone)) {
      errors.phone = "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).";
    }

    if (formData.alt_phone && !mobileRegex.test(formData.alt_phone)) {
      errors.alt_phone = "Please enter a valid 10-digit Indian mobile number, or leave blank.";
    }

    // Pincode: exactly 6 digits
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(formData.pincode)) {
      errors.pincode = "Please enter exactly a 6-digit pin code.";
    }

    if (!formData.name.trim()) errors.name = "Full name is required.";
    if (!formData.address.trim()) errors.address = "Full address is required.";
    if (!formData.city.trim()) errors.city = "City/Area/Police station is required.";
    if (!formData.district) errors.district = "District is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateShipping = () => {
    if (cartItems.length === 0) return 0;
    
    let totalSpecificShipping = 0;
    let hasGlobalShippingItems = false;

    cartItems.forEach(item => {
      if (item.shipping_charge !== null && item.shipping_charge !== undefined) {
        totalSpecificShipping += Number(item.shipping_charge) * item.quantity;
      } else {
        hasGlobalShippingItems = true;
      }
    });

    return hasGlobalShippingItems ? totalSpecificShipping + shippingCharge : totalSpecificShipping;
  };

  const calculateExtraChargesTotal = () => {
    let total = 0;
    cartItems.forEach(item => {
      let charges = item.extra_charges;
      if (typeof charges === 'string') {
        try { charges = JSON.parse(charges); } catch(e) { charges = []; }
      }
      if (charges && Array.isArray(charges)) {
        charges.forEach(chargeId => {
          const charge = activeExtraCharges.find(c => c.id === chargeId);
          if (charge) {
            total += Number(charge.price) * item.quantity;
          }
        });
      }
    });
    return total;
  };

  const calculateTotalSaved = () => {
    let saved = 0;
    cartItems.forEach(item => {
      const regular = Number(item.discount_price) || 0;
      const sale = Number(item.price) || 0;
      if (regular > sale) {
        saved += (regular - sale) * item.quantity;
      }
    });
    if (appliedCoupon) {
      saved += appliedCoupon.calculatedDiscount;
    }
    return saved;
  };

  const actualShippingCharge = calculateShipping();
  const totalExtraCharges = calculateExtraChargesTotal();
  const totalSaved = calculateTotalSaved();

  const getExpectedDeliveryDate = () => {
    const minDate = new Date();
    const maxDate = new Date();
    
    if (estimatedDeliveryDays !== null) {
      if (estimatedDeliveryDays === 1) return "Tomorrow";
      if (estimatedDeliveryDays === 0) return "Today (Same Day)";
      
      minDate.setDate(minDate.getDate() + Math.max(1, estimatedDeliveryDays - 1));
      maxDate.setDate(maxDate.getDate() + estimatedDeliveryDays + 1);
    } else {
      minDate.setDate(minDate.getDate() + 3);
      maxDate.setDate(maxDate.getDate() + 5);
    }
    
    const options = { month: 'short', day: 'numeric' };
    return `${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage(null);
    
    if (cartItems.length === 0) {
      setSubmitMessage({ type: 'error', text: 'Your cart is empty!' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const pinRes = await axios.get(`/api/pincodes/check/${formData.pincode}`);
      if (!pinRes.data.serviceable) {
         setSubmitMessage({ type: 'error', text: pinRes.data.message || 'Sorry, we do not deliver to this pincode.' });
         setIsSubmitting(false);
         return;
      }
    } catch (error) {
       setSubmitMessage({ type: 'error', text: error.response?.data?.message || 'Sorry, we do not deliver to this pincode.' });
       setIsSubmitting(false);
       return;
    }

    const orderPayload = {
      customer_name: formData.name,
      customer_email: formData.email,
      customer_phone: formData.phone,
      alt_phone: formData.alt_phone || null,
      customer_address: formData.address,
      district: formData.district,
      city: formData.city,
      landmark: formData.landmark || null,
      pincode: formData.pincode,
      country: formData.country,
      order_notes: formData.order_notes || null,
      location_lat: location.lat,
      location_lng: location.lng,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      discountAmount: appliedCoupon ? appliedCoupon.calculatedDiscount : 0,
      orderItems: cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        image_url: item.image_url || item.images?.[0] || '',
        title: item.title,
        extra_charges: item.extra_charges
      })),
      cartTotal,
      actualShippingCharge,
      totalExtraCharges,
      totalSaved,
      estimated_delivery_time: getExpectedDeliveryDate(),
      total_amount: cartTotal - (appliedCoupon ? appliedCoupon.calculatedDiscount : 0) + (cartTotal > 0 ? actualShippingCharge + totalExtraCharges : 0)
    };

    setIsSubmitting(false);
    navigate('/payment', { state: { checkoutData: orderPayload, availableCoupons, appliedCoupon } });
    window.scrollTo(0, 0);
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <div className="lg:w-2/3">
          <div className="flex items-center space-x-4 mb-8">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
          </div>

          {submitMessage && submitMessage.type === 'error' && (
            <div className="mb-6 p-4 rounded-xl flex bg-red-50 border border-red-200 text-red-800">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <p className="font-medium">{submitMessage.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Contact Information */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-semibold mb-4 border-b pb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    readOnly={!!user}
                    className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${!!user ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}`} 
                  />
                  {!!user && <p className="text-xs text-amber-600 mt-1">Logged in as {user.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
                  <input type="text" name="phone" placeholder="10-digit number" value={formData.phone} onChange={handleChange} required className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${formErrors.phone ? 'border-red-500' : 'border-slate-200'}`} />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Alternative Mobile Number (Optional)</label>
                  <input type="text" name="alt_phone" placeholder="10-digit number" value={formData.alt_phone} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${formErrors.alt_phone ? 'border-red-500' : 'border-slate-200'}`} />
                  {formErrors.alt_phone && <p className="text-red-500 text-xs mt-1">{formErrors.alt_phone}</p>}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                <h2 className="text-xl font-semibold">Shipping Address</h2>
                <button 
                  type="button" 
                  onClick={requestLocation}
                  className={`text-sm flex items-center px-3 py-1.5 rounded-lg border transition-colors ${
                    locationStatus === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                    locationStatus === 'requesting' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                    'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                  }`}
                >
                  <MapPin className="w-4 h-4 mr-1.5" />
                  {locationStatus === 'success' ? 'Location Acquired' : 
                   locationStatus === 'requesting' ? 'Requesting...' : 
                   locationStatus === 'error' ? 'Location Failed - Try Again' : 'Use Current Location'}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Address *</label>
                  <input type="text" name="address" placeholder="House/Flat No, Building, Street" value={formData.address} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">District *</label>
                    <select name="district" value={formData.district} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white">
                      {WB_DISTRICTS.map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City/Area/Police station *</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                    {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Landmark (Optional)</label>
                    <input type="text" name="landmark" placeholder="Near famous place, temple, etc." value={formData.landmark} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pin Code *</label>
                    <input type="text" name="pincode" placeholder="6-digit pin code" value={formData.pincode} onChange={handleChange} required className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${formErrors.pincode || pincodeStatus === 'error' ? 'border-red-500' : pincodeStatus === 'success' ? 'border-green-500' : 'border-slate-200'}`} />
                    {formErrors.pincode && <p className="text-red-500 text-xs mt-1">{formErrors.pincode}</p>}
                    {!formErrors.pincode && pincodeStatus === 'checking' && <p className="text-amber-600 text-xs mt-1">Checking delivery availability...</p>}
                    {!formErrors.pincode && pincodeStatus === 'success' && <p className="text-green-600 text-xs mt-1 flex items-center"><ShieldCheck className="w-3 h-3 mr-1"/> {pincodeMessage}</p>}
                    {!formErrors.pincode && pincodeStatus === 'error' && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> {pincodeMessage}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country *</label>
                  <select name="country" value={formData.country} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white">
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Order Notes (Optional)</label>
                  <textarea name="order_notes" rows="3" placeholder="Notes about your order, e.g. special notes for delivery." value={formData.order_notes} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none"></textarea>
                </div>
              </div>
            </div>



            <button type="submit" disabled={isSubmitting || cartItems.length === 0 || pincodeStatus === 'error' || pincodeStatus === 'checking'} className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-amber-700 transition-colors shadow-lg hover:shadow-amber-500/30 disabled:opacity-70 disabled:cursor-not-allowed mt-6">
              {isSubmitting ? 'Processing...' : 'Continue to Payment'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
            <h2 className="text-xl font-semibold mb-4 border-b pb-4">Order Summary</h2>
            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
              {/* Cart Items */}
              {cartItems.length === 0 ? (
                <div className="text-center py-4 text-slate-500">
                  Your cart is empty.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image_url || item.images?.[0] || 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=100'} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-medium text-slate-900 line-clamp-1">{item.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <input 
                          type="number"
                          min="1"
                          max={Math.max(100, item.stock || 100)}
                          value={item.quantity} 
                          onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                          className="w-16 text-center text-xs border border-slate-200 rounded px-1 py-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="font-semibold text-slate-900 text-sm flex flex-col items-end">
                      {item.discount_price && (
                        <span className="text-xs text-slate-400 line-through font-medium">₹{(item.discount_price * item.quantity).toFixed(2)}</span>
                      )}
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      {item.discount_price && (
                        <span className="text-xs text-green-600 font-bold bg-green-50 px-1 rounded mt-0.5 whitespace-nowrap">Save ₹{((item.discount_price - item.price) * item.quantity).toFixed(2)}</span>
                      )}
                      {(() => {
                        let charges = item.extra_charges;
                        if (typeof charges === 'string') {
                          try { charges = JSON.parse(charges); } catch(e) { charges = []; }
                        }
                        if (charges && Array.isArray(charges)) {
                          return charges.map(chargeId => {
                            const charge = activeExtraCharges.find(c => c.id === chargeId);
                            if (charge) {
                              return (
                                <span key={charge.id} className="text-xs text-amber-600 font-medium">
                                  + ₹{(Number(charge.price) * item.quantity).toFixed(2)} ({charge.name})
                                </span>
                              );
                            }
                            return null;
                          });
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Coupon Section */}
            {cartItems.length > 0 && (
              <div className="border-t border-slate-100 py-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-amber-600" /> Apply Coupon
                </h3>
                
                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-green-800 uppercase">{appliedCoupon.code}</p>
                      <p className="text-xs text-green-600">
                        {appliedCoupon.discountType === 'PERCENTAGE' 
                          ? `${appliedCoupon.discountValue}% off applied` 
                          : `₹${appliedCoupon.discountValue} off applied`}
                      </p>
                    </div>
                    <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code" 
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm uppercase"
                      />
                      <button 
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={isApplyingCoupon || !couponCode}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-70 transition-colors"
                      >
                        {isApplyingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}

                    {availableCoupons.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium text-slate-500">Available Coupons:</p>
                        <div className="flex flex-col gap-2">
                          {availableCoupons.map(coupon => (
                            <div key={coupon.id} className="flex flex-col border border-amber-200 bg-amber-50 rounded-lg p-3 border-dashed">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-amber-800 uppercase tracking-wider">{coupon.code}</span>
                                <button 
                                  type="button"
                                  onClick={() => handleApplyCoupon(coupon.code)}
                                  className="text-xs bg-amber-600 text-white font-semibold px-3 py-1 rounded hover:bg-amber-700 transition-colors shadow-sm"
                                >
                                  Apply
                                </button>
                              </div>
                              {coupon.description && (
                                <p className="text-xs text-amber-700 mt-1.5">{coupon.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 text-sm font-medium">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{appliedCoupon.calculatedDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 text-sm">
                <span>Shipping</span>
                <span>{cartTotal > 0 ? `₹${actualShippingCharge.toFixed(2)}` : '₹0.00'}</span>
              </div>
              
              {totalExtraCharges > 0 && (
                <div className="flex justify-between text-amber-600 text-sm font-medium">
                  <span>Extra Charges</span>
                  <span>+₹{totalExtraCharges.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-900 font-bold text-lg pt-3 border-t border-slate-100 mt-2">
                <span>Total</span>
                <span>₹{cartTotal > 0 ? (cartTotal - (appliedCoupon ? appliedCoupon.calculatedDiscount : 0) + actualShippingCharge + totalExtraCharges).toFixed(2) : '0.00'}</span>
              </div>
              
              {totalSaved > 0 && cartTotal > 0 && (
                <div className="flex justify-between font-bold text-sm text-green-700 bg-green-50 p-3 rounded-xl mt-2 border border-green-100">
                  <span>Total Saved on this order</span>
                  <span>₹{totalSaved.toFixed(2)}</span>
                </div>
              )}

              {/* Expected Delivery Date */}
              {cartTotal > 0 && (
                <div className="flex items-center justify-between text-sm text-blue-700 bg-blue-50 p-3 rounded-xl mt-3 border border-blue-100">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4" />
                    <span className="font-medium">Expected Delivery:</span>
                  </div>
                  <span className="font-bold">{getExpectedDeliveryDate()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
