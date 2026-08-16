import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Circle, CircleDot, Search, MapPin, Truck, Camera, Mic, Home as HomeIcon, ChevronDown, Sparkles } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bestSellerTitle, setBestSellerTitle] = useState("Best Sellers");
  const [bestSellerSubtitle, setBestSellerSubtitle] = useState("Our most loved products");
  const [heroSlides, setHeroSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Mobile Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showCameraAlert, setShowCameraAlert] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [catRes, prodRes, settingsRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/products'),
          axios.get('/api/settings').catch(() => ({ data: {} }))
        ]);

        if (settingsRes.data && settingsRes.data.HERO_SLIDES) {
          try {
            const parsed = JSON.parse(settingsRes.data.HERO_SLIDES);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setHeroSlides(parsed);
            }
          } catch (e) { console.error('Failed parsing slides', e); }
        }
        if (settingsRes.data?.BEST_SELLER_TITLE) setBestSellerTitle(settingsRes.data.BEST_SELLER_TITLE);
        if (settingsRes.data?.BEST_SELLER_SUBTITLE) setBestSellerSubtitle(settingsRes.data.BEST_SELLER_SUBTITLE);

        // Filter published categories
        const activeCategories = catRes.data.filter(c => c.is_published && !c.is_paused);
        setCategories(activeCategories); // Store all categories for mobile horizontal scroll

        // Filter published products and get top 4 bestsellers
        const availableProducts = prodRes.data.filter(p => p.is_published && !p.is_paused);
        const bestSellers = availableProducts.filter(p => p.is_bestseller);

        setProducts(bestSellers.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length, currentSlide]);

  const nextSlide = () => setCurrentSlide(prev => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide(prev => (prev === 0 ? heroSlides.length - 1 : prev - 1));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => (prev === 0 ? heroSlides.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide(prev => (prev === heroSlides.length - 1 ? 0 : prev + 1));
      }
    };
    if (heroSlides.length > 1) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [heroSlides.length]);

  const [isSwiping, setIsSwiping] = useState(false);
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(false);
  };
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };
  
  const handleLinkNavigation = (link) => {
    if (!link) {
      navigate('/shop');
      return;
    }
    try {
      // If it's a full URL, extract just the path+query part
      if (link.startsWith('http://') || link.startsWith('https://')) {
        const url = new URL(link);
        navigate(url.pathname + url.search + url.hash);
      } else {
        navigate(link);
      }
    } catch {
      navigate('/shop');
    }
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > 50) {
      if (distance > 50) nextSlide();
      if (distance < -50) prevSlide();
    }
  };

  const defaultSlide = {
    image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80",
    subtitle: "Freshly Baked & Crunchy",
    title: "Craving",
    titleHighlight: "Snacks & Cakes?",
    description: "Explore our wide variety of premium biscuits, crunchy Kurkure, delicious cakes, and snacks delivered straight to your door.",
    button1Text: "Shop Now",
    button1Link: "/shop",
    button2Text: "Explore",
    button2Link: "/shop"
  };

  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      setIsSearching(true);
      const fetchSearchResults = async () => {
        try {
          const res = await axios.get('/api/products');
          const published = res.data.filter(p => p.is_published && !p.is_paused);
          const q = searchQuery.toLowerCase().trim();
          const matchedProducts = published.filter(p =>
            p.title?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
          ).slice(0, 5);
          setSearchResults(matchedProducts);
        } catch (error) {
          console.error("Failed to search products", error);
        } finally {
          setIsSearching(false);
        }
      };
      const debounceTimer = setTimeout(fetchSearchResults, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support Voice Search.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      // Optional: automatically navigate after setting query
      // navigate(`/shop?search=${transcript}`); 
    };

    recognition.onerror = (event) => {
      console.error("Voice search error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const activeSlide = heroSlides.length > 0 ? heroSlides[currentSlide] : defaultSlide;

  return (
    <div className="w-full">
      {/* Mobile Sub-Header (Premium E-com Style) */}
      <div className="md:hidden bg-gradient-to-b from-orange-50 to-white dark:from-slate-900 dark:to-slate-900 pt-3 pb-3 px-3 space-y-4">

        {/* Top Row: Address, Track, and Points */}
        <div className="flex justify-between items-center gap-2">
          <button
            onClick={() => window.dispatchEvent(new Event('openDeliveryModal'))}
            className="flex-1 flex items-center bg-white dark:bg-slate-800/80 backdrop-blur-md rounded-full py-1.5 px-3 border border-slate-100 dark:border-slate-700/50 shadow-sm min-w-0"
          >
            <HomeIcon className="w-4 h-4 text-slate-800 dark:text-slate-200 mr-1.5 flex-shrink-0" />
            <div className="flex items-center overflow-hidden min-w-0">
              <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mr-1 shrink-0">HOME</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                {localStorage.getItem('savedPincode') || 'Select Delivery Location'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 ml-1 flex-shrink-0" />
          </button>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to="/track-order"
              className="flex items-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm shadow-blue-500/30 rounded-lg py-1.5 px-2.5 transition-transform active:scale-95"
            >
              <Truck className="w-3 h-3 mr-1" />
              <span className="text-[10px] font-extrabold tracking-wide uppercase">Track</span>
            </Link>


          </div>
        </div>

        {/* Search Bar */}
        <div ref={searchRef} className="sticky top-[60px] z-[40] mt-1 -mx-3 px-4 py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery) navigate(`/shop?search=${searchQuery}`);
            }}
            className="relative w-full flex items-center"
          >
            <Search className="absolute left-4 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              name="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full py-3.5 pl-11 pr-24 text-[15px] focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm border border-slate-200 dark:border-slate-700 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              autoComplete="off"
            />
            <div className="absolute right-2 flex items-center space-x-1.5 text-slate-400">
              <button
                type="button"
                onClick={() => setShowCameraAlert(true)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
              >
                <Camera className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={startVoiceSearch}
                className={`p-2 rounded-full transition-colors focus:outline-none flex items-center justify-center ${isListening ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <Mic className="w-4 h-4" />
                {isListening && <span className="absolute w-8 h-8 rounded-full border-2 border-red-500/50 animate-ping"></span>}
              </button>
            </div>
          </form>

          {/* Search Dropdown */}
          {searchQuery.trim().length >= 1 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden z-[60]">
              <div className="max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-slate-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => setSearchQuery('')}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                          {product.images && product.images.length > 0 && product.images[0] ? (
                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-100 dark:bg-slate-800"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">{product.title}</h4>
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-500">₹{product.price}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">No products found for "{searchQuery}"</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] space-x-5 py-2 px-1">
          {/* Static 'For You' Category */}
          <Link to="/shop" className="flex flex-col items-center min-w-max space-y-1.5 group">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 p-[2px] shadow-sm transform group-active:scale-95 transition-transform">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-orange-500/10"></div>
                <CircleDot className="w-6 h-6 text-orange-600 dark:text-orange-500 relative z-10" />
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-800 dark:text-white">For You</span>
            <div className="w-4 h-0.5 bg-orange-500 rounded-full"></div>
          </Link>

          {categories.map(cat => (
            <Link key={cat.id} to={`/shop?category=${cat.id}`} className="flex flex-col items-center min-w-max space-y-1.5 pt-0.5 group">
              <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 flex items-center justify-center overflow-hidden shadow-sm transform group-active:scale-95 transition-transform p-2.5">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                )}
              </div>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section
        className="relative h-[22vh] md:h-[85vh] bg-slate-900 flex items-center overflow-hidden group mt-2 mx-2 md:mt-0 md:mx-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEndHandler}
      >
        {heroSlides.length > 0 ? heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            onClick={() => !isSwiping && handleLinkNavigation(slide.button1Link || defaultSlide.button1Link || '/shop')}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
          >
            <div className="absolute inset-0 bg-slate-900">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent z-10 hidden md:block"></div>
              <img
                src={slide.image_url || defaultSlide.image_url}
                alt={slide.title}
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          </div>
        )) : (
          <div 
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={() => !isSwiping && handleLinkNavigation(defaultSlide.button1Link || '/shop')}
          >
            <div className="absolute inset-0 bg-slate-900">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent z-10 hidden md:block"></div>
              <img
                src={defaultSlide.image_url}
                alt="Default"
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 hidden md:block">
          <div className="max-w-2xl transition-all duration-700 transform translate-y-0 opacity-100" key={activeSlide.id || 'default'}>
            {activeSlide.subtitle && (
              <span className="block text-amber-400 font-medium tracking-wider uppercase mb-4 text-sm animate-fade-in-up">{activeSlide.subtitle}</span>
            )}
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-tight animate-fade-in-up animation-delay-100">
              {activeSlide.title} <br />
              {activeSlide.titleHighlight && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                  {activeSlide.titleHighlight}
                </span>
              )}
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-lg leading-relaxed animate-fade-in-up animation-delay-200">
              {activeSlide.description}
            </p>
            <div className="flex space-x-4 animate-fade-in-up animation-delay-300">
              {activeSlide.button1Text && (
                <button onClick={() => handleLinkNavigation(activeSlide.button1Link || '/shop')} className="px-8 py-4 bg-amber-600 text-white font-medium rounded-full hover:bg-amber-700 transition-all shadow-lg hover:shadow-amber-500/30 flex items-center">
                  {activeSlide.button1Text} <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              )}
              {activeSlide.button2Text && (
                <button onClick={() => handleLinkNavigation(activeSlide.button2Link || '/shop')} className="px-8 py-4 bg-white/10 text-white font-medium rounded-full hover:bg-white/20 transition-all backdrop-blur-sm">
                  {activeSlide.button2Text}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        {heroSlides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
              {heroSlides.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentSlide(idx)} className="p-1">
                  {idx === currentSlide ? (
                    <CircleDot className="w-3 h-3 text-amber-500 fill-amber-500" />
                  ) : (
                    <Circle className="w-3 h-3 text-white/50 fill-white/50 hover:text-white hover:fill-white transition-colors" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Featured Categories */}
      <section className="py-6 md:py-20 bg-white dark:bg-slate-900 transition-colors duration-300 mt-2 md:mt-0">
        <div className="max-w-7xl mx-auto px-2 md:px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-4 md:mb-12 px-2 md:px-0">
            <div>
              <h2 className="text-lg md:text-3xl font-bold text-slate-900 dark:text-white mb-0.5 md:mb-2">Shop by Category</h2>
              <p className="text-xs md:text-base text-slate-500 dark:text-slate-400">Find exactly what you're looking for</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 px-2 md:px-0">
              {categories.slice(0, 4).map((cat) => (
                <Link key={cat.id} to={`/shop?category=${cat.id}`} className="group relative h-[160px] md:h-[400px] rounded-xl md:rounded-2xl overflow-hidden">
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-800 group-hover:scale-105 transition-transform duration-700"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent flex flex-col justify-end p-3 md:p-8">
                    <h3 className="text-sm md:text-2xl font-bold text-white mb-0.5 md:mb-2">{cat.name}</h3>
                    <div className="hidden md:flex items-center text-amber-400 font-medium group-hover:text-amber-300 transition-colors">
                      Explore Collection <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">
              No categories found.
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-6 md:py-20 bg-slate-50 dark:bg-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-2 md:px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-lg md:text-3xl font-bold text-slate-900 dark:text-white mb-0.5 md:mb-2">{bestSellerTitle}</h2>
          <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 mb-4 md:mb-12">{bestSellerSubtitle}</p>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 text-left px-2 md:px-0">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-48 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-400">
              No products available yet.
            </div>
          )}

          <div className="mt-12">
            <Link to="/shop" className="inline-flex items-center px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Visual Search Coming Soon Modal */}
      {showCameraAlert && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center bg-slate-900/40 backdrop-blur-sm px-4 pb-4 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
              Visual Search
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-6 text-sm">
              We're working hard to bring AI-powered visual search to you. Soon you'll be able to snap a photo to find matching products instantly!
            </p>
            <button
              onClick={() => setShowCameraAlert(false)}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3.5 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

