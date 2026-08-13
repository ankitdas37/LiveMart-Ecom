import { useState, useEffect, useMemo, useContext } from 'react';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, RefreshCw, ArrowLeft, ShoppingCart, ChevronDown, Percent, Grid } from 'lucide-react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';

const Shop = () => {
  const navigate = useNavigate();
  const { cartItems } = useContext(CartContext);
  const cartItemCount = cartItems ? cartItems.reduce((total, item) => total + (item.quantity || 1), 0) : 0;

  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';
  
  const [categories, setCategories] = useState([{ id: 'all', name: 'All Products' }]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [catRes, prodRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/products')
        ]);
        
        const activeCategories = catRes.data.filter(c => c.is_published && !c.is_paused);
        setCategories([{ id: 'all', name: 'All Products' }, ...activeCategories]);
        
        // Only show published and non-paused products
        const availableProducts = prodRes.data.filter(p => p.is_published && !p.is_paused);
        setProducts(availableProducts);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState('newest');

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // 1. Deep Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        const catName = p.category_name || categories.find(c => c.id === p.categoryId)?.name || '';
        return (
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          catName.toLowerCase().includes(q)
        );
      });
    }

    // 2. Category Filter - match by categoryId (integer)
    if (activeCategory !== 'all') {
      result = result.filter(p => p.categoryId === activeCategory || p.categoryId === parseInt(activeCategory));
    }

    // 3. Price Filter
    result = result.filter(p => parseFloat(p.price) <= maxPrice);

    // 4. Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'best-selling':
        // Move bestsellers to top
        result.sort((a, b) => (b.is_bestseller === a.is_bestseller ? 0 : b.is_bestseller ? 1 : -1));
        break;
      case 'newest':
      default:
        // Move new arrivals to top, fallback to higher IDs as 'newer'
        result.sort((a, b) => {
          if (b.is_new_arrival !== a.is_new_arrival) {
            return b.is_new_arrival ? 1 : -1;
          }
          return b.id - a.id;
        });
        break;
    }

    return result;
  }, [searchQuery, activeCategory, maxPrice, sortBy, products]);

  return (
    <div className="w-full">
      {/* Mobile Custom Header (Visible only on md:hidden) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[60] bg-[#dce7fc] pb-0 shadow-sm pt-4 transition-transform">
        {/* Top Row: Back, Search, Cart */}
        <div className="flex items-center px-4 gap-3 pb-3">
          <button onClick={() => navigate(-1)} className="text-slate-700 p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for products"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) {
                  setSearchParams({ q: e.target.value });
                } else {
                  setSearchParams({});
                }
              }}
              className="w-full bg-white rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none shadow-sm text-slate-800 placeholder-slate-400 border border-slate-200"
            />
          </div>

          <Link to="/cart" className="relative text-slate-800 p-1">
            <ShoppingCart className="w-6 h-6" />
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-[#dce7fc]">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Second Row: Filters/Scrollable Tabs */}
        <div className="bg-white py-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-4 gap-2.5 items-center">
            
            {/* Sort Button */}
            <button className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shrink-0 shadow-sm hover:bg-slate-50 transition-colors">
              <span className="text-[13px] font-medium text-slate-700">Sort</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>
            
            {/* Filter Button */}
            <button className="flex items-center gap-2 bg-slate-200/80 border border-slate-300 rounded-xl px-3 py-1.5 shrink-0 shadow-sm">
              <div className="bg-black text-white text-[11px] font-bold w-4 h-4 flex items-center justify-center rounded-[4px]">
                1
              </div>
              <span className="text-[13px] font-medium text-slate-800">Filter</span>
              <SlidersHorizontal className="w-4 h-4 text-slate-800" />
            </button>
            
            {/* Top Discounts */}
            <button className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shrink-0 shadow-sm hover:bg-slate-50 transition-colors">
              <div className="bg-orange-100 rounded-full p-0.5">
                <Percent className="w-3.5 h-3.5 text-green-600" />
              </div>
              <span className="text-[13px] font-medium text-slate-700">Top Discounts</span>
            </button>
            
            {/* Menu */}
            <button className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shrink-0 shadow-sm hover:bg-slate-50 transition-colors">
              <Grid className="w-4 h-4 text-blue-600" />
              <span className="text-[13px] font-medium text-slate-700">Menu</span>
            </button>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-36 md:pt-12">
        <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm sticky top-24 space-y-8 transition-colors duration-300">
            
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-lg mb-2">
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Categories</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                      String(activeCategory) === String(cat.id) 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg shadow-amber-500/30 translate-x-1' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-500 font-medium hover:translate-x-1'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Max Price: ₹{maxPrice}</h3>
              <input 
                type="range" 
                min="10" 
                max="5000" 
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                <span>₹10</span>
                <span>₹5000</span>
              </div>
            </div>

          </div>
        </div>

        {/* Product Grid Area */}
        <div className="flex-1">
          
          {/* Top Bar (Search & Sort) */}
          <div className="hidden md:flex bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-6 flex-col sm:flex-row justify-between items-center gap-4 transition-colors duration-300">
            
            {/* Search */}
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) {
                    setSearchParams({ q: e.target.value });
                  } else {
                    setSearchParams({});
                  }
                }}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 dark:text-white transition-colors"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <label className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap font-medium">Sort by:</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white transition-colors"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="best-selling">Best Selling</option>
              </select>
            </div>
          </div>

          {/* Results Info */}
          <div className="mb-6 flex justify-between items-center px-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {activeCategory === 'all' ? 'All Products' : categories.find(c => c.id === activeCategory)?.name}
            </h1>
            <span className="text-slate-500 text-sm font-medium">
              {filteredAndSortedProducts.length} results found
            </span>
          </div>
          
          {/* Products */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm py-16 px-4 text-center transition-colors duration-300">
                <Search className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Product Not Found</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                  We couldn't find any products matching your search for <span className="font-semibold text-slate-700 dark:text-slate-300">"{searchQuery}"</span>. 
                </p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSearchParams({});
                    setActiveCategory('all');
                    setMaxPrice(5000);
                  }}
                  className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
                >
                  Clear Filters
                </button>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Recommended for you</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.slice(0, 6).map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
      </div>
    </div>
  );
};

export default Shop;
