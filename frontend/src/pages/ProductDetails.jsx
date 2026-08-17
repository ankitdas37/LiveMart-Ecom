import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Minus, Plus, ShoppingCart, ShieldCheck, Truck, RotateCcw, Heart, Share2, ArrowLeft, XCircle, MapPin, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const ProductDetails = () => {
  const { addToCart, cartItems } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const isInCart = product && cartItems.some(item => item.id === product.id);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('about');

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState('idle');
  const [pincodeMessage, setPincodeMessage] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const checkDeliveryPincode = async () => {
    if (deliveryPincode.length !== 6) return;
    setPincodeStatus('checking');
    setPincodeMessage('');
    setDeliveryEstimate(null);
    try {
      const res = await axios.get(`/api/pincodes/check/${deliveryPincode}`);
      if (res.data.serviceable) {
        setPincodeStatus('success');
        if (res.data.details && res.data.details.estimated_days !== null && res.data.details.estimated_days !== undefined) {
          const days = Number(res.data.details.estimated_days);
          if (days === 1) {
            setDeliveryEstimate(`Expected Delivery: Tomorrow`);
          } else if (days === 0) {
            setDeliveryEstimate(`Expected Delivery: Today (Same Day)`);
          } else {
            const minDate = new Date();
            const maxDate = new Date();
            minDate.setDate(minDate.getDate() + Math.max(1, days - 1));
            maxDate.setDate(maxDate.getDate() + days + 1);
            const options = { month: 'short', day: 'numeric' };
            setDeliveryEstimate(`Expected by ${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)}`);
          }
        } else {
          const minDate = new Date();
          minDate.setDate(minDate.getDate() + 3);
          const maxDate = new Date();
          maxDate.setDate(maxDate.getDate() + 5);
          const options = { month: 'short', day: 'numeric' };
          setDeliveryEstimate(`Expected by ${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)}`);
        }
      } else {
        setPincodeStatus('error');
        setPincodeMessage(res.data.message || 'Not serviceable in this area.');
      }
    } catch (error) {
      setPincodeStatus('error');
      setPincodeMessage(error.response?.data?.message || 'Invalid pincode.');
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        setProduct(res.data);
        if (res.data.min_order_quantity && res.data.min_order_quantity > 1) {
          setQuantity(res.data.min_order_quantity);
        }
      } catch (error) {
        console.error('Failed to fetch product', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const checkWishlist = async () => {
      if (user && product) {
        try {
          const res = await axios.get('/api/wishlist', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          const inWishlist = res.data.some(item => item.productId === product.id);
          setIsWishlisted(inWishlist);
        } catch (error) {
          console.error(error);
        }
      }
    };
    checkWishlist();
  }, [user, product]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (!product || !product.images || product.images.length <= 1) return;

      if (e.key === 'ArrowLeft') {
        setActiveImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product]);

  const handleQuantityChange = (type) => {
    const minQty = product?.min_order_quantity || 1;
    if (type === 'dec' && quantity > minQty) {
      setQuantity(q => q - 1);
    } else if (type === 'inc' && quantity < product.stock) {
      setQuantity(q => q + 1);
    }
  };

  const handleQuantityInput = (e) => {
    const val = parseInt(e.target.value);
    const minQty = product?.min_order_quantity || 1;
    if (!isNaN(val) && val >= minQty && val <= product.stock) {
      setQuantity(val);
    } else if (e.target.value === '') {
      setQuantity('');
    }
  };

  const handleQuantityBlur = () => {
    const minQty = product?.min_order_quantity || 1;
    if (quantity === '' || quantity < minQty) setQuantity(minQty);
  };

  const handleOrderNow = () => {
    addToCart(product, parseInt(quantity) || 1);
    navigate('/checkout');
  };

  const handleAddToCart = () => {
    if (isInCart) {
      navigate('/checkout');
      return;
    }

    addToCart(product, parseInt(quantity) || 1);
    toast((t) => (
      <div className="flex items-center justify-between gap-4">
        <span className="font-medium text-white">🛍️ Added to your cart!</span>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            navigate('/checkout');
          }}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold shadow-sm transition-colors whitespace-nowrap"
        >
          Go to Cart
        </button>
      </div>
    ), { duration: 4000 });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this amazing product: ${product.title}`,
          url: url,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please log in or create an account to add items to your wishlist.');
      navigate('/login');
      return;
    }

    setWishlistLoading(true);
    try {
      const res = await axios.post(
        '/api/wishlist',
        { productId: product.id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setIsWishlisted(res.data.added);
    } catch (error) {
      console.error(error);
      alert('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit a review.');
      return navigate('/login');
    }

    setSubmittingReview(true);
    try {
      await axios.post(
        '/api/reviews',
        { productId: product.id, rating: reviewRating, comment: reviewComment },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success('Review submitted successfully!');
      setReviewComment('');
      setReviewRating(5);
      // Refresh product to get new reviews
      const res = await axios.get(`/api/products/${id}`);
      setProduct(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 text-center transition-colors duration-300">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Product Not Found</h2>
        <button onClick={() => navigate('/shop')} className="px-6 py-3 bg-amber-600 text-white rounded-xl">
          Return to Shop
        </button>
      </div>
    );
  }

  // Filter out empty/null URL entries that come from the admin product form
  const validImages = (product.images || []).filter(img => img && img.trim() !== '');
  const mainImage = validImages.length > 0 ? validImages[activeImage] ?? validImages[0] : null;

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && validImages.length > 1) {
      setActiveImage(prev => (prev === validImages.length - 1 ? 0 : prev + 1));
    }
    if (isRightSwipe && validImages.length > 1) {
      setActiveImage(prev => (prev === 0 ? validImages.length - 1 : prev - 1));
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen py-4 sm:py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <nav className="flex items-center flex-wrap gap-y-2 text-sm text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 space-x-2">
          <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Link to="/" className="hover:text-amber-600 dark:hover:text-amber-500">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-amber-600 dark:hover:text-amber-500">Shop</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-200 font-medium truncate max-w-[150px] sm:max-w-[200px]">{product.title}</span>
        </nav>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          <div className="flex flex-col lg:flex-row">

            <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-10 lg:border-r border-slate-100 dark:border-slate-700">
              <div 
                className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 mb-4 relative group"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.title}
                    className="w-full h-full object-contain p-4 mix-blend-multiply dark:mix-blend-normal"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400"></div>
                )}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={toggleWishlist}
                    disabled={wishlistLoading}
                    className="w-10 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-400 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 shadow-sm transition-all"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500 dark:text-red-400 dark:fill-red-400' : ''}`} />
                  </button>
                  <button onClick={handleShare} className="w-10 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-400 dark:text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/20 shadow-sm transition-all">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {validImages.length > 1 && (
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {validImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 bg-slate-50 dark:bg-slate-900 ${activeImage === idx ? 'border-amber-500' : 'border-transparent opacity-60 hover:opacity-100 transition-opacity'}`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx}`}
                        className="w-full h-full object-contain p-1 mix-blend-multiply dark:mix-blend-normal"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-10 flex flex-col">
              <div className="mb-4">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">{product.title}</h1>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base sm:text-lg lg:text-xl font-medium">{product.description}</p>
              </div>

              <div className="mb-6 flex flex-col space-y-1">
                <div className="flex flex-wrap items-end gap-3 sm:gap-4">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">₹{product.price}</span>
                  {product.discount_price && (
                    <>
                      <span className="text-lg sm:text-xl font-medium text-slate-400 dark:text-slate-500 line-through mb-1">₹{product.discount_price}</span>
                      <span className="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded mb-1 border border-green-100 dark:border-green-800/50">
                        Save ₹{(product.discount_price - product.price).toFixed(0)}
                      </span>
                    </>
                  )}
                </div>
                {product.shipping_charge !== null && product.shipping_charge !== undefined && (
                  <span className={`text-sm font-medium mt-1 ${product.shipping_charge > 0 ? 'text-slate-500 dark:text-slate-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {product.shipping_charge > 0 ? `+ ₹${product.shipping_charge} Shipping` : 'Free Shipping'}
                  </span>
                )}
              </div>

              <div className="mb-6 sm:mb-8 flex items-center space-x-4">
                <div className="flex items-center bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-1" />
                  <span className="font-bold text-amber-700 dark:text-amber-400 text-sm">{product.rating || '0.0'}</span>
                </div>
                <a href="#reviews" className="text-sm font-medium text-slate-500 dark:text-slate-400 underline hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                  {product.reviews_count || 0} Reviews
                </a>
              </div>

              <hr className="border-slate-100 dark:border-slate-700 mb-6 sm:mb-8" />

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 uppercase flex items-center">
                    Quantity
                    {product?.min_order_quantity > 1 && (
                      <span className="ml-2 text-xs font-medium text-amber-600 dark:text-amber-400 normal-case bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                        Min {product.min_order_quantity} required
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 p-1 w-32 sm:w-36">
                    <button
                      onClick={() => handleQuantityChange('dec')}
                      disabled={quantity <= (product?.min_order_quantity || 1)}
                      className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityInput}
                      onBlur={handleQuantityBlur}
                      min="1"
                      max={product.stock}
                      className="w-full text-center bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                    <button
                      onClick={() => handleQuantityChange('inc')}
                      disabled={quantity >= product.stock}
                      className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="sm:pt-7">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${product.stock > 10 ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'}`}></div>
                    {product.stock > 0 ? `${product.stock} items left` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10 w-full">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock < 1 && !isInCart}
                  className={`flex-1 w-full ${isInCart ? 'bg-amber-500 hover:bg-amber-600 text-white border-transparent' : 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'} border px-4 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg disabled:opacity-50 flex items-center justify-center transition-colors active:scale-[0.98]`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isInCart ? 'Go to Cart' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleOrderNow}
                  disabled={product.stock < 1}
                  className="flex-1 w-full bg-amber-600 hover:bg-amber-700 text-white px-4 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg disabled:opacity-50 flex items-center justify-center transition-colors active:scale-[0.98]"
                >
                  {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                </button>
              </div>

              {/* Delivery Check Section */}
              <div className="mb-8 sm:mb-10 bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center mb-3">
                  <MapPin className="w-5 h-5 text-slate-500 dark:text-slate-400 mr-2" />
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Check Delivery Availability</h4>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={deliveryPincode}
                    onChange={(e) => setDeliveryPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && deliveryPincode.length === 6 && pincodeStatus !== 'checking') {
                        checkDeliveryPincode();
                      }
                    }}
                    placeholder="Enter 6-digit PIN code"
                    className="flex-1 w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm dark:text-white transition-all"
                  />
                  <button
                    onClick={checkDeliveryPincode}
                    disabled={deliveryPincode.length !== 6 || pincodeStatus === 'checking'}
                    className="w-full sm:w-auto bg-slate-800 dark:bg-slate-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                  >
                    Check
                  </button>
                </div>
                {pincodeStatus === 'checking' && <p className="text-amber-600 dark:text-amber-500 text-xs mt-3">Checking availability...</p>}
                {pincodeStatus === 'success' && (
                  <div className="mt-3 text-sm">
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center mb-1"><ShieldCheck className="w-4 h-4 mr-1" /> Delivery available</p>
                    {deliveryEstimate && <p className="text-slate-600 dark:text-slate-400 font-medium ml-5">{deliveryEstimate}</p>}
                  </div>
                )}
                {pincodeStatus === 'error' && <p className="text-red-500 dark:text-red-400 text-xs mt-3 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {pincodeMessage}</p>}
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t border-slate-100 dark:border-slate-700 pt-6 sm:pt-8 mt-auto">
                <div className="flex flex-col items-center text-center p-2 sm:p-3">
                  <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h5 className="text-[11px] sm:text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 leading-tight">Secure Payment</h5>
                </div>
                <div className={`flex flex-col items-center text-center p-2 sm:p-3 ${product.cod_available === false ? 'opacity-50' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 sm:mb-3 ${product.cod_available === false ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                    {product.cod_available === false ? <XCircle className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                  </div>
                  <h5 className="text-[11px] sm:text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 leading-tight">
                    {product.cod_available === false ? 'Prepaid Only' : 'Cash on Delivery'}
                  </h5>
                  {product.cod_available === false && <p className="hidden sm:block text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">COD not available</p>}
                </div>
                <div className="flex flex-col items-center text-center p-2 sm:p-3">
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <h5 className="text-[11px] sm:text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 leading-tight">
                    {product.return_policy && product.replacement_policy ? 'Return & Replace'
                      : product.return_policy ? 'Returns'
                        : product.replacement_policy ? 'Replacements'
                          : 'No Returns'}
                  </h5>
                  <p className="hidden sm:block text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                    {product.return_policy && product.replacement_policy ? 'Available'
                      : product.return_policy || product.replacement_policy || 'Non-returnable'}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-6 lg:p-10 transition-colors duration-300" id="reviews">

          <div className="flex space-x-6 sm:space-x-8 border-b border-slate-200 dark:border-slate-700 mb-6 sm:mb-8 overflow-x-auto scrollbar-hide pb-1">
            {['about', 'specifications', 'policies', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm sm:text-base font-bold tracking-wide capitalize whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-amber-600 dark:text-amber-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
              >
                {tab} {tab === 'reviews' && <span className="ml-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-0.5 px-2 rounded-full text-xs">{product.reviews_count || 0}</span>}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-amber-600 dark:bg-amber-500 rounded-t-full"></span>
                )}
              </button>
            ))}
          </div>

          <div className="prose dark:prose-invert max-w-none">
            {activeTab === 'about' && (
              <div className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl text-sm sm:text-base">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">About this product</h3>
                {product.about_text ? (
                  <p className="whitespace-pre-line">{product.about_text}</p>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 italic">No detailed description provided.</p>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="max-w-3xl text-sm sm:text-base">
                {product.specifications && product.specifications.length > 0 ? (
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">Specifications</h3>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {product.specifications.map((spec, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-slate-50 dark:bg-slate-900/50' : 'bg-white dark:bg-slate-800'}>
                              <th className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200 w-1/3 border-r border-slate-200 dark:border-slate-700">{spec.key}</th>
                              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{spec.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">No specifications available for this product.</p>
                )}
              </div>
            )}

            {activeTab === 'policies' && (
              <div className="max-w-3xl text-sm sm:text-base">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">Store Policies</h3>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                  <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                    {product.return_policy && (
                      <li>
                        <strong className="block text-slate-900 dark:text-slate-200 text-base mb-1">Returns Policy</strong>
                        {product.return_policy}
                      </li>
                    )}
                    {product.replacement_policy && (
                      <li>
                        <strong className="block text-slate-900 dark:text-slate-200 text-base mb-1">Replacement Policy</strong>
                        {product.replacement_policy}
                      </li>
                    )}
                    {!product.return_policy && !product.replacement_policy && (
                      <li>
                        <strong className="block text-slate-900 dark:text-slate-200 text-base mb-1">Non-returnable</strong>
                        This product cannot be returned or replaced.
                      </li>
                    )}
                  </ul>
                  {product.policy_details && (
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                      <strong className="block text-slate-900 dark:text-slate-200 text-sm mb-2 uppercase tracking-wide">Additional Policy Details</strong>
                      <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                        {product.policy_details}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-4xl text-sm sm:text-base">
                <div className="flex flex-col md:flex-row items-start md:items-center mb-6 sm:mb-8 bg-amber-50 dark:bg-amber-900/10 p-4 sm:p-6 rounded-2xl gap-4 sm:gap-6 border border-amber-100 dark:border-amber-900/30">
                  <div className="text-center md:pr-8 md:border-r border-amber-200 dark:border-amber-800/50 w-full md:w-auto">
                    <div className="text-4xl sm:text-5xl font-black text-amber-700 dark:text-amber-500 mb-1 sm:mb-2">{product.rating || '0.0'}</div>
                    <div className="flex text-amber-500 mb-1 justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <div className="text-xs sm:text-sm text-amber-800 dark:text-amber-600 font-medium">{product.reviews_count || 0} Reviews</div>
                  </div>

                  <div className="flex-1 w-full">
                    <form onSubmit={submitReview} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-amber-100 dark:border-slate-700 shadow-sm">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-sm sm:text-base">Write a Review</h4>
                      <div className="flex mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="p-1 focus:outline-none hover:scale-110 transition-transform"
                          >
                            <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-600'}`} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        required
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none mb-3 text-sm dark:text-white placeholder-slate-400 dark:placeholder-slate-500 h-24 resize-none transition-colors"
                      ></textarea>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="w-full sm:w-auto bg-amber-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-amber-700 disabled:opacity-50 text-sm transition-colors"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="space-y-6">
                  {product.Reviews && product.Reviews.length > 0 ? (
                    product.Reviews.map(review => (
                      <div key={review.id} className="border-b border-slate-100 dark:border-slate-700/50 pb-6 last:border-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {review.User?.profile_pic ? (
                              <img src={review.User.profile_pic} alt="Avatar" className="w-8 sm:w-10 h-8 sm:h-10 rounded-full object-cover shadow-sm" />
                            ) : (
                              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm shadow-sm">
                                {review.User?.name?.charAt(0) || 'U'}
                              </div>
                            )}
                            <div className="font-bold text-slate-900 dark:text-slate-200 text-sm sm:text-base">{review.User?.name || 'Anonymous User'}</div>
                          </div>
                          <div className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-medium">{new Date(review.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="flex text-amber-500 mb-2 ml-[44px] sm:ml-[52px]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${i < review.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`} />
                          ))}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 ml-[44px] sm:ml-[52px] text-sm sm:text-base leading-relaxed">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-500 dark:text-slate-400 py-8 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      No reviews yet. Be the first to review this product!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
