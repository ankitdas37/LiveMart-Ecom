import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, LogOut, MapPin, Truck, ChevronRight, Package, Shield, Heart, HelpCircle, Activity, MessageSquare, Clock, Settings, Bell, Globe } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
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

  const { user, logout } = useContext(AuthContext);
  const { itemCount } = useContext(CartContext);
  const navigate = useNavigate();

  // Delivery Modal State
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState(null);
  const [savedPincode, setSavedPincode] = useState(localStorage.getItem('savedPincode') || '');

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
          setTimeout(() => {
            setIsDeliveryModalOpen(false);
            setDeliveryMessage(null);
          }, 3500);
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm py-3 border-b border-slate-100 dark:border-slate-800' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <img src="/logo.png" alt="LiveMart" className="h-9 w-9 rounded-xl object-contain shadow-sm" />
            <div className="flex">
              <span className="text-slate-900 dark:text-white">Live</span>
              <span className="text-[#FF8C00]">Mart</span>
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-500 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-slate-100">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link to="/" className="block px-3 py-2 text-base font-medium hover:bg-slate-50 hover:text-amber-600">Home</Link>
            <Link to="/shop" className="block px-3 py-2 text-base font-medium hover:bg-slate-50 hover:text-amber-600">Shop</Link>
            <Link to="/about" className="block px-3 py-2 text-base font-medium hover:bg-slate-50 hover:text-amber-600">About</Link>
            <Link to="/contact" className="block px-3 py-2 text-base font-medium hover:bg-slate-50 hover:text-amber-600">Contact</Link>
            <Link to="/track-order" className="block px-3 py-2 text-base font-medium hover:bg-slate-50 hover:text-amber-600">Track Order</Link>

            <button
              onClick={() => { setIsDeliveryModalOpen(true); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-base font-medium text-amber-600 hover:bg-amber-50 flex items-center"
            >
              <MapPin className="w-5 h-5 mr-2" />
              {savedPincode ? `Deliver to ${savedPincode}` : 'Check Delivery Location'}
            </button>

            <Link to="/admin" className="block px-3 py-2 text-base font-medium text-amber-600 hover:bg-amber-50">Admin Login</Link>

            {user ? (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="px-4 pb-3 text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {user.name}'s Account
                </div>
                
                {/* Account Settings */}
                <Link to="/profile?tab=edit" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-amber-600">
                  <span className="flex items-center"><User className="w-5 h-5 mr-3 text-slate-400" /> Edit Profile</span>
                </Link>
                <Link to="/profile?tab=address" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-amber-600">
                  <span className="flex items-center"><MapPin className="w-5 h-5 mr-3 text-slate-400" /> Saved Addresses</span>
                </Link>
                <Link to="/profile?tab=devices" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-amber-600">
                  <span className="flex items-center"><Settings className="w-5 h-5 mr-3 text-slate-400" /> Manage Devices</span>
                </Link>
                <Link to="/profile?tab=notifications" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-amber-600">
                  <span className="flex items-center"><Bell className="w-5 h-5 mr-3 text-slate-400" /> Notifications</span>
                </Link>
                <Link to="/profile?tab=language" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-amber-600">
                  <span className="flex items-center"><Globe className="w-5 h-5 mr-3 text-slate-400" /> Language</span>
                </Link>
                
                {/* My Activity */}
                <div className="mt-2 mb-2 border-t border-slate-100"></div>
                <Link to="/profile?tab=orders" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-amber-600">
                  <span className="flex items-center"><Package className="w-5 h-5 mr-3 text-slate-400" /> My Orders</span>
                </Link>
                <Link to="/profile?tab=wishlist" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-amber-600">
                  <span className="flex items-center"><Heart className="w-5 h-5 mr-3 text-slate-400" /> Wishlist</span>
                </Link>
                <Link to="/profile?tab=reviews" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-amber-600">
                  <span className="flex items-center"><Activity className="w-5 h-5 mr-3 text-slate-400" /> My Reviews & Activity</span>
                </Link>
                <Link to="/profile?tab=recent" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-amber-600">
                  <span className="flex items-center"><Clock className="w-5 h-5 mr-3 text-slate-400" /> Recent Product Views</span>
                </Link>
                
                {/* Support */}
                <div className="mt-2 mb-2 border-t border-slate-100"></div>
                <Link to="/profile?tab=help" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-amber-600">
                  <span className="flex items-center"><HelpCircle className="w-5 h-5 mr-3 text-slate-400" /> Help Center</span>
                </Link>
                <Link to="/profile?tab=feedback" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-amber-600">
                  <span className="flex items-center"><MessageSquare className="w-5 h-5 mr-3 text-slate-400" /> Feedback, Terms & FAQs</span>
                </Link>
                <Link to="/profile?tab=privacy" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-amber-600">
                  <span className="flex items-center"><Shield className="w-5 h-5 mr-3 text-slate-400" /> Privacy Center & Account Data</span>
                </Link>

                <div className="mt-4 pt-3 border-t border-slate-100 px-2">
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); logoutHandler(); }}
                    className="w-full text-left px-4 py-3 text-base font-bold text-red-500 hover:bg-red-50 flex items-center rounded-xl transition-colors"
                  >
                    <LogOut className="w-6 h-6 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                <Link to="/login" className="block px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-amber-600">Log in</Link>
                <Link to="/signup" className="block px-3 py-2 text-base font-medium text-amber-600 hover:bg-amber-50">Sign up</Link>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-around">
              <button className="flex flex-col items-center text-slate-600 hover:text-amber-600">
                <Search className="w-5 h-5" />
                <span className="text-xs mt-1">Search</span>
              </button>
              <Link to="/checkout" className="flex flex-col items-center text-slate-600 hover:text-amber-600 relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
                <span className="text-xs mt-1">Cart</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Checker Modal */}
      {isDeliveryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div ref={deliveryModalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            <button
              onClick={() => { setIsDeliveryModalOpen(false); setDeliveryMessage(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-8">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Choose your location</h3>
              <p className="text-sm text-slate-500 mb-6">Enter your Pincode to see if we deliver to your area.</p>

              <form onSubmit={checkDelivery} className="space-y-4">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter 6-digit Pincode"
                  maxLength="6"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Apply
                </button>
              </form>

              {deliveryMessage && (
                <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${deliveryMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
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
