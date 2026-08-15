import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import axios from 'axios';
import { Camera, User, Mail, Shield, Package, LogOut, CheckCircle2, MapPin, Bell, Globe, Heart, Activity, Clock, HelpCircle, MessageSquare, Trash2, X, Eye, EyeOff, Phone, Star, Plus, Edit2, Map, Navigation, Home, Briefcase, CheckCircle, ShoppingCart, ExternalLink, Settings, Smartphone, Laptop, Monitor, ShieldAlert, XCircle, Globe2, ChevronLeft, ChevronRight, TicketPercent } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';

const WB_DISTRICTS = ['Alipurduar','Bankura','Birbhum','Cooch Behar','Dakshin Dinajpur','Darjeeling','Hooghly','Howrah','Jalpaiguri','Jhargram','Kalimpong','Kolkata','Malda','Murshidabad','Nadia','North 24 Parganas','Paschim Bardhaman','Paschim Medinipur','Purba Bardhaman','Purba Medinipur','Purulia','South 24 Parganas','Uttar Dinajpur'];
const HOOGHLY_TOWNS = ['Arambagh','Bandel','Bhadreswar','Chinsurah','Chandannagar','Dankuni','Konnagar','Rishra','Serampore','Singur','Tarakeswar','Uttarpara','Other'];
const HOOGHLY_POLICE_STATIONS = ['Arambagh','Balagarh','Bhadreswar','Chandannagar','Chanditala','Chinsurah','Dadpur','Dankuni','Dhaniakhali','Goghat','Gurap','Haripal','Jangipara','Khanakul','Mogra','Pandua','Polba','Pursurah','Serampore','Singur','Tarakeswar','Uttarpara','Other'];

const NAV_ITEMS = [
  { section: 'Account Settings', items: [
    { id: 'profile', label: 'Edit Profile', icon: User },
    { id: 'address', label: 'Saved Addresses', icon: MapPin },
    { id: 'devices', label: 'Manage Devices', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'language', label: 'Language', icon: Globe },
  ]},
  { section: 'My Activity', items: [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'reviews', label: 'My Reviews & Activity', icon: Activity },
    { id: 'recent', label: 'Recent Product Views', icon: Clock },
  ]},
  { section: 'Support & Privacy', items: [
    { id: 'help', label: 'Help Center', icon: HelpCircle },
    { id: 'feedback', label: 'Feedback, Terms & FAQs', icon: MessageSquare },
    { id: 'privacy', label: 'Privacy Center & Data', icon: Shield },
  ]},
];

