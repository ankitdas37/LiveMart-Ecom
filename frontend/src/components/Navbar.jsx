import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, LogOut, MapPin, Truck, ChevronRight, Package, Shield, Heart, HelpCircle, Activity, MessageSquare, Clock, Settings, Bell, Globe, Grid, Sparkles, Tag, Sun, Moon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ThemeContext } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ pages: [], products: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef(null);
  const deliveryModalRef = useRef(null);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const { user, logout } = useContext(AuthContext);
  const { itemCount } = useContext(CartContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { unreadCount } = useSocket();
  const navigate = useNavigate();

  // Delivery Modal State
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState(null);
  const [savedPincode, setSavedPincode] = useState(localStorage.getItem('savedPincode') || '');

  useEffect(() => {
    const handleOpenDeliveryModal = () => setIsDeliveryModalOpen(true);
    window.addEventListener('openDeliveryModal', handleOpenDeliveryModal);
    return () => window.removeEventListener('openDeliveryModal', handleOpenDeliveryModal);
  }, []);

  // (unreadCount is now managed by SocketContext — real-time, no polling needed)


  const checkDelivery = async (e) => {
    e.preventDefault();
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      try {
        const res = await axios.get(`/api/pincodes/check/${pincode}`);
        if (res.data.serviceable) {
          let msgText = `Delivery Available to ${pincode}`;
          if (res.data.details && res.data.details.estimated_days !== null && res.data.details.estimated_days !== undefined) {
            const days = Number(res.data.details.estimated_days);
            if (days === 0) {
              msgText += ` (Today)`;
            } else if (days === 1) {
              msgText += ` (Tomorrow)`;
            } else {
              const minDate = new Date();
              const maxDate = new Date();
              minDate.setDate(minDate.getDate() + Math.max(1, days - 1));
              maxDate.setDate(maxDate.getDate() + days + 1);
              const options = { month: 'short', day: 'numeric' };
              msgText += ` (By ${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)})`;
            }
          } else {
            const minDate = new Date();
            minDate.setDate(minDate.getDate() + 3);
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + 5);
            const options = { month: 'short', day: 'numeric' };
            msgText += ` (By ${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)})`;
          }

          setDeliveryMessage({ type: 'success', text: msgText });
          localStorage.setItem('savedPincode', pincode);
          setSavedPincode(pincode);
        }
      } catch (error) {
        setDeliveryMessage({ type: 'error', text: error.response?.data?.message || 'Sorry, we do not deliver to this pincode.' });
      }
    } else {
      setDeliveryMessage({ type: 'error', text: 'Please enter a valid 6-digit Pincode.' });
    }
  };

  const logoutHandler = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (selectedIndex >= 0) {
      // Navigate to selected item
      const totalPages = searchResults.pages.length;
      if (selectedIndex < totalPages) {
        navigate(searchResults.pages[selectedIndex].path);
      } else {
        const productIndex = selectedIndex - totalPages;
        if (searchResults.products[productIndex]) {
          navigate(`/product/${searchResults.products[productIndex].id}`);
        }
      }
      setIsSearchOpen(false);
      setSearchQuery('');
      setSearchResults({ pages: [], products: [] });
      setSelectedIndex(-1);
      return;
    }

    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchResults({ pages: [], products: [] });
      setSelectedIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    const totalItems = searchResults.pages.length + searchResults.products.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    }
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim().length >= 1) {
        setIsSearching(true);
        const q = searchQuery.toLowerCase().trim();

        // Filter static pages
        const allPages = [
          { name: 'Home', path: '/' },
          { name: 'Shop All Products', path: '/shop' },
          { name: 'About Us', path: '/about' },
          { name: 'Track Order', path: '/track-order' },
          { name: 'Contact Us', path: '/contact' },
          { name: 'Login', path: '/login' },
          { name: 'Sign Up', path: '/signup' },
        ];

        if (user && user.role === 'admin') {
          allPages.push(
            { name: 'Admin Dashboard', path: '/admin' },
            { name: 'Admin Products', path: '/admin/products' },
            { name: 'Admin Best Sellers', path: '/admin/bestsellers' },
            { name: 'Admin Settings', path: '/admin/settings' },
            { name: 'Admin Orders', path: '/admin/orders' }
          );
        }

        const matchedPages = allPages.filter(p => p.name.toLowerCase().includes(q));

        try {
          const res = await axios.get('/api/products');
          const products = res.data.filter(p => p.is_published && !p.is_paused);
          const matchedProducts = products.filter(p =>
            p.title?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
          ).slice(0, 5); // Limit to top 5 products in dropdown

          setSearchResults({ pages: matchedPages, products: matchedProducts });
          setSelectedIndex(-1);
        } catch (error) {
          console.error("Failed to search products", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults({ pages: [], products: [] });
        setSelectedIndex(-1);
      }
    };

    const debounceTimer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (deliveryModalRef.current && !deliveryModalRef.current.contains(event.target)) {
        setIsDeliveryModalOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav ref={mobileMenuRef} className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm py-3 border-b border-slate-100 dark:border-slate-800' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2 notranslate">
            <img src="/logo.png" alt="W!FO MART" className="h-9 w-9 rounded-xl object-contain shadow-sm" />
            <div className="flex flex-col">
              <div className="flex leading-none">
                <span className="text-slate-900 dark:text-white">W!FO</span>
                <span className="text-[#FF8C00] ml-1.5">MART</span>
              </div>
              <span className="text-[9px] font-black text-[#A0705E] tracking-widest mt-0.5">A BASRIC Company</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="text-sm font-medium dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Home</Link>
            <Link to="/shop" className="text-sm font-medium dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Shop</Link>
            <Link to="/about" className="text-sm font-medium dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-500 transition-colors">About</Link>
            <Link to="/contact" className="text-sm font-medium dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Contact</Link>
            <Link to="/track-order" className="text-sm font-medium flex items-center dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
              <Truck className="w-4 h-4 mr-1" /> Track Order
            </Link>
            <Link to="/admin" className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:hover:text-amber-500 transition-colors">Admin Login</Link>
          </div>

          {/* Icons and Auth */}
          <div className="hidden md:flex items-center space-x-5">

            {/* Dark Mode Toggle — Premium Pill */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 text-xs font-bold select-none ${theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
            >
              <span className={`transition-all duration-300 ${theme === 'dark' ? 'opacity-100 scale-100' : 'opacity-0 scale-75 absolute'}`}>
                <Moon className="w-3.5 h-3.5" />
              </span>
              <span className={`w-8 h-4 rounded-full relative transition-all duration-300 ${theme === 'dark' ? 'bg-amber-500' : 'bg-slate-300'
                }`}>
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${theme === 'dark' ? 'left-[18px]' : 'left-0.5'
                  }`} />
              </span>
              <span className={`transition-all duration-300 ${theme === 'dark' ? 'opacity-0 scale-75 absolute' : 'opacity-100 scale-100'}`}>
                <Sun className="w-3.5 h-3.5" />
              </span>
            </button>

            <button
              onClick={() => setIsDeliveryModalOpen(true)}
              className="flex items-center text-left group hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors"
            >
              <MapPin className="w-5 h-5 mr-2 text-slate-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mb-1">
                  {savedPincode ? 'Deliver to' : 'Location'}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white leading-none whitespace-nowrap">
                  {savedPincode ? savedPincode : 'Select Pincode'}
                </span>
              </div>
            </button>

            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {isSearchOpen && (
                <div className="absolute right-0 mt-4 w-72 bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden z-50">
                  <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-slate-100 dark:border-slate-800">
                    <input
                      type="text"
                      placeholder="Search store, products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className="w-full px-4 py-3 bg-transparent text-sm focus:outline-none dark:text-white"
                    />
                    <button type="submit" className="p-3 text-slate-400 hover:text-amber-600 dark:hover:text-amber-500">
                      <Search className="w-4 h-4" />
                    </button>
                  </form>

                  {searchQuery.trim().length >= 1 && (
                    <div className="max-h-96 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-center text-xs text-slate-500">Searching...</div>
                      ) : (
                        <>
                          {searchResults.pages.length > 0 && (
                            <div className="py-2">
                              <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pages</div>
                              {searchResults.pages.map((page, idx) => (
                                <Link
                                  key={idx}
                                  to={page.path}
                                  onClick={() => setIsSearchOpen(false)}
                                  className={`flex items-center justify-between px-4 py-2 transition-colors group ${selectedIndex === idx ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                >
                                  <span className={`text-sm font-medium group-hover:text-amber-600 dark:group-hover:text-amber-500 ${selectedIndex === idx ? 'text-amber-600 dark:text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}>{page.name}</span>
                                  <ChevronRight className={`w-4 h-4 group-hover:text-amber-600 dark:group-hover:text-amber-500 ${selectedIndex === idx ? 'text-amber-600 dark:text-amber-500' : 'text-slate-300'}`} />
                                </Link>
                              ))}
                            </div>
                          )}

                          {searchResults.products.length > 0 && (
                            <div className="py-2 border-t border-slate-100 dark:border-slate-800">
                              <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Products</div>
                              {searchResults.products.map((product, pIdx) => {
                                const totalIdx = searchResults.pages.length + pIdx;
                                return (
                                  <Link
                                    key={product.id}
                                    to={`/product/${product.id}`}
                                    onClick={() => setIsSearchOpen(false)}
                                    className={`flex items-center space-x-3 px-4 py-2 transition-colors group ${selectedIndex === totalIdx ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                  >
                                    <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                                      {product.images && product.images[0] ? (
                                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                                      ) : (
                                        <Package className="w-5 h-5 m-auto text-slate-400" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-medium truncate group-hover:text-amber-600 dark:group-hover:text-amber-500 ${selectedIndex === totalIdx ? 'text-amber-600 dark:text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}>{product.title}</p>
                                      <p className="text-xs text-slate-500 dark:text-slate-500 truncate">₹{product.discount_price || product.price}</p>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          )}

                          {searchResults.pages.length === 0 && searchResults.products.length === 0 && !isSearching && (
                            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                              No results found for "{searchQuery}"
                            </div>
                          )}

                          {(searchResults.pages.length > 0 || searchResults.products.length > 0) && (
                            <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                              <button
                                onClick={handleSearchSubmit}
                                className="w-full py-2 text-xs font-bold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 text-center transition-colors"
                              >
                                View all search results
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <Link to="/checkout" className="relative text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            
            {user && (
              <Link to="/profile?tab=notifications" className="relative text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors ml-4">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            <div className="flex items-center space-x-4 ml-4 border-l border-slate-200 dark:border-slate-700 pl-4">
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-500 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                      {user.profile_pic ? (
                        <img src={user.profile_pic} alt="profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      )}
                    </div>
                    <span className="hidden sm:block">{user.name.split(' ')[0]}</span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-72 max-h-[85vh] overflow-y-auto overflow-x-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-50 transform origin-top-right transition-all scrollbar-hide">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-2 bg-slate-50/50 dark:bg-slate-800/30">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      </div>

                      {/* Admin Controls (Only visible to admins) */}
                      {user.role === 'admin' && (
                        <>
                          <div className="px-3 py-1">
                            <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin Controls</p>
                            <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all">
                              <Shield className="w-4 h-4 mr-3" /> Admin Dashboard
                            </Link>
                            <Link to="/admin/users" onClick={() => setIsProfileOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all">
                              <Users className="w-4 h-4 mr-3" /> User Management
                            </Link>
                          </div>
                          <div className="border-t border-slate-100 dark:border-slate-800 my-2"></div>
                        </>
                      )}

                      {/* My Profile Section */}
                      <div className="px-3 py-1">
                        <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Settings</p>
                        <Link to="/profile?tab=edit" onClick={() => setIsProfileOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 rounded-xl transition-all">
                          <User className="w-4 h-4 mr-3 text-slate-400 group-hover:text-amber-600" /> Edit Profile
                        </Link>
                        <Link to="/profile?tab=address" onClick={() => setIsProfileOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 rounded-xl transition-all">
                          <MapPin className="w-4 h-4 mr-3 text-slate-400" /> Saved Addresses
                        </Link>
                        <Link to="/profile?tab=devices" onClick={() => setIsProfileOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 rounded-xl transition-all">
                          <Settings className="w-4 h-4 mr-3 text-slate-400" /> Manage Devices
                        </Link>
                        <Link to="/profile?tab=notifications" onClick={() => setIsProfileOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 rounded-xl transition-all">
                          <Bell className="w-4 h-4 mr-3 text-slate-400" /> Notifications
                        </Link>
                        <Link to="/profile?tab=language" onClick={() => setIsProfileOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 rounded-xl transition-all">
                          <Globe className="w-4 h-4 mr-3 text-slate-400" /> Language
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-2"></div>

                      {/* Orders & Activity */}
                      <div className="px-3 py-1">
                        <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">My Activity</p>
                        <Link to="/profile?tab=orders" onClick={() => setIsProfileOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 rounded-xl transition-all">
                          <Package className="w-4 h-4 mr-3 text-slate-400" /> My Orders
                        </Link>
                        <Link to="/profile?tab=wishlist" onClick={() => setIsProfileOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 rounded-xl transition-all">
                          <Heart className="w-4 h-4 mr-3 text-slate-400" /> Wishlist
                        </Link>
                        <Link to="/profile?tab=reviews" onClick={() => setIsProfileOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 rounded-xl transition-all">
                          <Activity className="w-4 h-4 mr-3 text-slate-400" /> My Reviews & Activity
                        </Link>
                        <Link to="/profile?tab=recent" onClick={() => setIsProfileOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 rounded-xl transition-all">
                          <Clock className="w-4 h-4 mr-3 text-slate-400" /> Recent Product Views
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-2"></div>

                      {/* Help & Privacy */}
                      <div className="px-3 py-1">
                        <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Support & Privacy</p>
                        <Link to="/profile?tab=help" onClick={() => setIsProfileOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 rounded-xl transition-all">
                          <HelpCircle className="w-4 h-4 mr-3 text-slate-400" /> Help Center
                        </Link>
                        <Link to="/profile?tab=feedback" onClick={() => setIsProfileOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 rounded-xl transition-all">
                          <MessageSquare className="w-4 h-4 mr-3 text-slate-400" /> Feedback, Terms & FAQs
                        </Link>
                        <Link to="/profile?tab=privacy" onClick={() => setIsProfileOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 rounded-xl transition-all">
                          <Shield className="w-4 h-4 mr-3 text-slate-400" /> Privacy Center & Account Data
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 mt-3 pt-3 px-3 pb-2">
                        <button
                          onClick={() => { setIsProfileOpen(false); logoutHandler(); }}
                          className="w-full flex items-center px-3 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-[#2563eb] dark:text-[#60a5fa] hover:text-[#1d4ed8] dark:hover:text-[#93c5fd] transition-colors">
                    Log in
                  </Link>
                  <Link to="/signup" className="text-sm font-medium bg-[#0f172a] dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Icons (Auth & Cart & Theme) */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="text-slate-600 dark:text-slate-300 p-1 hover:text-amber-600 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {!user ? (
              <button
                onClick={() => document.getElementById('login-link-mobile').click()}
                className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full"
              >
                Login
                <Link id="login-link-mobile" to="/login" className="hidden"></Link>
              </button>
            ) : (
              <Link to="/profile" className="text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-500">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 border border-slate-300 flex items-center justify-center">
                  {user.profile_pic ? (
                    <img src={user.profile_pic} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </Link>
            )}

            {user && (
              <Link to="/profile?tab=notifications" className="relative text-slate-600 dark:text-slate-300 p-1 hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            <Link to="/checkout" className="relative text-slate-600 dark:text-slate-300 p-1">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-900">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>



      {/* Delivery Checker Modal */}
      {isDeliveryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div ref={deliveryModalRef} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative transition-colors">
            <button
              onClick={() => { setIsDeliveryModalOpen(false); setDeliveryMessage(null); }}
              className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-700 p-1.5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-8">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Choose your location</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Enter your Pincode to see if we deliver to your area.</p>

              <form onSubmit={checkDelivery} className="space-y-4">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter 6-digit Pincode"
                  maxLength="6"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                />
                <button
                  type="submit"
                  className="w-full bg-slate-900 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Apply
                </button>
              </form>

              {deliveryMessage && (
                <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${deliveryMessage.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                  }`}>
                  {deliveryMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
