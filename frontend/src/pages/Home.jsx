import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Circle, CircleDot } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bestSellerTitle, setBestSellerTitle] = useState("Best Sellers");
  const [bestSellerSubtitle, setBestSellerSubtitle] = useState("Our most loved products");
  const [heroSlides, setHeroSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

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
           } catch(e) { console.error('Failed parsing slides', e); }
        }
        if (settingsRes.data?.BEST_SELLER_TITLE) setBestSellerTitle(settingsRes.data.BEST_SELLER_TITLE);
        if (settingsRes.data?.BEST_SELLER_SUBTITLE) setBestSellerSubtitle(settingsRes.data.BEST_SELLER_SUBTITLE);
        
        // Filter published categories
        const activeCategories = catRes.data.filter(c => c.is_published && !c.is_paused);
        setCategories(activeCategories.slice(0, 4)); // Show up to 4 categories on home
        
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

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) nextSlide();
    if (distance < -50) prevSlide();
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

  const activeSlide = heroSlides.length > 0 ? heroSlides[currentSlide] : defaultSlide;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section 
        className="relative h-[85vh] bg-slate-900 flex items-center overflow-hidden group"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEndHandler}
      >
        {heroSlides.length > 0 ? heroSlides.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div className="absolute inset-0 bg-slate-900">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent z-10"></div>
              <img 
                src={slide.image_url || defaultSlide.image_url} 
                alt={slide.title} 
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          </div>
        )) : (
          <div className="absolute inset-0 z-10">
            <div className="absolute inset-0 bg-slate-900">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent z-10"></div>
              <img 
                src={defaultSlide.image_url} 
                alt="Default" 
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20">
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
                <Link to={activeSlide.button1Link || '/shop'} className="px-8 py-4 bg-amber-600 text-white font-medium rounded-full hover:bg-amber-700 transition-all shadow-lg hover:shadow-amber-500/30 flex items-center">
                  {activeSlide.button1Text} <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              )}
              {activeSlide.button2Text && (
                <Link to={activeSlide.button2Link || '/shop'} className="px-8 py-4 bg-white/10 text-white font-medium rounded-full hover:bg-white/20 transition-all backdrop-blur-sm">
                  {activeSlide.button2Text}
                </Link>
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
      <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Shop by Category</h2>
              <p className="text-slate-500 dark:text-slate-400">Find exactly what you're looking for</p>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/shop?category=${cat.id}`} className="group relative h-[400px] rounded-2xl overflow-hidden">
                  <img 
                    src={cat.image_url || "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                    alt={cat.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                  <div className="absolute bottom-8 left-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{cat.name}</h3>
                    <span className="text-amber-300 group-hover:text-amber-200 transition-colors flex items-center font-medium">Explore <ArrowRight className="w-4 h-4 ml-1" /></span>
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
      <section className="py-20 bg-slate-50 dark:bg-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{bestSellerTitle}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-12">{bestSellerSubtitle}</p>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
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
    </div>
  );
};

export default Home;