const UserProfile = () => {
  const { user, updateUserSession, logout } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const getTabFromUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    const urlTab = searchParams.get('tab');
    if (urlTab === 'edit') return 'profile';
    if (urlTab) return urlTab;
    return window.innerWidth < 1024 ? 'menu' : 'profile';
  };

  const [activeTab, setActiveTab] = useState(getTabFromUrl());

  useEffect(() => {
    const tab = getTabFromUrl();
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isPhoneEditing, setIsPhoneEditing] = useState(!user?.phone);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profilePic, setProfilePic] = useState(user?.profile_pic || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');

  // Data State
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [addressForm, setAddressForm] = useState({ fullName:'', email: user?.email || '', phone:'', altPhone:'', street:'', landmark:'', city:'Chinsurah', district:'Hooghly', state:'West Bengal', country:'India', pincode:'', is_default:false, addressType:'Home', policeStation:'', location_lat:'', location_lng:'' });

  // Wishlist State
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Settings State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [marketingNotifs, setMarketingNotifs] = useState(true);
  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'English');
  const [securityTab, setSecurityTab] = useState('current');
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Help State
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [ticketForm, setTicketForm] = useState({ subject:'', message:'' });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Login Activity
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'orders' && orders.length === 0) fetchOrders();
    if (activeTab === 'reviews' && reviews.length === 0) fetchReviews();
    if (activeTab === 'address' && addresses.length === 0) fetchAddresses();
    if (activeTab === 'wishlist' && wishlist.length === 0) fetchWishlist();
    if (activeTab === 'devices') fetchSessions();
    if (activeTab === 'help' && tickets.length === 0) fetchTickets();
  }, [activeTab]);

  const cfg = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  const fetchOrders = async () => { try { setIsLoadingOrders(true); const { data } = await axios.get('/api/users/orders', cfg()); setOrders(data); } catch (e) {} finally { setIsLoadingOrders(false); } };
  const fetchReviews = async () => { try { setIsLoadingReviews(true); const { data } = await axios.get('/api/reviews/my-reviews', cfg()); setReviews(data); } catch (e) {} finally { setIsLoadingReviews(false); } };
  const fetchAddresses = async () => { try { setAddressLoading(true); const { data } = await axios.get('/api/users/addresses', cfg()); setAddresses(data); } catch (e) { toast.error('Failed to load addresses'); } finally { setAddressLoading(false); } };
  const fetchWishlist = async () => { try { setWishlistLoading(true); const { data } = await axios.get('/api/wishlist', cfg()); setWishlist(data); } catch (e) { toast.error('Failed to load wishlist'); } finally { setWishlistLoading(false); } };
  const fetchSessions = async () => { try { setIsLoadingSessions(true); const { data } = await axios.get('/api/users/sessions', cfg()); setSessions(data); } catch (e) { toast.error('Failed to load sessions'); } finally { setIsLoadingSessions(false); } };
  const fetchTickets = async () => { try { setTicketsLoading(true); const { data } = await axios.get('/api/support/my-tickets', cfg()); setTickets(data); } catch (e) {} finally { setTicketsLoading(false); } };
  const fetchActivities = async () => { try { setActivitiesLoading(true); const { data } = await axios.get('/api/users/login-activity', cfg()); setActivities(data); } catch (e) {} finally { setActivitiesLoading(false); } };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      setIsUploading(true);
      const compressed = await compressImage(file, 400, 400, 0.7);
      const fd = new FormData(); fd.append('image', compressed);
      const { data } = await axios.post('/api/upload', fd);
      setProfilePic(data.url);
      const saveRes = await axios.put('/api/users/profile', { name, email, profile_pic: data.url }, cfg());
      updateUserSession(saveRes.data);
      setUpdateMessage({ type: 'success', text: 'Profile picture updated!' });
    } catch (e) { setUpdateMessage({ type: 'error', text: 'Image upload failed.' }); }
    finally { setIsUploading(false); }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const isPhoneChanged = phone !== (user?.phone || '');
    if (isPhoneChanged && !/^[6-9]\d{9}$/.test(phone)) { setUpdateMessage({ type:'error', text:'Enter a valid 10-digit mobile number.' }); return; }
    if (password || isPhoneChanged) {
      try { setIsUpdating(true); await axios.post('/api/users/send-password-otp', { reason: password ? 'password' : 'phone' }, cfg()); setOtpModalOpen(true); }
      catch (err) { setUpdateMessage({ type:'error', text: err.response?.data?.message || 'Failed to send OTP.' }); }
      finally { setIsUpdating(false); } return;
    }
    await executeSave();
  };

  const executeSave = async (otpCode = '') => {
    try {
      setIsUpdating(true); setUpdateMessage(null);
      const payload = { name, email, phone, profile_pic: profilePic };
      if (password) payload.password = password;
      if (otpCode) payload.otp = otpCode;
      const { data } = await axios.put('/api/users/profile', payload, cfg());
      updateUserSession(data);
      if (data.phone) setIsPhoneEditing(false);
      setUpdateMessage({ type:'success', text:'Profile updated successfully!' });
      toast.success(otpCode ? 'Verification successful! Profile updated.' : 'Profile updated successfully!');
      setPassword(''); setOtpModalOpen(false); setOtp('');
    } catch (err) { 
      const errMsg = err.response?.data?.message || 'Update failed';
      setUpdateMessage({ type:'error', text: errMsg }); 
      if (otpCode) toast.error(errMsg);
    }
    finally { setIsUpdating(false); }
  };

  const handleAddressInput = (e) => {
    let { name: n, value, type, checked } = e.target;
    
    // Prevent non-digit inputs for phone fields and limit to 10 digits
    if (n === 'phone' || n === 'altPhone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    
    // Prevent non-digit inputs for pincode and limit to 6 digits
    if (n === 'pincode') {
      value = value.replace(/\D/g, '').slice(0, 6);
    }
    
    setAddressForm(prev => ({ ...prev, [n]: type === 'checkbox' ? checked : value }));
  };
  const openAddressForm = () => { setAddressForm(prev => ({ ...prev, phone: user.phone || '', email: user.email || '' })); setShowAddressForm(true); };
  const resetAddressForm = () => { setShowAddressForm(false); setIsEditingAddress(false); setEditAddressId(null); setAddressForm({ fullName:'', email: user?.email || '', phone:'', altPhone:'', street:'', landmark:'', city:'Chinsurah', district:'Hooghly', state:'West Bengal', country:'India', pincode:'', is_default:false, addressType:'Home', policeStation:'', location_lat:'', location_lng:'' }); };
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (addressForm.pincode.length !== 6) { toast.error('Pincode must be 6 digits'); return; }
    try {
      if (isEditingAddress) { await axios.put(`/api/users/addresses/${editAddressId}`, addressForm, cfg()); toast.success('Address updated!'); }
      else { await axios.post('/api/users/addresses', addressForm, cfg()); toast.success('Address added!'); }
      fetchAddresses(); resetAddressForm();
    } catch (err) { toast.error(err.response?.data?.message || 'Something went wrong'); }
  };
  const handleEditAddress = (address) => { setAddressForm({ fullName:address.fullName, email:address.email||user?.email||'', phone:address.phone, altPhone:address.altPhone||'', street:address.street, landmark:address.landmark||'', city:address.city, district:address.district, state:address.state, country:address.country, pincode:address.pincode, is_default:address.is_default, addressType:address.addressType||'Home', policeStation:address.policeStation||'', location_lat:address.location_lat||'', location_lng:address.location_lng||'' }); setEditAddressId(address.id); setIsEditingAddress(true); setShowAddressForm(true); };
  const handleDeleteAddress = async (id) => { if (!window.confirm('Delete this address?')) return; try { await axios.delete(`/api/users/addresses/${id}`, cfg()); toast.success('Address deleted'); fetchAddresses(); } catch (e) { toast.error('Failed to delete'); } };
  const handleSetDefault = async (address) => { try { await axios.put(`/api/users/addresses/${address.id}`, { ...address, is_default: true }, cfg()); toast.success('Default updated'); fetchAddresses(); } catch (e) { toast.error('Failed'); } };
  const fetchLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      let fd = { ...addressForm, location_lat: lat, location_lng: lng };
      try {
        const { data } = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, { headers: { 'Accept-Language': 'en' } });
        if (data?.address) {
          const a = data.address;
          if (a.postcode) fd.pincode = a.postcode.substring(0,6);
          const parts = [a.road, a.neighbourhood, a.suburb, a.village].filter(Boolean);
          if (parts.length) fd.street = parts.join(', ');
          
          const landmark = a.neighbourhood || a.suburb || a.amenity || a.building;
          if (landmark) fd.landmark = landmark;
          
          const district = a.state_district ? a.state_district.replace(' District', '').trim() : (a.county || '');
          if (district) fd.district = district;
          
          const city = a.city || a.town || a.village;
          if (city) fd.city = city;
          
          const police = a.city_district || a.suburb || a.town;
          if (police) fd.policeStation = police;
          
          if (a.state) fd.state = a.state;
        }
        toast.success('Location auto-filled! 📍');
      } catch (e) { toast.success('Location saved! 📍'); }
      setAddressForm(fd); setIsFetchingLocation(false);
    }, () => { setIsFetchingLocation(false); toast.error('Location access denied.'); });
  };

  const handleRevokeSession = async (sessionId, isCurrent) => {
    try { await axios.delete(`/api/users/sessions/${sessionId}`, cfg()); if (isCurrent || sessions.length <= 1) { toast.success('Logged out'); logout(); } else { toast.success('Device logged out'); setSessions(sessions.filter(s => s.id !== sessionId)); } } catch (e) { toast.error('Failed to log out device'); }
  };
  const handleRevokeAllOthers = async () => { try { await axios.delete('/api/users/sessions', cfg()); toast.success('All other devices logged out'); setSessions(sessions.filter(s => s.is_current)); } catch (e) { toast.error('Failed'); } };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.message) { toast.error('Please fill all fields'); return; }
    try { setSubmittingTicket(true); const res = await axios.post('/api/support', { name: user.name, email: user.email, subject: ticketForm.subject, message: ticketForm.message }); toast.success(res.data.message || 'Ticket submitted!'); setShowTicketModal(false); setTicketForm({ subject:'', message:'' }); fetchTickets(); } catch (e) { toast.error('Failed to submit ticket'); } finally { setSubmittingTicket(false); }
  };
  const handleDeleteActivity = async (id) => { try { await axios.delete(`/api/users/login-activity/${id}`, cfg()); setActivities(activities.filter(a => a.id !== id)); } catch (e) {} };
  const handleClearActivity = async () => { if (!window.confirm('Delete all login history?')) return; try { await axios.delete('/api/users/login-activity', cfg()); setActivities([]); } catch (e) {} };

  if (!user) return null;

  const getDeviceIcon = (type) => {
    if (!type) return <Monitor className="w-5 h-5 text-slate-600 dark:text-slate-300" />;
    if (type.toLowerCase().includes('mobile')) return <Smartphone className="w-5 h-5 text-slate-600 dark:text-slate-300" />;
    return <Laptop className="w-5 h-5 text-slate-600 dark:text-slate-300" />;
  };

  const faqs = [
    { q:'How do I track my order?', a:'Track your order in "My Orders" tab or via the tracking link in your confirmation email.' },
    { q:'What is your return policy?', a:'We offer 30-day hassle-free returns for unused items in original packaging.' },
    { q:'How do I change my shipping address?', a:'Manage delivery addresses in the "Saved Addresses" tab of your profile.' },
    { q:'How do I cancel my order?', a:'Cancel within 24 hours of placing from "My Orders" if it has not shipped yet.' },
    { q:'What payment methods do you accept?', a:'We accept all major credit/debit cards, UPI, net banking, and wallets.' },
    { q:'How long does delivery take?', a:'Standard: 3-5 business days. Express: 1-2 days for select locations.' },
  ];

  // ─── Tab Renders ────────────────────────────────────────────────────────

  const renderProfile = () => (
    <div className="bg-white dark:bg-slate-800 transition-colors lg:rounded-2xl lg:shadow-sm lg:border lg:border-slate-100 dark:border-slate-700 overflow-hidden -mx-4 lg:mx-0">
      <div className="h-32 bg-gradient-to-r from-slate-900 to-indigo-900 relative">
        <div className="absolute inset-0 bg-white/5 opacity-20"></div>
      </div>
      <div className="px-5 sm:px-8 pb-8 relative">
        <div className="flex flex-col items-center sm:flex-row sm:items-end gap-4 sm:gap-6 -mt-16 mb-8">
          <div className="relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-800 border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
              {profilePic ? (<img src={profilePic} alt="Profile" className="w-full h-full rounded-full object-cover cursor-pointer" referrerPolicy="no-referrer" onClick={() => setShowImageModal(true)} />) : user.name.charAt(0).toUpperCase()}
            </div>
            <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 p-2.5 rounded-full cursor-pointer shadow-lg transition-all z-10 border-2 border-white active:scale-95">
              {isUploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
            </label>
            {profilePic && (<button type="button" onClick={() => { setProfilePic(''); setUpdateMessage({ type:'success', text:'Image removed. Click Save to apply.' }); }} className="absolute bottom-0 left-0 bg-red-500 hover:bg-red-600 p-2 rounded-full cursor-pointer shadow-md transition-all z-10 border-2 border-white"><Trash2 className="w-4 h-4 text-white" /></button>)}
          </div>
          <div className="text-center sm:text-left flex-1 mb-2 mt-2 sm:mt-0">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full inline-block mt-1.5">{user.role === 'admin' ? 'Administrator' : 'Customer'}</p>
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><User className="w-5 h-5 text-indigo-600" /> Personal Information</h3>
        {updateMessage && (<div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${updateMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>{updateMessage.type === 'success' && <CheckCircle2 className="w-5 h-5" />}<p className="font-medium text-sm">{updateMessage.text}</p></div>)}
        
        <form onSubmit={handleProfileUpdate} className="space-y-5 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><User className="w-5 h-5" /></div><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 transition-colors border border-slate-200 dark:border-slate-600 rounded-xl focus:bg-white dark:bg-slate-800 transition-colors focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-semibold text-slate-900 dark:text-white" /></div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Mail className="w-5 h-5" /></div><input type="email" value={email} readOnly className="w-full pl-12 pr-4 py-3.5 bg-slate-100 dark:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600 rounded-xl outline-none font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed" /></div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Phone className="w-5 h-5" /></div>
                <input type="tel" maxLength={10} value={phone} readOnly={!isPhoneEditing} onChange={e => setPhone(e.target.value.replace(/\D/g,''))} className={`w-full pl-12 pr-20 py-3.5 border rounded-xl transition-all outline-none font-semibold ${!isPhoneEditing ? 'bg-slate-100 dark:bg-slate-700 transition-colors border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900 transition-colors text-slate-900 dark:text-white border-slate-200 dark:border-slate-600 focus:bg-white dark:bg-slate-800 transition-colors focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`} />
                <div className="absolute inset-y-0 right-2 pr-2 flex items-center">
                  {!isPhoneEditing ? (<button type="button" onClick={() => setIsPhoneEditing(true)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">Edit</button>) : (<button type="button" onClick={() => { setIsPhoneEditing(false); setPhone(user?.phone || ''); }} className="text-xs font-bold text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 dark:bg-slate-700 transition-colors">Cancel</button>)}
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">New Password <span className="normal-case font-normal text-slate-400">(Leave blank to keep)</span></label>
              <div className="relative"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Shield className="w-5 h-5" /></div><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900 transition-colors border border-slate-200 dark:border-slate-600 rounded-xl focus:bg-white dark:bg-slate-800 transition-colors focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-semibold text-slate-900 dark:text-white" placeholder="Min. 6 characters" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-300">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>
            </div>
          </div>
          <div className="pt-2">
            <button type="submit" disabled={isUpdating} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
              {isUpdating ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      {showImageModal && profilePic && (<div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowImageModal(false)}><div className="relative max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}><button onClick={() => setShowImageModal(false)} className="absolute -top-12 right-0 text-white hover:text-amber-400"><X className="w-8 h-8" /></button><img src={profilePic} alt="Profile" className="w-72 h-72 mx-auto rounded-full object-cover border-4 border-white shadow-2xl" referrerPolicy="no-referrer" /><p className="text-center text-white/70 text-sm mt-4">Tap outside to close</p></div></div>)}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4 transition-all duration-300">
          <div className="bg-white dark:bg-slate-800 transition-colors rounded-3xl max-w-md w-full p-8 shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>
            
            <button onClick={() => {setOtpModalOpen(false); setOtp('');}} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 dark:bg-slate-700 transition-colors rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8 mt-2">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner border border-amber-200/50 transform rotate-3">
                <Shield className="w-10 h-10 text-amber-600 transform -rotate-3" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Verify Identity</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm px-4">We've sent a 6-digit security code to your registered email address.</p>
            </div>
            
            <div className="relative mb-8">
              <input 
                type="text" 
                inputMode="numeric" 
                maxLength={6} 
                value={otp} 
                onChange={e => setOtp(e.target.value.replace(/\D/g,''))} 
                className="w-full text-center text-4xl tracking-[0.4em] font-black py-5 bg-slate-50 dark:bg-slate-900 transition-colors border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:bg-white dark:bg-slate-800 transition-colors focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 outline-none text-slate-800 dark:text-slate-100 transition-all shadow-inner placeholder-slate-300"
                placeholder="------"
              />
              <div className="absolute -bottom-6 left-0 right-0 text-center">
                <span className="text-xs font-medium text-slate-400 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" /> Secure Verification
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => executeSave(otp)} 
              disabled={otp.length !== 6 || isUpdating} 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-amber-500/30 flex justify-center items-center gap-2"
            >
              {isUpdating ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Verifying...</> : 'Confirm & Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderAddress = () => (
    <div className="bg-white dark:bg-slate-800 transition-colors rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <div><h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><MapPin className="w-5 h-5 text-amber-500" /> Saved Addresses</h3><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage where we deliver your orders.</p></div>
        {!showAddressForm && (<button onClick={openAddressForm} className="flex items-center gap-2 bg-amber-50 text-amber-600 hover:bg-amber-100 px-4 py-2 rounded-xl font-bold text-sm transition-colors"><Plus className="w-4 h-4" /> Add New</button>)}
      </div>
      {addressLoading ? (<div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" /></div>) : null}
      {!addressLoading && showAddressForm && (
        <div className="bg-slate-50 dark:bg-slate-900 transition-colors p-6 rounded-2xl border border-slate-200 dark:border-slate-600 mb-6">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">{isEditingAddress ? 'Edit Address' : 'Add New Address'}</h4>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div><h5 className="font-bold text-blue-900 flex items-center gap-2"><Navigation className="w-4 h-4" /> Pinpoint Your Location</h5><p className="text-sm text-blue-700">Help our delivery partners find you exactly.</p>{addressForm.location_lat && <p className="text-xs font-bold text-emerald-600 mt-1">Location Saved</p>}</div>
            <button type="button" onClick={fetchLocation} disabled={isFetchingLocation} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">{isFetchingLocation ? 'Fetching...' : 'Fetch Current Location'}</button>
          </div>
          <form onSubmit={handleAddressSubmit} className="space-y-5">
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="addressType" value="Home" checked={addressForm.addressType==='Home'} onChange={handleAddressInput} className="w-4 h-4 text-amber-500" /><span className="font-bold text-slate-700 dark:text-slate-200">Home</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="addressType" value="Office" checked={addressForm.addressType==='Office'} onChange={handleAddressInput} className="w-4 h-4 text-amber-500" /><span className="font-bold text-slate-700 dark:text-slate-200">Office</span></label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Name <span className="text-red-500">*</span></label><input required type="text" name="fullName" value={addressForm.fullName} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white dark:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-600 rounded-xl focus:border-amber-500 outline-none transition-all" /></div>
              <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address <span className="text-red-500">*</span></label><input required type="email" name="email" value={addressForm.email} onChange={handleAddressInput} readOnly className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600 rounded-xl focus:border-amber-500 outline-none transition-all text-slate-500 dark:text-slate-400 cursor-not-allowed" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Phone <span className="text-red-500">*</span></label><input required type="tel" name="phone" value={addressForm.phone} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white dark:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-600 rounded-xl focus:border-amber-500 outline-none transition-all" /></div>
              <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Alternate Phone</label><input type="tel" name="altPhone" value={addressForm.altPhone} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white dark:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-600 rounded-xl focus:border-amber-500 outline-none transition-all" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Pincode <span className="text-red-500">*</span></label><input required type="text" name="pincode" maxLength={6} value={addressForm.pincode} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white dark:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-600 rounded-xl focus:border-amber-500 outline-none transition-all" placeholder="6-digit PIN" /></div>
              <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Landmark</label><input type="text" name="landmark" value={addressForm.landmark} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white dark:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-600 rounded-xl focus:border-amber-500 outline-none transition-all" placeholder="e.g. Near Apollo Pharmacy" /></div>
            </div>
            <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Street Address <span className="text-red-500">*</span></label><textarea required name="street" rows={2} value={addressForm.street} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white dark:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-600 rounded-xl focus:border-amber-500 outline-none transition-all resize-none" /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">State <span className="text-red-500">*</span></label><select required name="state" value={addressForm.state} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white dark:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-600 rounded-xl focus:border-amber-500 outline-none transition-all cursor-pointer"><option>West Bengal</option></select></div>
              <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">District <span className="text-red-500">*</span></label><select required name="district" value={addressForm.district} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white dark:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-600 rounded-xl focus:border-amber-500 outline-none transition-all cursor-pointer">{WB_DISTRICTS.map(d => <option key={d}>{d}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Police Station <span className="text-red-500">*</span></label><select required name="policeStation" value={addressForm.policeStation} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white dark:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-600 rounded-xl focus:border-amber-500 outline-none transition-all cursor-pointer"><option value="">Select Police Station</option>{addressForm.district==='Hooghly' ? HOOGHLY_POLICE_STATIONS.map(ps=><option key={ps}>{ps}</option>) : <option value="Other">Other</option>}</select></div>
              <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">City/Town <span className="text-red-500">*</span></label><select required name="city" value={addressForm.city} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white dark:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-600 rounded-xl focus:border-amber-500 outline-none transition-all cursor-pointer">{addressForm.district==='Hooghly' ? HOOGHLY_TOWNS.map(t=><option key={t}>{t}</option>) : <option value="Other">Other</option>}</select></div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" id="is_default" name="is_default" checked={addressForm.is_default} onChange={handleAddressInput} className="w-4 h-4 text-amber-500 rounded" /><label htmlFor="is_default" className="text-sm font-medium text-slate-700 dark:text-slate-200">Make this my default address</label></div>
            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-600">
              <button type="submit" className="px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors">{isEditingAddress ? 'Save Changes' : 'Save Address'}</button>
              <button type="button" onClick={resetAddressForm} className="px-6 py-2.5 bg-white dark:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:bg-slate-900 transition-colors transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {!addressLoading && !showAddressForm && addresses.length === 0 && (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 transition-colors rounded-2xl border border-dashed border-slate-200 dark:border-slate-600"><Map className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h4 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">No Addresses Found</h4><p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">You have not saved any delivery addresses yet.</p><button onClick={openAddressForm} className="bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-amber-600 transition-colors">Add Your First Address</button></div>
      )}
      {!addressLoading && !showAddressForm && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(address => (
            <div key={address.id} className={`p-5 rounded-2xl border relative transition-all ${address.is_default ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200 dark:border-slate-600 hover:border-amber-300 bg-white dark:bg-slate-800 transition-colors'}`}>
              {address.is_default && (<div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> Default</div>)}
              <div className="flex items-start gap-3 mb-3"><div className="bg-slate-100 dark:bg-slate-700 transition-colors p-2 rounded-full text-slate-500 dark:text-slate-400">{address.addressType==='Office' ? <Briefcase className="w-5 h-5" /> : <Home className="w-5 h-5" />}</div><div><h4 className="font-bold text-slate-800 dark:text-slate-100">{address.fullName}</h4><p className="text-sm font-medium text-slate-500 dark:text-slate-400">{address.phone}</p></div></div>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1 mb-4 pl-12"><p>{address.street}</p>{address.landmark && <p className="text-amber-600">Near: {address.landmark}</p>}<p>{address.city}, {address.district}, {address.pincode}</p>{address.location_lat && <p className="text-xs text-blue-500 flex items-center gap-1"><Navigation className="w-3 h-3" /> GPS Saved</p>}</div>
              <div className="flex gap-2 pl-12 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => handleEditAddress(address)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg"><Edit2 className="w-3 h-3" /> Edit</button>
                <button onClick={() => handleDeleteAddress(address.id)} className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg"><Trash2 className="w-3 h-3" /> Delete</button>
                {!address.is_default && <button onClick={() => handleSetDefault(address)} className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:text-slate-100 ml-auto px-2 py-1.5">Set Default</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-4 px-1 sm:px-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600"><Package className="w-5 h-5 sm:w-6 sm:h-6" /></div>
        <div><h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">My Orders</h2><p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Track and manage your orders</p></div>
      </div>
      {isLoadingOrders && <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-600 border-t-indigo-600 rounded-full animate-spin" /></div>}
      {!isLoadingOrders && orders.length === 0 && (<div className="bg-white dark:bg-slate-800 transition-colors rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 text-center py-20"><Package className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Orders Yet</h3><p className="text-slate-500 dark:text-slate-400 mb-6">You have not placed any orders yet.</p><Link to="/shop" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors inline-block active:scale-95">Start Shopping</Link></div>)}
      {!isLoadingOrders && orders.length > 0 && orders.map(order => (
        <Link to={`/order/${order.id}`} key={order.id} className="bg-white dark:bg-slate-800 transition-colors rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 dark:border-slate-600 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-indigo-300 hover:shadow-md transition-all block active:scale-[0.98]">
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between md:justify-start gap-3 flex-wrap mb-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Order #LIVEMART{String(order.id).padStart(6, '0')}</span>
              <span className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold ${order.status==='Delivered'?'bg-emerald-100 text-emerald-700':order.status==='Cancelled'?'bg-red-100 text-red-700':order.status==='Processing'?'bg-blue-100 text-blue-700':'bg-amber-100 text-amber-700'}`}>{order.status}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Placed {new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} · <span className="font-semibold text-slate-700 dark:text-slate-200">₹{order.total_amount}</span></p>
          </div>
          <div className="flex items-center justify-between w-full md:w-auto gap-4 pt-3 md:pt-0 border-t border-slate-100 dark:border-slate-700 md:border-none mt-2 md:mt-0">
            <div className="flex -space-x-2">{order.OrderItems?.slice(0,4).map((item,i)=>(<img key={i} src={(item.Product?.images&&item.Product.images[0])||'https://via.placeholder.com/40'} alt="p" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white object-cover bg-slate-100 dark:bg-slate-700 transition-colors" />))}</div>
            <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold hover:bg-indigo-600 hover:text-white transition-colors text-xs sm:text-sm whitespace-nowrap">View Details</span>
          </div>
        </Link>
      ))}
    </div>
  );

  const renderWishlist = () => (
    <div className="px-1 sm:px-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-xl flex items-center justify-center text-pink-500">
          <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">My Wishlist</h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">{wishlist.length} items saved</p>
        </div>
      </div>
      {wishlistLoading && <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-600 border-t-pink-500 rounded-full animate-spin" /></div>}
      {!wishlistLoading && wishlist.length === 0 && (
        <div className="bg-white dark:bg-slate-800 transition-colors rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 text-center py-20">
          <Heart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your Wishlist is Empty</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Save items you love to buy later.</p>
          <Link to="/shop" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors inline-block active:scale-95">Explore Products</Link>
        </div>
      )}
      {!wishlistLoading && wishlist.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {wishlist.map(item => {
            const p = item.Product; if (!p) return null;
            return (
              <div key={item.id} className="group flex flex-col bg-white dark:bg-slate-800 transition-colors rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-600 overflow-hidden shadow-sm hover:shadow-md transition-all relative">
                <button 
                  onClick={async()=>{ 
                    try{ 
                      await axios.post('/api/wishlist',{productId:p.id},cfg()); 
                      setWishlist(wishlist.filter(i=>i.Product.id!==p.id)); 
                      toast.success('Removed from wishlist'); 
                    }catch(e){ toast.error('Failed'); }
                  }} 
                  className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur p-1.5 sm:p-2 rounded-full shadow-sm text-slate-400 hover:text-red-500 hover:bg-white dark:bg-slate-800 transition-colors transition-colors active:scale-90"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link to={`/product/${p.id}`} className="block relative aspect-[4/5] sm:aspect-square bg-slate-50 dark:bg-slate-900 transition-colors overflow-hidden">
                  <img src={p.images&&p.images.length>0?p.images[0]:'https://placehold.co/400x400?text=No+Image'} alt={p.title || 'Product'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </Link>
                <div className="p-3 sm:p-4 flex flex-col flex-grow">
                  <Link to={`/product/${p.id}`} className="hover:text-indigo-600 transition-colors mb-1 sm:mb-2 flex-grow">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-xs sm:text-sm line-clamp-2 leading-snug">{p.title || 'Untitled Product'}</h4>
                  </Link>
                  <div className="flex flex-wrap items-end gap-1.5 mb-3 sm:mb-4">
                    <span className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white leading-none">₹{parseFloat(p.price).toFixed(2)}</span>
                    {p.discount_price && parseFloat(p.discount_price) > parseFloat(p.price) && (
                      <span className="text-[10px] sm:text-xs text-slate-400 line-through leading-none">₹{parseFloat(p.discount_price).toFixed(2)}</span>
                    )}
                  </div>
                  <div className="mt-auto">
                    <button 
                      onClick={()=>{ addToCart(p,1); toast.success(`${p.title||'Item'} added!`); }} 
                      className="w-full bg-slate-900 text-white font-bold py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm active:scale-95"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600"><Star className="w-6 h-6" /></div><div><h2 className="text-2xl font-black text-slate-900 dark:text-white">My Reviews</h2><p className="text-slate-500 dark:text-slate-400">Products you have reviewed</p></div></div>
      {isLoadingReviews && <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-600 border-t-amber-500 rounded-full animate-spin" /></div>}
      {!isLoadingReviews && reviews.length === 0 && (<div className="bg-white dark:bg-slate-800 transition-colors rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 text-center py-20"><Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Reviews Yet</h3><p className="text-slate-500 dark:text-slate-400">Go to your orders to leave a review!</p></div>)}
      {!isLoadingReviews && reviews.length > 0 && reviews.map(review => (
        <div key={review.id} className="bg-white dark:bg-slate-800 transition-colors rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 flex gap-4">
          <img src={(review.Product?.images&&review.Product.images[0])||'https://via.placeholder.com/100'} alt="product" className="w-20 h-20 rounded-xl object-cover bg-slate-100 dark:bg-slate-700 transition-colors flex-shrink-0" />
          <div className="flex-1"><h4 className="font-bold text-slate-900 dark:text-white mb-1">{review.Product?.name}</h4><div className="flex items-center gap-1 mb-2">{[1,2,3,4,5].map(s=>(<Star key={s} className={`w-4 h-4 ${s<=review.rating?'text-amber-400 fill-amber-400':'text-slate-200'}`}/>))}<span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{review.rating}/5</span></div><p className="text-sm text-slate-600 dark:text-slate-300">{review.comment}</p><p className="text-xs text-slate-400 mt-2">{new Date(review.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p></div>
        </div>
      ))}
    </div>
  );

  const renderRecent = () => (
    <div className="bg-white dark:bg-slate-800 transition-colors rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 transition-colors rounded-full flex items-center justify-center mb-6"><Clock className="w-10 h-10 text-slate-400" /></div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Recent Product Views</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">Track the products you have been browsing. This feature is coming soon!</p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 font-bold rounded-xl text-sm"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Coming Soon</div>
    </div>
  );

  const renderSecurity = () => (
    <div className="px-1 sm:px-0">
      <div className="flex p-1 mb-6 bg-slate-100 dark:bg-slate-900 transition-colors rounded-xl w-fit border border-slate-200 dark:border-slate-700">
        <button onClick={() => setSecurityTab('current')} className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${securityTab==='current'?'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700':'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'}`}>Active Sessions</button>
        <button onClick={() => { setSecurityTab('history'); if(activities.length===0) fetchActivities(); }} className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${securityTab==='history'?'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700':'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'}`}>Login History</button>
      </div>
      {securityTab === 'current' ? (
        <div className="bg-white dark:bg-slate-800 transition-colors rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 dark:border-slate-600 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700"><div className="bg-indigo-100 p-2 sm:p-3 rounded-xl text-indigo-600"><Settings className="w-5 h-5 sm:w-6 sm:h-6" /></div><div><h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Manage Devices</h3><p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">View and manage where you are logged in.</p></div></div>
          {isLoadingSessions && <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading devices...</div>}
          {!isLoadingSessions && sessions.length === 0 && <div className="text-center py-8 text-slate-500 dark:text-slate-400">No active devices found.</div>}
          {!isLoadingSessions && sessions.length > 0 && (
            <div className="space-y-4 sm:space-y-6">
              {sessions.map(session => (
                <div key={session.id} className={`border ${session.is_current?'border-indigo-300 dark:border-indigo-700 bg-indigo-50/30 dark:bg-indigo-900/20 ring-1 ring-indigo-300/50 dark:ring-indigo-700/50':'border-slate-200 dark:border-slate-600'} rounded-xl sm:rounded-2xl overflow-hidden shadow-sm`}>
                  <div className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${session.is_current?'border-indigo-100 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-900/40':'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 transition-colors'}`}>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="bg-white dark:bg-slate-800 transition-colors p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm">{getDeviceIcon(session.device_type)}</div>
                      <div>
                        <h4 className={`font-bold text-base sm:text-lg flex flex-wrap items-center gap-2 sm:gap-3 ${session.is_current?'text-indigo-900 dark:text-indigo-300':'text-slate-800 dark:text-slate-100'}`}>
                          {session.browser} on {session.os}
                          {session.is_current&&<span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[9px] sm:text-[10px] uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-extrabold tracking-wide">Current</span>}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Session: {session.id?.split('-')[0]}...</p>
                      </div>
                    </div>
                    <button onClick={()=>handleRevokeSession(session.id,session.is_current)} className="w-full sm:w-auto text-xs sm:text-sm font-bold bg-white dark:bg-slate-800 transition-colors border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 px-4 py-2 sm:py-2.5 rounded-lg transition-colors active:scale-95 shadow-sm">Log Out</button>
                  </div>
                  <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-2 sm:gap-y-3 gap-x-8">
                    {[['Device',session.device_type||'Unknown'],['OS',session.os||'Unknown'],['Browser',session.browser||'Unknown'],['IP',session.ip_address],['Location',session.location||'Unknown'],['Method',session.login_method||'Password'],['Login Time',session.login_time?format(new Date(session.login_time),'dd MMM yyyy, h:mm a'):'Unknown'],['Last Active',session.is_current?'Just now':formatDistanceToNow(new Date(session.last_active),{addSuffix:true})]].map(([k,v])=>(<div key={k} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"><span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{k}</span><span className="text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm text-right truncate max-w-[50%]">{v}</span></div>))}
                  </div>
                </div>
              ))}
              {sessions.length > 1 && <div className="pt-4 sm:pt-6 flex justify-end"><button onClick={handleRevokeAllOthers} className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors active:scale-95 shadow-md">Log out of all other devices</button></div>}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 transition-colors rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 dark:border-slate-600 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 sm:p-3 rounded-xl text-indigo-600"><Activity className="w-5 h-5 sm:w-6 sm:h-6" /></div>
              <div><h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Login Activity</h3><p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Review your recent login history.</p></div>
            </div>
            {activities.length>0&&(<button onClick={handleClearActivity} className="flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200 rounded-lg sm:rounded-xl transition-colors w-full sm:w-auto"><Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Clear All</button>)}
          </div>
          {activitiesLoading && <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading activity...</div>}
          {!activitiesLoading && activities.length === 0 && <div className="text-center py-12"><ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500 dark:text-slate-400">No recent login activity.</p></div>}
          {!activitiesLoading && activities.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              {activities.map(a => (
                <div key={a.id} className="p-3 sm:p-4 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:bg-slate-900 transition-colors rounded-xl sm:rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 transition-colors">
                  <div className="flex items-start gap-3 sm:gap-4 w-full md:w-auto">
                    <div className="bg-slate-100 dark:bg-slate-700 transition-colors p-2 sm:p-3 rounded-xl border border-slate-200/60 shadow-sm flex-shrink-0">{getDeviceIcon(a.device_type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                        {a.status==='Successful'?<CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500"/>:<XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500"/>}
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight">{a.browser} on {a.os}</h4>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 sm:gap-1.5"><Globe2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{a.location||'Unknown'}</p>
                      <p className="text-[10px] sm:text-xs text-slate-400 mt-1 font-mono bg-slate-100 dark:bg-slate-700 transition-colors px-1.5 py-0.5 rounded w-fit">IP: {a.ip_address}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full md:w-auto border-t border-slate-100 dark:border-slate-700 pt-3 md:border-none md:pt-0 md:gap-4">
                    <div className="text-left md:text-right">
                      <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">{formatDistanceToNow(new Date(a.timestamp),{addSuffix:true})}</p>
                      <p className={`text-[10px] sm:text-xs font-bold mt-0.5 sm:mt-1 ${a.status==='Successful'?'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded inline-block':'text-red-600 bg-red-50 px-1.5 py-0.5 rounded inline-block'}`}>{a.status}</p>
                    </div>
                    <button onClick={()=>handleDeleteActivity(a.id)} className="p-1.5 sm:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-colors active:scale-90"><Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="bg-white dark:bg-slate-800 transition-colors rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700"><div className="bg-rose-100 p-3 rounded-xl text-rose-600"><Bell className="w-6 h-6" /></div><div><h3 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h3><p className="text-sm text-slate-500 dark:text-slate-400">Choose what we get in touch with you about.</p></div></div>
      <div className="space-y-6">
        {[['Order Updates (Email)','Get updates on your order status.',emailNotifs,setEmailNotifs],['Order Updates (SMS)','Text messages when order is out for delivery.',smsNotifs,setSmsNotifs],['Promotions & Marketing','Offers, coupons and recommendations.',marketingNotifs,setMarketingNotifs]].map(([title,desc,val,setter])=>(
          <div key={title} className="flex items-center justify-between">
            <div><h4 className="font-bold text-slate-800 dark:text-slate-100">{title}</h4><p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p></div>
            <button onClick={()=>setter(!val)} className={`w-14 h-7 rounded-full transition-colors relative ${val?'bg-amber-500':'bg-slate-200 dark:bg-slate-600 transition-colors'}`}><div className={`w-5 h-5 bg-white dark:bg-slate-800 transition-colors rounded-full absolute top-1 transition-all ${val?'left-8':'left-1'}`} /></button>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end"><button onClick={()=>toast.success('Settings saved!')} className="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors">Save Preferences</button></div>
    </div>
  );

  const renderLanguage = () => (
    <div className="bg-white dark:bg-slate-800 transition-colors rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700"><div className="bg-emerald-100 p-3 rounded-xl text-emerald-600"><Globe className="w-6 h-6" /></div><div><h3 className="text-xl font-bold text-slate-900 dark:text-white">Language Settings</h3><p className="text-sm text-slate-500 dark:text-slate-400">Select your preferred language.</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['English','Hindi','Spanish','French','Bengali','Korean','Chinese','Japanese'].map(lang=>(
          <button key={lang} onClick={()=>{ setLanguage(lang); localStorage.setItem('appLanguage',lang); const map={English:'en',Hindi:'hi',Spanish:'es',French:'fr',Bengali:'bn',Korean:'ko',Chinese:'zh-CN',Japanese:'ja'}; const code=map[lang]||'en'; document.cookie=`googtrans=/en/${code}; path=/; domain=${window.location.hostname}`; document.cookie=`googtrans=/en/${code}; path=/`; toast.success(`Translating to ${lang}...`); setTimeout(()=>window.location.reload(),600); }} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${language===lang?'border-emerald-500 bg-emerald-50':'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-800 transition-colors'}`}>
            <span className="font-bold text-slate-800 dark:text-slate-100">{lang}</span>{language===lang&&<CheckCircle2 className="w-5 h-5 text-emerald-600"/>}
          </button>
        ))}
      </div>
    </div>
  );

  const renderHelp = () => (
    <div className="px-1 sm:px-0">
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/40 dark:to-slate-800/80 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl p-5 sm:p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/10 dark:bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-sm"><HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" /></div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Help & Support</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium ml-1">24/7 support — create tickets and track your cases</p>
        </div>
        <button onClick={()=>setShowTicketModal(true)} className="relative z-10 w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 active:scale-95 text-sm"><Edit2 className="w-4 h-4" /> New Ticket</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Mail, title: 'Email Support', sub: 'Response within 2-4 hours', btnLabel: 'Send Email', btnColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white', iconColor: 'text-emerald-500 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40' },
          { icon: Edit2, title: 'Submit a Ticket', sub: 'Track your issue step-by-step', btnLabel: 'Create Ticket', btnColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white', iconColor: 'text-indigo-500 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40', onClick: ()=>setShowTicketModal(true) },
          { icon: Phone, title: 'Call Helpdesk', sub: '1800-123-4567 · 24/7', btnLabel: 'Call Now', btnColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 hover:bg-amber-600 dark:hover:bg-amber-600 hover:text-white', iconColor: 'text-amber-500 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40' }
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-600 rounded-2xl p-5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl mb-3 ${card.iconColor}`}><card.icon className="w-6 h-6" /></div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">{card.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 flex-1">{card.sub}</p>
            <button onClick={card.onClick} className={`w-full py-2 border rounded-xl font-bold text-sm transition-colors active:scale-95 ${card.btnColor}`}>{card.btnLabel}</button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-600 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-indigo-500" /> FAQ</h3>
          <div className="space-y-3">
            {faqs.map((faq,i)=>(
              <div key={i} className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden bg-slate-50/50 transition-all">
                <button onClick={()=>setOpenFaq(openFaq===i?null:i)} className="w-full px-4 py-3 flex items-center justify-between bg-white dark:bg-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:bg-slate-900 transition-colors transition-colors text-left">
                  <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm pr-4">{faq.q}</span>
                  <span className={`text-slate-400 font-medium text-lg transition-transform duration-300 ${openFaq===i?'rotate-45 text-red-500':''}`}>+</span>
                </button>
                {openFaq===i && <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors"><p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-600 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-500" /> Recent Tickets</h3>
            {ticketsLoading ? <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">Loading...</div>
            : tickets.length===0 ? <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">No support tickets yet.</div>
            : <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {tickets.slice(0,5).map(t=>(
                  <div key={t.id} className="border border-slate-200 dark:border-slate-600 rounded-xl p-3 bg-slate-50/50 hover:bg-white dark:bg-slate-800 transition-colors transition-colors cursor-default">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{t.subject}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap border ${t.status==='Open'?'bg-amber-50 text-amber-700 border-amber-200':t.status==='Resolved'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-slate-100 dark:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'}`}>{t.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{t.message}</p>
                  </div>
                ))}
              </div>
            }
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 transition-colors border border-slate-200 dark:border-slate-600 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-slate-500 dark:text-slate-400" /> Support Policy</h3>
            <div className="space-y-0">
              {[
                { icon: Clock, label: 'Response Time', value: 'Within 4 hours' },
                { icon: Shield, label: 'Data Privacy', value: 'Encrypted & secure' },
                { icon: Globe, label: 'Availability', value: '24/7 online' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 last:pb-0 first:pt-0 border-b last:border-0 border-slate-200/80">
                  <span className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium"><item.icon className="w-4 h-4 text-slate-400" /> {item.label}</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showTicketModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 transition-colors w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2"><Edit2 className="w-5 h-5 text-indigo-500" /> Create Ticket</h3>
              <button onClick={()=>setShowTicketModal(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 transition-colors hover:bg-slate-100 dark:hover:bg-slate-600 dark:bg-slate-700 transition-colors p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmitTicket} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Subject</label>
                <input type="text" value={ticketForm.subject} onChange={e=>setTicketForm({...ticketForm,subject:e.target.value})} placeholder="What do you need help with?" required className="w-full bg-slate-50 dark:bg-slate-900 transition-colors border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:bg-slate-800 transition-colors focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Message</label>
                <textarea rows={4} value={ticketForm.message} onChange={e=>setTicketForm({...ticketForm,message:e.target.value})} placeholder="Describe your issue in detail..." required className="w-full bg-slate-50 dark:bg-slate-900 transition-colors border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:bg-slate-800 transition-colors focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none font-medium text-slate-900 dark:text-white" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setShowTicketModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:bg-slate-900 transition-colors transition-colors text-sm active:scale-95">Cancel</button>
                <button type="submit" disabled={submittingTicket} className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors active:scale-95 disabled:opacity-70 text-sm flex items-center justify-center gap-2 shadow-sm">
                  {submittingTicket ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting</> : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderFeedback = () => (
    <div className="bg-white dark:bg-slate-800 transition-colors rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mb-6"><MessageSquare className="w-10 h-10 text-sky-400" /></div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Feedback Center</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">An advanced feedback system is being built. Check back soon!</p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 font-bold rounded-xl text-sm"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Coming Soon</div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="bg-white dark:bg-slate-800 transition-colors rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700"><div className="bg-slate-900 p-3 rounded-xl text-white"><Shield className="w-6 h-6" /></div><div><h3 className="text-xl font-bold text-slate-900 dark:text-white">Privacy Center</h3><p className="text-sm text-slate-500 dark:text-slate-400">Manage your account data and privacy settings.</p></div></div>
      <div className="space-y-4">
        <div className="p-5 border border-slate-200 dark:border-slate-600 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"><div><h4 className="font-bold text-slate-900 dark:text-white">Request Account Data</h4><p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">Download a copy of your personal data, order history, and preferences.</p></div><button onClick={()=>toast('🚧 Coming Soon! This feature is under development.',{icon:'⏳',style:{borderRadius:'12px',background:'#1e293b',color:'#f8fafc',fontWeight:'600'}})} className="px-5 py-2 border border-slate-300 dark:border-slate-500 text-slate-700 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:bg-slate-900 transition-colors transition-colors whitespace-nowrap">Request Data</button></div>
        <div className="p-5 border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-colors"><div><h4 className="font-bold text-red-700 dark:text-red-400">Deactivate Account</h4><p className="text-sm text-red-500/80 dark:text-red-500/70 mt-1 max-w-md">Temporarily disable your account.</p></div><button onClick={()=>toast('🚧 Coming Soon! This feature is under development.',{icon:'⏳',style:{borderRadius:'12px',background:'#1e293b',color:'#f8fafc',fontWeight:'600'}})} className="px-5 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold rounded-lg border border-red-200 dark:border-red-800/50 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors whitespace-nowrap">Deactivate</button></div>
      </div>
    </div>
  );

  const renderMobileMenu = () => (
    <div className="flex flex-col gap-4 lg:hidden pb-10">
      {/* Header Card */}
      <div onClick={() => setActiveTab('profile')} className="cursor-pointer bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden flex items-center justify-between transition-all active:scale-[0.98]">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
         <div className="flex items-center gap-4 relative z-10">
           <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-xl font-bold border-2 border-white/30 overflow-hidden">
             {profilePic ? <img src={profilePic} alt="avatar" className="w-full h-full object-cover" /> : user.name.charAt(0).toUpperCase()}
           </div>
           <div>
             <h2 className="text-xl font-bold text-white leading-tight">{user.name}</h2>
             <p className="text-sm text-indigo-200 mt-0.5 line-clamp-1">{user.email}</p>
             {user.phone && <p className="text-xs text-indigo-300/80 mt-0.5">{user.phone}</p>}
           </div>
         </div>
         <div className="relative z-10 bg-indigo-800/80 px-3 py-1.5 rounded-full border border-indigo-500/50 flex items-center gap-1.5">
           <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
           <span className="text-xs font-bold text-amber-50">Plus</span>
         </div>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setActiveTab('orders')} className="bg-white dark:bg-slate-800 transition-colors p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left sm:text-center">
          <Package className="w-6 h-6 text-indigo-600" />
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">Orders</span>
        </button>
        <button onClick={() => setActiveTab('wishlist')} className="bg-white dark:bg-slate-800 transition-colors p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 shadow-sm hover:shadow-md hover:border-rose-200 transition-all text-left sm:text-center">
          <Heart className="w-6 h-6 text-rose-500" />
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">Wishlist</span>
        </button>
        <button onClick={() => setActiveTab('recent')} className="bg-white dark:bg-slate-800 transition-colors p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 shadow-sm hover:shadow-md hover:border-amber-200 transition-all text-left sm:text-center">
          <TicketPercent className="w-6 h-6 text-amber-500" />
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">Coupons</span>
        </button>
        <button onClick={() => setActiveTab('help')} className="bg-white dark:bg-slate-800 transition-colors p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left sm:text-center">
          <HelpCircle className="w-6 h-6 text-blue-500" />
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">Help Center</span>
        </button>
      </div>

      {/* Nav Lists */}
      {NAV_ITEMS.map((section, si) => (
        <div key={section.section} className="bg-white dark:bg-slate-800 transition-colors rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-50 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{section.section}</h3>
          </div>
          <div className="flex flex-col">
            {section.items.map((item, ii) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:bg-slate-900 transition-colors transition-colors ${ii !== section.items.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''}`}
                >
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                    <Icon className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Logout */}
      <button onClick={() => logout()} className="bg-white dark:bg-slate-800 transition-colors rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex items-center justify-between text-red-600 hover:bg-red-50 transition-colors shadow-sm mt-2">
        <div className="flex items-center gap-3 font-bold">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </div>
      </button>

    </div>
  );

  const renderTabContent = () => {
    switch(activeTab) {
      case 'menu': return renderMobileMenu();
      case 'profile': return renderProfile();
      case 'address': return renderAddress();
      case 'orders': return renderOrders();
      case 'wishlist': return renderWishlist();
      case 'reviews': return renderReviews();
      case 'recent': return renderRecent();
      case 'devices': return renderSecurity();
      case 'notifications': return renderNotifications();
      case 'language': return renderLanguage();
      case 'help': return renderHelp();
      case 'feedback': return renderFeedback();
      case 'privacy': return renderPrivacy();
      default: return window.innerWidth < 1024 ? renderMobileMenu() : renderProfile();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors pt-4 lg:pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">

        {/* Mobile Header (Back Button) */}
        {activeTab !== 'menu' && (
          <div className="lg:hidden flex items-center gap-3 mb-6">
             <button onClick={() => setActiveTab('menu')} className="p-2 bg-white dark:bg-slate-800 transition-colors rounded-full shadow-sm border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:bg-slate-900 transition-colors transition-colors">
               <ChevronLeft className="w-5 h-5" />
             </button>
             <h2 className="font-bold text-slate-900 dark:text-white text-lg capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

          {/* Desktop Sidebar */}
          <div className="hidden lg:flex flex-col gap-4">

            {/* User Card */}
            <div className="bg-white dark:bg-slate-800 transition-colors rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                  {profilePic ? <img src={profilePic} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Nav Links */}
            <div className="bg-white dark:bg-slate-800 transition-colors rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
              {NAV_ITEMS.map((section, si) => (
                <div key={section.section} className={si > 0 ? 'mt-5 pt-5 border-t border-slate-100 dark:border-slate-700' : ''}>
                  <p className="px-3 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">{section.section}</p>
                  <div className="space-y-0.5">
                    {section.items.map(item => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${isActive ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:bg-slate-900 transition-colors hover:text-slate-900 dark:text-white'}`}
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => logout()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 min-w-0">
            {renderTabContent()}
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;
