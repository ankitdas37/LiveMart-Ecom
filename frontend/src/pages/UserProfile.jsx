import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import axios from 'axios';
import { Camera, User, Mail, Shield, Package, LogOut, CheckCircle2, MapPin, Bell, Globe, Heart, Activity, Clock, HelpCircle, MessageSquare, Trash2, X, Eye, EyeOff, Phone, Star, Plus, Edit2, Map, Navigation, Home, Briefcase, CheckCircle, ShoppingCart, ExternalLink, Settings, Smartphone, Laptop, Monitor, ShieldAlert, XCircle, Globe2 } from 'lucide-react';
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
    return urlTab || localStorage.getItem('userProfileActiveTab') || 'profile';
  };

  const [activeTab, setActiveTab] = useState(getTabFromUrl());

  useEffect(() => {
    const tab = getTabFromUrl();
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => { localStorage.setItem('userProfileActiveTab', activeTab); }, [activeTab]);

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
  const [addressForm, setAddressForm] = useState({ fullName:'', phone:'', altPhone:'', street:'', landmark:'', city:'Chinsurah', district:'Hooghly', state:'West Bengal', country:'India', pincode:'', is_default:false, addressType:'Home', policeStation:'', location_lat:'', location_lng:'' });

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
      const { data } = await axios.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
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
      setPassword(''); setOtpModalOpen(false); setOtp('');
    } catch (err) { setUpdateMessage({ type:'error', text: err.response?.data?.message || 'Update failed' }); }
    finally { setIsUpdating(false); }
  };

  const handleAddressInput = (e) => {
    const { name: n, value, type, checked } = e.target;
    if (n === 'pincode' && value && !/^\d{0,6}$/.test(value)) return;
    setAddressForm(prev => ({ ...prev, [n]: type === 'checkbox' ? checked : value }));
  };
  const openAddressForm = () => { setAddressForm(prev => ({ ...prev, phone: user.phone || '' })); setShowAddressForm(true); };
  const resetAddressForm = () => { setShowAddressForm(false); setIsEditingAddress(false); setEditAddressId(null); setAddressForm({ fullName:'', phone:'', altPhone:'', street:'', landmark:'', city:'Chinsurah', district:'Hooghly', state:'West Bengal', country:'India', pincode:'', is_default:false, addressType:'Home', policeStation:'', location_lat:'', location_lng:'' }); };
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (addressForm.pincode.length !== 6) { toast.error('Pincode must be 6 digits'); return; }
    try {
      if (isEditingAddress) { await axios.put(`/api/users/addresses/${editAddressId}`, addressForm, cfg()); toast.success('Address updated!'); }
      else { await axios.post('/api/users/addresses', addressForm, cfg()); toast.success('Address added!'); }
      fetchAddresses(); resetAddressForm();
    } catch (err) { toast.error(err.response?.data?.message || 'Something went wrong'); }
  };
  const handleEditAddress = (address) => { setAddressForm({ fullName:address.fullName, phone:address.phone, altPhone:address.altPhone||'', street:address.street, landmark:address.landmark||'', city:address.city, district:address.district, state:address.state, country:address.country, pincode:address.pincode, is_default:address.is_default, addressType:address.addressType||'Home', policeStation:address.policeStation||'', location_lat:address.location_lat||'', location_lng:address.location_lng||'' }); setEditAddressId(address.id); setIsEditingAddress(true); setShowAddressForm(true); };
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
        if (data?.address) { const a = data.address; if (a.postcode) fd.pincode = a.postcode.substring(0,6); const parts = [a.road,a.neighbourhood,a.suburb,a.village].filter(Boolean); if (parts.length) fd.street = parts.join(', '); }
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
    if (!type) return <Monitor className="w-5 h-5 text-slate-600" />;
    if (type.toLowerCase().includes('mobile')) return <Smartphone className="w-5 h-5 text-slate-600" />;
    return <Laptop className="w-5 h-5 text-slate-600" />;
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-amber-500 to-amber-600" />
      <div className="px-8 pb-8 relative">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
              {profilePic ? (<img src={profilePic} alt="Profile" className="w-full h-full rounded-full object-cover cursor-pointer" referrerPolicy="no-referrer" onClick={() => setShowImageModal(true)} />) : user.name.charAt(0).toUpperCase()}
            </div>
            <label className="absolute bottom-1 right-1 bg-amber-500 hover:bg-amber-600 p-2 rounded-full cursor-pointer shadow-md transition-all z-10 opacity-0 group-hover:opacity-100">
              {isUploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
            </label>
            {profilePic && (<button type="button" onClick={() => { setProfilePic(''); setUpdateMessage({ type:'success', text:'Image removed. Click Save to apply.' }); }} className="absolute bottom-1 left-1 bg-red-500 hover:bg-red-600 p-2 rounded-full cursor-pointer shadow-md transition-all z-10 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4 text-white" /></button>)}
          </div>
          <div className="text-center sm:text-left flex-1 mb-2">
            <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-slate-500">{user.role === 'admin' ? 'Administrator' : 'Customer'}</p>
          </div>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><User className="w-5 h-5 text-amber-500" /> Personal Information</h3>
        {updateMessage && (<div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${updateMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>{updateMessage.type === 'success' && <CheckCircle2 className="w-5 h-5" />}<p className="font-medium text-sm">{updateMessage.text}</p></div>)}
        <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><User className="w-5 h-5" /></div><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none font-medium text-slate-900" /></div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Mail className="w-5 h-5" /></div><input type="email" value={email} readOnly className="w-full pl-11 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-xl outline-none font-medium text-slate-500 cursor-not-allowed" /></div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Phone className="w-5 h-5" /></div>
                <input type="tel" maxLength={10} value={phone} readOnly={!isPhoneEditing} onChange={e => setPhone(e.target.value.replace(/\D/g,''))} className={`w-full pl-11 pr-16 py-3.5 border rounded-xl transition-all outline-none font-medium ${!isPhoneEditing ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10'}`} />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {!isPhoneEditing ? (<button type="button" onClick={() => setIsPhoneEditing(true)} className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg transition-colors">Edit</button>) : (<button type="button" onClick={() => { setIsPhoneEditing(false); setPhone(user?.phone || ''); }} className="text-xs font-bold text-slate-500 px-2.5 py-1.5 rounded-lg">Cancel</button>)}
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password <span className="normal-case font-normal text-slate-400">(Leave blank to keep current)</span></label>
              <div className="relative"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Shield className="w-5 h-5" /></div><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none font-medium text-slate-900" placeholder="Min. 6 characters" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>
            </div>
          </div>
          <button type="submit" disabled={isUpdating} className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50 flex items-center gap-2">
            {isUpdating ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : 'Save Changes'}
          </button>
        </form>
      </div>
      {showImageModal && profilePic && (<div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowImageModal(false)}><div className="relative max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}><button onClick={() => setShowImageModal(false)} className="absolute -top-12 right-0 text-white hover:text-amber-400"><X className="w-8 h-8" /></button><img src={profilePic} alt="Profile" className="w-72 h-72 mx-auto rounded-full object-cover border-4 border-white shadow-2xl" referrerPolicy="no-referrer" /><p className="text-center text-white/70 text-sm mt-4">Tap outside to close</p></div></div>)}
      {otpModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"><div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl"><div className="text-center mb-6"><div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4"><Shield className="w-7 h-7 text-amber-600" /></div><h3 className="text-xl font-bold text-slate-900 mb-1">Verify Identity</h3><p className="text-slate-500 text-sm">Enter the OTP sent to your registered email.</p></div><input type="text" inputMode="numeric" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))} className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none text-slate-900 mb-4" /><button onClick={() => executeSave(otp)} disabled={otp.length !== 6 || isUpdating} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2">{isUpdating ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Verifying...</> : 'Confirm Change'}</button></div></div>)}
    </div>
  );

  const renderAddress = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div><h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-amber-500" /> Saved Addresses</h3><p className="text-sm text-slate-500 mt-1">Manage where we deliver your orders.</p></div>
        {!showAddressForm && (<button onClick={openAddressForm} className="flex items-center gap-2 bg-amber-50 text-amber-600 hover:bg-amber-100 px-4 py-2 rounded-xl font-bold text-sm transition-colors"><Plus className="w-4 h-4" /> Add New</button>)}
      </div>
      {addressLoading ? (<div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" /></div>) : null}
      {!addressLoading && showAddressForm && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
          <h4 className="text-lg font-bold text-slate-800 mb-4">{isEditingAddress ? 'Edit Address' : 'Add New Address'}</h4>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div><h5 className="font-bold text-blue-900 flex items-center gap-2"><Navigation className="w-4 h-4" /> Pinpoint Your Location</h5><p className="text-sm text-blue-700">Help our delivery partners find you exactly.</p>{addressForm.location_lat && <p className="text-xs font-bold text-emerald-600 mt-1">Location Saved</p>}</div>
            <button type="button" onClick={fetchLocation} disabled={isFetchingLocation} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">{isFetchingLocation ? 'Fetching...' : 'Fetch Current Location'}</button>
          </div>
          <form onSubmit={handleAddressSubmit} className="space-y-5">
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="addressType" value="Home" checked={addressForm.addressType==='Home'} onChange={handleAddressInput} className="w-4 h-4 text-amber-500" /><span className="font-bold text-slate-700">Home</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="addressType" value="Office" checked={addressForm.addressType==='Office'} onChange={handleAddressInput} className="w-4 h-4 text-amber-500" /><span className="font-bold text-slate-700">Office</span></label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name <span className="text-red-500">*</span></label><input required type="text" name="fullName" value={addressForm.fullName} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none transition-all" /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pincode <span className="text-red-500">*</span></label><input required type="text" name="pincode" maxLength={6} value={addressForm.pincode} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none transition-all" placeholder="6-digit PIN" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone <span className="text-red-500">*</span></label><input required type="tel" name="phone" value={addressForm.phone} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none transition-all" /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alternate Phone</label><input type="tel" name="altPhone" value={addressForm.altPhone} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none transition-all" /></div>
            </div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Street Address <span className="text-red-500">*</span></label><textarea required name="street" rows={2} value={addressForm.street} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none transition-all resize-none" /></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Landmark</label><input type="text" name="landmark" value={addressForm.landmark} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none transition-all" placeholder="e.g. Near Apollo Pharmacy" /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">State <span className="text-red-500">*</span></label><select required name="state" value={addressForm.state} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none transition-all cursor-pointer"><option>West Bengal</option></select></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">District <span className="text-red-500">*</span></label><select required name="district" value={addressForm.district} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none transition-all cursor-pointer">{WB_DISTRICTS.map(d => <option key={d}>{d}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Police Station <span className="text-red-500">*</span></label><select required name="policeStation" value={addressForm.policeStation} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none transition-all cursor-pointer"><option value="">Select Police Station</option>{addressForm.district==='Hooghly' ? HOOGHLY_POLICE_STATIONS.map(ps=><option key={ps}>{ps}</option>) : <option value="Other">Other</option>}</select></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City/Town <span className="text-red-500">*</span></label><select required name="city" value={addressForm.city} onChange={handleAddressInput} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none transition-all cursor-pointer">{addressForm.district==='Hooghly' ? HOOGHLY_TOWNS.map(t=><option key={t}>{t}</option>) : <option value="Other">Other</option>}</select></div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" id="is_default" name="is_default" checked={addressForm.is_default} onChange={handleAddressInput} className="w-4 h-4 text-amber-500 rounded" /><label htmlFor="is_default" className="text-sm font-medium text-slate-700">Make this my default address</label></div>
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button type="submit" className="px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors">{isEditingAddress ? 'Save Changes' : 'Save Address'}</button>
              <button type="button" onClick={resetAddressForm} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {!addressLoading && !showAddressForm && addresses.length === 0 && (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200"><Map className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h4 className="text-lg font-bold text-slate-700 mb-2">No Addresses Found</h4><p className="text-slate-500 mb-6 text-sm">You have not saved any delivery addresses yet.</p><button onClick={openAddressForm} className="bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-amber-600 transition-colors">Add Your First Address</button></div>
      )}
      {!addressLoading && !showAddressForm && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(address => (
            <div key={address.id} className={`p-5 rounded-2xl border relative transition-all ${address.is_default ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200 hover:border-amber-300 bg-white'}`}>
              {address.is_default && (<div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> Default</div>)}
              <div className="flex items-start gap-3 mb-3"><div className="bg-slate-100 p-2 rounded-full text-slate-500">{address.addressType==='Office' ? <Briefcase className="w-5 h-5" /> : <Home className="w-5 h-5" />}</div><div><h4 className="font-bold text-slate-800">{address.fullName}</h4><p className="text-sm font-medium text-slate-500">{address.phone}</p></div></div>
              <div className="text-sm text-slate-600 space-y-1 mb-4 pl-12"><p>{address.street}</p>{address.landmark && <p className="text-amber-600">Near: {address.landmark}</p>}<p>{address.city}, {address.district}, {address.pincode}</p>{address.location_lat && <p className="text-xs text-blue-500 flex items-center gap-1"><Navigation className="w-3 h-3" /> GPS Saved</p>}</div>
              <div className="flex gap-2 pl-12 pt-4 border-t border-slate-100">
                <button onClick={() => handleEditAddress(address)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg"><Edit2 className="w-3 h-3" /> Edit</button>
                <button onClick={() => handleDeleteAddress(address.id)} className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg"><Trash2 className="w-3 h-3" /> Delete</button>
                {!address.is_default && <button onClick={() => handleSetDefault(address)} className="text-xs font-bold text-slate-600 hover:text-slate-800 ml-auto px-2 py-1.5">Set Default</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600"><Package className="w-6 h-6" /></div><div><h2 className="text-2xl font-black text-slate-900">My Orders</h2><p className="text-slate-500">Track and manage your orders</p></div></div>
      {isLoadingOrders && <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" /></div>}
      {!isLoadingOrders && orders.length === 0 && (<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center py-20"><Package className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h3 className="text-xl font-bold text-slate-900 mb-2">No Orders Yet</h3><p className="text-slate-500 mb-6">You have not placed any orders yet.</p><Link to="/shop" className="bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-amber-600 transition-colors inline-block">Start Shopping</Link></div>)}
      {!isLoadingOrders && orders.length > 0 && orders.map(order => (
        <Link to={`/order/${order.id}`} key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-amber-200 transition-all block">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className="font-bold text-slate-900">Order #{order.id}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${order.status==='Delivered'?'bg-emerald-100 text-emerald-700':order.status==='Cancelled'?'bg-red-100 text-red-700':order.status==='Processing'?'bg-blue-100 text-blue-700':'bg-amber-100 text-amber-700'}`}>{order.status}</span>
            </div>
            <p className="text-sm text-slate-500">Placed {new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} · Rs {order.totalPrice}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">{order.OrderItems?.slice(0,4).map((item,i)=>(<img key={i} src={(item.Product?.images&&item.Product.images[0])||'https://via.placeholder.com/40'} alt="p" className="w-10 h-10 rounded-full border-2 border-white object-cover bg-slate-100" />))}</div>
            <span className="bg-white border-2 border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold hover:border-amber-500 hover:text-amber-600 transition-colors text-sm whitespace-nowrap">View Details</span>
          </div>
        </Link>
      ))}
    </div>
  );

  const renderWishlist = () => (
    <div>
      <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-500"><Heart className="w-6 h-6" /></div><div><h2 className="text-2xl font-black text-slate-900">My Wishlist</h2><p className="text-slate-500">{wishlist.length} items saved</p></div></div>
      {wishlistLoading && <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" /></div>}
      {!wishlistLoading && wishlist.length === 0 && (<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center py-20"><Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h3 className="text-xl font-bold text-slate-900 mb-2">Your Wishlist is Empty</h3><p className="text-slate-500 mb-6">Save items you love to buy later.</p><Link to="/shop" className="bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-amber-600 transition-colors inline-block">Explore Products</Link></div>)}
      {!wishlistLoading && wishlist.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(item => {
            const p = item.Product; if (!p) return null;
            return (
              <div key={item.id} className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-amber-300 transition-all hover:shadow-md">
                <div className="relative h-48 bg-slate-50 p-4 flex items-center justify-center">
                  <img src={p.images&&p.images.length>0?p.images[0]:'https://placehold.co/400x400?text=No+Image'} alt={p.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500" />
                  <button onClick={async()=>{ try{ await axios.post('/api/wishlist',{productId:p.id},cfg()); setWishlist(wishlist.filter(i=>i.Product.id!==p.id)); toast.success('Removed from wishlist'); }catch(e){ toast.error('Failed'); }}} className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-sm text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <Link to={`/product/${p.id}`} className="hover:text-amber-500 transition-colors mb-1 flex-grow"><h4 className="font-bold text-slate-800 line-clamp-2">{p.name}</h4></Link>
                  <div className="flex items-center gap-2 mt-2 mb-4"><span className="text-lg font-black text-amber-600">Rs {p.price}</span>{p.originalPrice>p.price&&<span className="text-xs text-slate-400 line-through">Rs {p.originalPrice}</span>}</div>
                  <div className="flex gap-2 mt-auto">
                    <button onClick={()=>{ addToCart(p,1); toast.success(`${p.name} added!`); }} className="flex-1 bg-slate-900 text-white font-bold py-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm"><ShoppingCart className="w-4 h-4" /> Add to Cart</button>
                    <Link to={`/product/${p.id}`} className="w-10 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"><ExternalLink className="w-4 h-4" /></Link>
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
      <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600"><Star className="w-6 h-6" /></div><div><h2 className="text-2xl font-black text-slate-900">My Reviews</h2><p className="text-slate-500">Products you have reviewed</p></div></div>
      {isLoadingReviews && <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" /></div>}
      {!isLoadingReviews && reviews.length === 0 && (<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center py-20"><Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h3 className="text-xl font-bold text-slate-900 mb-2">No Reviews Yet</h3><p className="text-slate-500">Go to your orders to leave a review!</p></div>)}
      {!isLoadingReviews && reviews.length > 0 && reviews.map(review => (
        <div key={review.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex gap-4">
          <img src={(review.Product?.images&&review.Product.images[0])||'https://via.placeholder.com/100'} alt="product" className="w-20 h-20 rounded-xl object-cover bg-slate-100 flex-shrink-0" />
          <div className="flex-1"><h4 className="font-bold text-slate-900 mb-1">{review.Product?.name}</h4><div className="flex items-center gap-1 mb-2">{[1,2,3,4,5].map(s=>(<Star key={s} className={`w-4 h-4 ${s<=review.rating?'text-amber-400 fill-amber-400':'text-slate-200'}`}/>))}<span className="text-xs text-slate-500 ml-1">{review.rating}/5</span></div><p className="text-sm text-slate-600">{review.comment}</p><p className="text-xs text-slate-400 mt-2">{new Date(review.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p></div>
        </div>
      ))}
    </div>
  );

  const renderRecent = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6"><Clock className="w-10 h-10 text-slate-400" /></div>
      <h3 className="text-2xl font-black text-slate-900 mb-3">Recent Product Views</h3>
      <p className="text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">Track the products you have been browsing. This feature is coming soon!</p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Coming Soon</div>
    </div>
  );

  const renderSecurity = () => (
    <div>
      <div className="flex p-1 mb-6 bg-slate-200/60 rounded-xl w-fit">
        <button onClick={() => setSecurityTab('current')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${securityTab==='current'?'bg-white text-indigo-700 shadow-sm':'text-slate-500 hover:text-slate-700'}`}>Active Sessions</button>
        <button onClick={() => { setSecurityTab('history'); if(activities.length===0) fetchActivities(); }} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${securityTab==='history'?'bg-white text-indigo-700 shadow-sm':'text-slate-500 hover:text-slate-700'}`}>Login History</button>
      </div>
      {securityTab === 'current' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100"><div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><Settings className="w-6 h-6" /></div><div><h3 className="text-xl font-bold text-slate-900">Manage Devices</h3><p className="text-sm text-slate-500">View and manage where you are logged in.</p></div></div>
          {isLoadingSessions && <div className="text-center py-8 text-slate-500">Loading devices...</div>}
          {!isLoadingSessions && sessions.length === 0 && <div className="text-center py-8 text-slate-500">No active devices found.</div>}
          {!isLoadingSessions && sessions.length > 0 && (
            <div className="space-y-6">
              {sessions.map(session => (
                <div key={session.id} className={`border ${session.is_current?'border-indigo-200 bg-indigo-50/30':'border-slate-200'} rounded-2xl overflow-hidden shadow-sm`}>
                  <div className={`p-5 flex items-center justify-between border-b ${session.is_current?'border-indigo-100 bg-indigo-50/50':'border-slate-100 bg-slate-50'}`}>
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-3 rounded-xl border border-slate-200">{getDeviceIcon(session.device_type)}</div>
                      <div><h4 className={`font-bold text-lg flex items-center gap-3 ${session.is_current?'text-indigo-900':'text-slate-800'}`}>{session.browser} on {session.os}{session.is_current&&<span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase px-2.5 py-1 rounded-full font-extrabold tracking-wide">Current</span>}</h4><p className="text-sm text-slate-500 mt-0.5">Session: {session.id?.split('-')[0]}...</p></div>
                    </div>
                    <button onClick={()=>handleRevokeSession(session.id,session.is_current)} className="text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors">Log Out</button>
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                    {[['Device',session.device_type||'Unknown'],['OS',session.os||'Unknown'],['Browser',session.browser||'Unknown'],['IP',session.ip_address],['Location',session.location||'Unknown'],['Method',session.login_method||'Password'],['Login Time',session.login_time?format(new Date(session.login_time),'dd MMM yyyy, h:mm a'):'Unknown'],['Last Active',session.is_current?'Just now':formatDistanceToNow(new Date(session.last_active),{addSuffix:true})]].map(([k,v])=>(<div key={k} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0"><span className="text-slate-500 text-sm">{k}</span><span className="text-slate-800 font-semibold text-sm text-right">{v}</span></div>))}
                  </div>
                </div>
              ))}
              {sessions.length > 1 && <div className="pt-6 flex justify-end"><button onClick={handleRevokeAllOthers} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">Log out of all other devices</button></div>}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100"><div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Activity className="w-6 h-6" /></div><div className="flex-1"><h3 className="text-xl font-bold text-slate-900">Login Activity</h3><p className="text-sm text-slate-500">Review your recent login history.</p></div>{activities.length>0&&(<button onClick={handleClearActivity} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /> Clear All</button>)}</div>
          {activitiesLoading && <div className="text-center py-12 text-slate-500">Loading activity...</div>}
          {!activitiesLoading && activities.length === 0 && <div className="text-center py-12"><ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No recent login activity.</p></div>}
          {!activitiesLoading && activities.length > 0 && (
            <div className="space-y-4">
              {activities.map(a => (
                <div key={a.id} className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4"><div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">{getDeviceIcon(a.device_type)}</div><div><div className="flex items-center gap-2 mb-1">{a.status==='Successful'?<CheckCircle2 className="w-4 h-4 text-emerald-500"/>:<XCircle className="w-4 h-4 text-red-500"/>}<h4 className="font-bold text-slate-900">{a.browser} on {a.os}</h4></div><p className="text-sm text-slate-500 flex items-center gap-1.5"><Globe2 className="w-3.5 h-3.5" />{a.location||'Unknown'}</p><p className="text-xs text-slate-400 mt-1">IP: {a.ip_address}</p></div></div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end"><div className="text-right"><p className="text-sm font-bold text-slate-700">{formatDistanceToNow(new Date(a.timestamp),{addSuffix:true})}</p><p className={`text-xs font-bold mt-1 ${a.status==='Successful'?'text-emerald-600':'text-red-500'}`}>{a.status}</p></div><button onClick={()=>handleDeleteActivity(a.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100"><div className="bg-rose-100 p-3 rounded-xl text-rose-600"><Bell className="w-6 h-6" /></div><div><h3 className="text-xl font-bold text-slate-900">Notifications</h3><p className="text-sm text-slate-500">Choose what we get in touch with you about.</p></div></div>
      <div className="space-y-6">
        {[['Order Updates (Email)','Get updates on your order status.',emailNotifs,setEmailNotifs],['Order Updates (SMS)','Text messages when order is out for delivery.',smsNotifs,setSmsNotifs],['Promotions & Marketing','Offers, coupons and recommendations.',marketingNotifs,setMarketingNotifs]].map(([title,desc,val,setter])=>(
          <div key={title} className="flex items-center justify-between">
            <div><h4 className="font-bold text-slate-800">{title}</h4><p className="text-sm text-slate-500">{desc}</p></div>
            <button onClick={()=>setter(!val)} className={`w-14 h-7 rounded-full transition-colors relative ${val?'bg-amber-500':'bg-slate-200'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${val?'left-8':'left-1'}`} /></button>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end"><button onClick={()=>toast.success('Settings saved!')} className="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors">Save Preferences</button></div>
    </div>
  );

  const renderLanguage = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100"><div className="bg-emerald-100 p-3 rounded-xl text-emerald-600"><Globe className="w-6 h-6" /></div><div><h3 className="text-xl font-bold text-slate-900">Language Settings</h3><p className="text-sm text-slate-500">Select your preferred language.</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['English','Hindi','Spanish','French','Bengali','Korean','Chinese','Japanese'].map(lang=>(
          <button key={lang} onClick={()=>{ setLanguage(lang); localStorage.setItem('appLanguage',lang); const map={English:'en',Hindi:'hi',Spanish:'es',French:'fr',Bengali:'bn',Korean:'ko',Chinese:'zh-CN',Japanese:'ja'}; const code=map[lang]||'en'; document.cookie=`googtrans=/en/${code}; path=/; domain=${window.location.hostname}`; document.cookie=`googtrans=/en/${code}; path=/`; toast.success(`Translating to ${lang}...`); setTimeout(()=>window.location.reload(),600); }} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${language===lang?'border-emerald-500 bg-emerald-50':'border-slate-200 hover:border-slate-300 bg-white'}`}>
            <span className="font-bold text-slate-800">{lang}</span>{language===lang&&<CheckCircle2 className="w-5 h-5 text-emerald-600"/>}
          </button>
        ))}
      </div>
    </div>
  );

  const renderHelp = () => (
    <div style={{background:'#0d1117',minHeight:'80vh',borderRadius:'20px',padding:'24px',color:'#c9d1d9',position:'relative',overflow:'hidden',fontFamily:"'Inter',sans-serif"}}>
      <div style={{position:'absolute',top:0,right:0,width:'400px',height:'400px',background:'radial-gradient(circle,rgba(88,101,242,0.13) 0%,transparent 70%)',pointerEvents:'none'}} />
      <div style={{background:'linear-gradient(135deg,rgba(88,101,242,0.18) 0%,rgba(13,17,23,0.9) 100%)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'16px',padding:'22px 28px',marginBottom:'26px',display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:'16px'}}>
        <div><div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'6px'}}><span style={{fontSize:'26px'}}>🎧</span><h2 style={{margin:0,fontSize:'22px',fontWeight:900,background:'linear-gradient(135deg,#a78bfa,#ec4899)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Help &amp; Support</h2></div><p style={{margin:0,color:'#6b7280',fontSize:'13px'}}>24/7 support — create tickets and track your cases</p></div>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}><button onClick={()=>setShowTicketModal(true)} style={{background:'rgba(99,102,241,0.2)',border:'1px solid rgba(99,102,241,0.35)',color:'#a5b4fc',padding:'8px 16px',borderRadius:'10px',fontSize:'13px',fontWeight:700,cursor:'pointer'}}>🖊️ New Ticket</button></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'16px',marginBottom:'24px'}}>
        {[{emoji:'✉️',title:'Email Support',sub:'Response within 2-4 hours',btnLabel:'Send Email',btnBg:'#10b981',shadow:'rgba(16,185,129,0.35)',cardBg:'rgba(16,185,129,0.07)',border:'rgba(16,185,129,0.18)'},{emoji:'🎟️',title:'Submit a Ticket',sub:'Track your issue step-by-step',btnLabel:'Create Ticket',btnBg:'#6366f1',shadow:'rgba(99,102,241,0.35)',cardBg:'rgba(99,102,241,0.08)',border:'rgba(99,102,241,0.2)',onClick:()=>setShowTicketModal(true)},{emoji:'📞',title:'Call Helpdesk',sub:'1800-123-4567 · 24/7',btnLabel:'1800-123-4567',btnBg:'#92400e',btnColor:'#fde68a',shadow:'rgba(146,64,14,0.4)',cardBg:'rgba(245,158,11,0.06)',border:'rgba(245,158,11,0.15)'}].map((card,i)=>(
          <div key={i} style={{background:`linear-gradient(180deg,${card.cardBg} 0%,rgba(13,17,23,0.95) 100%)`,border:`1px solid ${card.border}`,borderRadius:'18px',padding:'28px 16px',display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center'}}>
            <div style={{fontSize:'24px',marginBottom:'14px'}}>{card.emoji}</div>
            <h3 style={{margin:'0 0 6px',color:'#fff',fontWeight:800,fontSize:'14px'}}>{card.title}</h3>
            <p style={{margin:'0 0 18px',color:'#6b7280',fontSize:'12px',lineHeight:1.6,flex:1}}>{card.sub}</p>
            <button onClick={card.onClick||undefined} style={{background:card.btnBg,color:card.btnColor||'#fff',border:'none',padding:'9px 18px',borderRadius:'10px',fontWeight:700,fontSize:'12px',cursor:'pointer',boxShadow:`0 4px 18px ${card.shadow}`}}>{card.btnLabel}</button>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'18px',padding:'20px'}}>
          <h3 style={{margin:'0 0 16px',color:'#fff',fontWeight:800,fontSize:'14px'}}>❓ Frequently Asked Questions</h3>
          <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>{faqs.map((faq,i)=>(
            <div key={i} style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:'10px',overflow:'hidden'}}>
              <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{width:'100%',padding:'12px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'none',border:'none',cursor:'pointer',textAlign:'left'}}>
                <span style={{color:'#e5e7eb',fontWeight:600,fontSize:'12px'}}>{faq.q}</span>
                <span style={{color:openFaq===i?'#f87171':'#6366f1',fontSize:'20px',lineHeight:1,display:'block',transform:openFaq===i?'rotate(45deg)':'none',flexShrink:0}}>+</span>
              </button>
              {openFaq===i&&<div style={{padding:'0 14px 12px',borderTop:'1px solid rgba(255,255,255,0.04)'}}><p style={{margin:'8px 0 0',color:'#9ca3af',fontSize:'12px',lineHeight:1.7}}>{faq.a}</p></div>}
            </div>
          ))}</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'18px',padding:'20px',flex:1}}>
            <h3 style={{margin:'0 0 16px',color:'#fff',fontWeight:800,fontSize:'14px'}}>🎟️ Your Recent Tickets</h3>
            {ticketsLoading ? <div style={{textAlign:'center',padding:'24px',color:'#6b7280',fontSize:'13px'}}>Loading...</div>
            : tickets.length===0 ? <div style={{textAlign:'center',padding:'24px',opacity:0.65}}><div style={{fontSize:'36px',marginBottom:'8px'}}>🎉</div><p style={{margin:0,color:'#6b7280',fontSize:'12px'}}>No support tickets yet!</p></div>
            : <div style={{display:'flex',flexDirection:'column',gap:'8px',maxHeight:'220px',overflowY:'auto'}}>{tickets.slice(0,5).map(t=>(
              <div key={t.id} style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:'10px',padding:'10px 12px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'4px'}}><span style={{color:'#f3f4f6',fontWeight:700,fontSize:'12px',flex:1,marginRight:'8px'}}>{t.subject}</span><span style={{fontSize:'10px',fontWeight:800,padding:'2px 8px',borderRadius:'20px',whiteSpace:'nowrap',background:t.status==='Open'?'rgba(245,158,11,0.15)':t.status==='Resolved'?'rgba(16,185,129,0.15)':'rgba(107,114,128,0.15)',color:t.status==='Open'?'#fbbf24':t.status==='Resolved'?'#34d399':'#9ca3af'}}>{t.status}</span></div>
                <p style={{margin:0,color:'#6b7280',fontSize:'12px'}}>{t.message?.substring(0,80)}{t.message?.length>80?'...':''}</p>
              </div>
            ))}</div>}
          </div>
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'18px',padding:'20px'}}>
            <h3 style={{margin:'0 0 14px',color:'#fff',fontWeight:800,fontSize:'14px'}}>🛡️ Support Policy</h3>
            {[['🕐','Response Time','Within 4 hours'],['🔒','Data Privacy','Encrypted & secure'],['🌐','Availability','24/7 email · 9AM-9PM phone']].map(([icon,label,value],i,arr)=>(
              <div key={label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,0.05)':'none'}}>
                <span style={{color:'#6b7280',fontSize:'12px'}}>{icon} {label}</span>
                <span style={{color:'#e5e7eb',fontWeight:600,fontSize:'11px',textAlign:'right',maxWidth:'50%'}}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showTicketModal&&(
        <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px',background:'rgba(0,0,0,0.85)',backdropFilter:'blur(8px)'}}>
          <div style={{background:'#0f172a',width:'100%',maxWidth:'480px',borderRadius:'24px',border:'1px solid rgba(255,255,255,0.1)',padding:'26px',boxShadow:'0 25px 60px rgba(0,0,0,0.7)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'22px'}}><h3 style={{margin:0,color:'#fff',fontWeight:800,fontSize:'17px'}}>🎟️ Create Support Ticket</h3><button onClick={()=>setShowTicketModal(false)} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'#9ca3af',width:'30px',height:'30px',borderRadius:'8px',cursor:'pointer',fontSize:'16px'}}>×</button></div>
            <form onSubmit={handleSubmitTicket} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div><label style={{display:'block',color:'#9ca3af',fontSize:'11px',fontWeight:700,textTransform:'uppercase',marginBottom:'7px'}}>Subject</label><input type="text" value={ticketForm.subject} onChange={e=>setTicketForm({...ticketForm,subject:e.target.value})} placeholder="What do you need help with?" required style={{width:'100%',boxSizing:'border-box',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'11px 14px',color:'#f3f4f6',fontSize:'14px',outline:'none',fontFamily:'inherit'}} /></div>
              <div><label style={{display:'block',color:'#9ca3af',fontSize:'11px',fontWeight:700,textTransform:'uppercase',marginBottom:'7px'}}>Message</label><textarea rows={5} value={ticketForm.message} onChange={e=>setTicketForm({...ticketForm,message:e.target.value})} placeholder="Describe your issue in detail..." required style={{width:'100%',boxSizing:'border-box',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'11px 14px',color:'#f3f4f6',fontSize:'14px',outline:'none',resize:'none',fontFamily:'inherit'}} /></div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:'10px'}}><button type="button" onClick={()=>setShowTicketModal(false)} style={{padding:'10px 18px',borderRadius:'10px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#9ca3af',fontWeight:700,fontSize:'14px',cursor:'pointer'}}>Cancel</button><button type="submit" disabled={submittingTicket} style={{padding:'10px 22px',borderRadius:'10px',background:'#6366f1',border:'none',color:'#fff',fontWeight:700,fontSize:'14px',cursor:'pointer',opacity:submittingTicket?0.75:1}}>{submittingTicket?'Submitting...':'Submit Ticket'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderFeedback = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mb-6"><MessageSquare className="w-10 h-10 text-sky-400" /></div>
      <h3 className="text-2xl font-black text-slate-900 mb-3">Feedback Center</h3>
      <p className="text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">An advanced feedback system is being built. Check back soon!</p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Coming Soon</div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100"><div className="bg-slate-900 p-3 rounded-xl text-white"><Shield className="w-6 h-6" /></div><div><h3 className="text-xl font-bold text-slate-900">Privacy Center</h3><p className="text-sm text-slate-500">Manage your account data and privacy settings.</p></div></div>
      <div className="space-y-4">
        <div className="p-5 border border-slate-200 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"><div><h4 className="font-bold text-slate-900">Request Account Data</h4><p className="text-sm text-slate-500 mt-1 max-w-md">Download a copy of your personal data, order history, and preferences.</p></div><button onClick={()=>toast('🚧 Coming Soon! This feature is under development.',{icon:'⏳',style:{borderRadius:'12px',background:'#1e293b',color:'#f8fafc',fontWeight:'600'}})} className="px-5 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap">Request Data</button></div>
        <div className="p-5 border border-red-200 bg-red-50/50 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"><div><h4 className="font-bold text-red-700">Deactivate Account</h4><p className="text-sm text-red-500/80 mt-1 max-w-md">Temporarily disable your account.</p></div><button onClick={()=>toast('🚧 Coming Soon! This feature is under development.',{icon:'⏳',style:{borderRadius:'12px',background:'#1e293b',color:'#f8fafc',fontWeight:'600'}})} className="px-5 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition-colors whitespace-nowrap">Deactivate</button></div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch(activeTab) {
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
      default: return renderProfile();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">

        {/* Mobile Scroll Tabs */}
        <div className="lg:hidden -mx-4 px-4 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          <div className="flex gap-2 w-max">
            {NAV_ITEMS.flatMap(s => s.items).map(item => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeTab===item.id?'bg-amber-500 text-white shadow-sm':'bg-white text-slate-600 border border-slate-200'}`}>
                  <Icon className="w-4 h-4" />{item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

          {/* Desktop Sidebar */}
          <div className="hidden lg:flex flex-col gap-4">

            {/* User Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                  {profilePic ? <img src={profilePic} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Nav Links */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              {NAV_ITEMS.map((section, si) => (
                <div key={section.section} className={si > 0 ? 'mt-5 pt-5 border-t border-slate-100' : ''}>
                  <p className="px-3 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">{section.section}</p>
                  <div className="space-y-0.5">
                    {section.items.map(item => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${isActive ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="pt-5 mt-5 border-t border-slate-100">
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
