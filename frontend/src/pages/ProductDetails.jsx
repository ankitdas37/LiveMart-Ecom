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
    if (type === 'dec' && quantity > 1) {
      setQuantity(q => q - 1);
    } else if (type === 'inc' && quantity < product.stock) {
      setQuantity(q => q + 1);
    }
  };

  const handleQuantityInput = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0 && val <= product.stock) {
      setQuantity(val);
    } else if (e.target.value === '') {
      setQuantity('');
    }
  };

  const handleQuantityBlur = () => {
    if (quantity === '' || quantity < 1) setQuantity(1);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <button onClick={() => navigate('/shop')} className="px-6 py-3 bg-amber-600 text-white rounded-xl">
          Return to Shop
        </button>
      </div>
    );
  }

  // Filter out empty/null URL entries that come from the admin product form
  const validImages = (product.images || []).filter(img => img && img.trim() !== '');
  const mainImage = validImages.length > 0 ? validImages[activeImage] ?? validImages[0] : null;

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <nav className="flex items-center text-sm text-slate-500 mb-8 space-x-2">
          <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-200">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-amber-600">Shop</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium truncate">{product.title}</span>
        </nav>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row">

            <div className="w-full lg:w-1/2 p-6 lg:p-10 lg:border-r border-slate-100">
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-4 relative group">
                <img
                  src={mainImage || 'https://placehold.co/600x600?text=No+Image'}
                  alt={product.title}
                  className="w-full h-full object-contain p-4"
                  onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x600?text=No+Image'; }}
                />
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={toggleWishlist}
                    disabled={wishlistLoading}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 shadow-sm"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                  <button onClick={handleShare} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 shadow-sm">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {validImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {validImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 ${activeImage === idx ? 'border-amber-500' : 'border-transparent opacity-60'}`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx}`}
                        className="w-full h-full object-contain p-1"
                        onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=Img'; }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full lg:w-1/2 p-6 lg:p-10 flex flex-col">
              <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">{product.title}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-1" />
                    <span className="font-bold text-amber-700 text-sm">{product.rating || '0.0'}</span>
                  </div>
                  <a href="#reviews" className="text-sm font-medium text-slate-500 underline">
                    {product.reviews_count || 0} Reviews
                  </a>
                </div>
              </div>

              <div className="mb-8 flex flex-col space-y-1">
                <div className="flex items-end space-x-4">
                  <span className="text-4xl font-black text-slate-900">₹{product.price}</span>
                  {product.discount_price && (
                    <>
                      <span className="text-xl font-medium text-slate-400 line-through mb-1">₹{product.discount_price}</span>
                      <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded mb-1">
                        Save ₹{(product.discount_price - product.price).toFixed(0)}
                      </span>
                    </>
                  )}
                </div>
                {product.shipping_charge !== null && product.shipping_charge !== undefined && (
                  <span className={`text-sm font-medium ${product.shipping_charge > 0 ? 'text-slate-500' : 'text-emerald-600'}`}>
                    {product.shipping_charge > 0 ? `+ ₹${product.shipping_charge} Shipping` : 'Free Shipping'}
                  </span>
                )}
              </div>

              <p className="text-slate-600 leading-relaxed mb-8">{product.description}</p>

              <hr className="border-slate-100 mb-8" />

              <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase">Quantity</h4>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1 w-36">
                    <button
                      onClick={() => handleQuantityChange('dec')}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-white rounded-lg disabled:opacity-50"
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
                      className="w-full text-center bg-transparent font-bold text-slate-900 focus:outline-none"
                    />
                    <button
                      onClick={() => handleQuantityChange('inc')}
                      disabled={quantity >= product.stock}
                      className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-white rounded-lg disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="sm:pt-7">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${product.stock > 10 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {product.stock > 0 ? `${product.stock} items left` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock < 1 && !isInCart}
                  className={`flex-1 ${isInCart ? 'bg-amber-500 hover:bg-amber-600 text-white border-transparent' : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-200'} border px-8 py-4 rounded-xl font-bold text-lg disabled:opacity-50 flex items-center justify-center transition-colors`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isInCart ? 'Go to Cart' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleOrderNow}
                  disabled={product.stock < 1}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-xl font-bold text-lg disabled:opacity-50 flex items-center justify-center transition-colors"
                >
                  {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                </button>
              </div>

              {/* Delivery Check Section */}
              <div className="mb-10 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="flex items-center mb-3">
                  <MapPin className="w-5 h-5 text-slate-500 mr-2" />
                  <h4 className="font-bold text-slate-800 text-sm">Check Delivery Availability</h4>
                </div>
                <div className="flex space-x-2">
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
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                  />
                  <button
                    onClick={checkDeliveryPincode}
                    disabled={deliveryPincode.length !== 6 || pincodeStatus === 'checking'}
                    className="bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-900 transition-colors disabled:opacity-50"
                  >
                    Check
                  </button>
                </div>
                {pincodeStatus === 'checking' && <p className="text-amber-600 text-xs mt-3">Checking availability...</p>}
                {pincodeStatus === 'success' && (
                  <div className="mt-3 text-sm">
                    <p className="text-emerald-600 font-bold flex items-center mb-1"><ShieldCheck className="w-4 h-4 mr-1" /> Delivery available</p>
                    {deliveryEstimate && <p className="text-slate-600 font-medium ml-5">{deliveryEstimate}</p>}
                  </div>
                )}
                {pincodeStatus === 'error' && <p className="text-red-500 text-xs mt-3 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {pincodeMessage}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-8 mt-auto">
                <div className="flex flex-col items-center text-center p-3">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h5 className="text-sm font-bold text-slate-900 mb-1">Secure Payment</h5>
                </div>
                <div className={`flex flex-col items-center text-center p-3 ${product.cod_available === false ? 'opacity-50' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${product.cod_available === false ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                    {product.cod_available === false ? <XCircle className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                  </div>
                  <h5 className="text-sm font-bold text-slate-900 mb-1">
                    {product.cod_available === false ? 'Prepaid Only' : 'Cash on Delivery'}
                  </h5>
                  {product.cod_available === false && <p className="text-xs text-slate-500">COD not available</p>}
                </div>
                <div className="flex flex-col items-center text-center p-3">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <h5 className="text-sm font-bold text-slate-900 mb-1">
                    {product.return_policy && product.replacement_policy ? 'Return & Replace'
                      : product.return_policy ? 'Returns'
                        : product.replacement_policy ? 'Replacements'
                          : 'No Returns'}
                  </h5>
                  <p className="text-xs text-slate-500">
                    {product.return_policy && product.replacement_policy ? 'Available'
                      : product.return_policy || product.replacement_policy || 'Non-returnable'}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 lg:p-10" id="reviews">

          <div className="flex space-x-8 border-b border-slate-200 mb-8 overflow-x-auto scrollbar-hide">
            {['about', 'specifications', 'policies', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-base font-bold tracking-wide capitalize whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-amber-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {tab} {tab === 'reviews' && <span className="ml-1 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{product.reviews_count || 0}</span>}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-amber-600 rounded-t-full"></span>
                )}
              </button>
            ))}
          </div>

          <div className="prose max-w-none">
            {activeTab === 'about' && (
              <div className="text-slate-600 leading-relaxed max-w-3xl">
                <h3 className="text-xl font-bold text-slate-900 mb-4">About this product</h3>
                {product.about_text ? (
                  <p className="whitespace-pre-line">{product.about_text}</p>
                ) : (
                  <p className="text-slate-500 italic">No detailed description provided.</p>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="max-w-3xl">
                {product.specifications && product.specifications.length > 0 ? (
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Specifications</h3>
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <tbody className="divide-y divide-slate-200">
                          {product.specifications.map((spec, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                              <th className="px-4 py-3 font-medium text-slate-900 w-1/3 border-r border-slate-200">{spec.key}</th>
                              <td className="px-4 py-3 text-slate-600">{spec.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500">No specifications available for this product.</p>
                )}
              </div>
            )}

            {activeTab === 'policies' && (
              <div className="max-w-3xl">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Store Policies</h3>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <ul className="space-y-4 text-sm text-slate-600">
                    {product.return_policy && (
                      <li>
                        <strong className="block text-slate-900 text-base mb-1">Returns Policy</strong>
                        {product.return_policy}
                      </li>
                    )}
                    {product.replacement_policy && (
                      <li>
                        <strong className="block text-slate-900 text-base mb-1">Replacement Policy</strong>
                        {product.replacement_policy}
                      </li>
                    )}
                    {!product.return_policy && !product.replacement_policy && (
                      <li>
                        <strong className="block text-slate-900 text-base mb-1">Non-returnable</strong>
                        This product cannot be returned or replaced.
                      </li>
                    )}
                  </ul>
                  {product.policy_details && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <strong className="block text-slate-900 text-sm mb-2 uppercase tracking-wide">Additional Policy Details</strong>
                      <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                        {product.policy_details}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-4xl">
                <div className="flex flex-col md:flex-row items-start md:items-center mb-8 bg-amber-50 p-6 rounded-2xl gap-6">
                  <div className="text-center md:pr-8 md:border-r border-amber-200 w-full md:w-auto">
                    <div className="text-5xl font-black text-amber-700 mb-2">{product.rating || '0.0'}</div>
                    <div className="flex text-amber-500 mb-1 justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <div className="text-sm text-amber-800 font-medium">{product.reviews_count || 0} Reviews</div>
                  </div>

                  <div className="flex-1 w-full">
                    <form onSubmit={submitReview} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                      <h4 className="font-bold text-slate-900 mb-3">Write a Review</h4>
                      <div className="flex mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="p-1 focus:outline-none"
                          >
                            <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        required
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-amber-500 focus:border-amber-500 mb-3 text-sm h-24"
                      ></textarea>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="bg-amber-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 text-sm"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="space-y-6">
                  {product.Reviews && product.Reviews.length > 0 ? (
                    product.Reviews.map(review => (
                      <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {review.User?.profile_pic ? (
                              <img src={review.User.profile_pic} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                                {review.User?.name?.charAt(0) || 'U'}
                              </div>
                            )}
                            <div className="font-bold text-slate-900">{review.User?.name || 'Anonymous User'}</div>
                          </div>
                          <div className="text-sm text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="flex text-amber-500 mb-3 ml-11">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                          ))}
                        </div>
                        <p className="text-slate-600 ml-11">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-500 py-8">
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
