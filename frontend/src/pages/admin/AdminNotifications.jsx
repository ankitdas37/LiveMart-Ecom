import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Bell, Send, Users, MessageSquare, Megaphone, User, Tag, ShoppingBag, Info, AlertTriangle, Gift, Zap, History, RefreshCw } from 'lucide-react';

const QUICK_TEMPLATES = [
  { emoji: '🎉', label: 'Flash Sale', title: '🎉 Flash Sale is Live!', message: 'Hurry up! Limited time flash sale is now live. Get up to 50% off on selected products. Shop now before it ends! 🛒', type: 'promo' },
  { emoji: '📦', label: 'New Arrivals', title: '📦 New Products Just Arrived!', message: 'We have added exciting new products to our store. Check them out now and be the first to grab them! ✨', type: 'promo' },
  { emoji: '🚚', label: 'Free Delivery', title: '🚚 Free Delivery Today Only!', message: 'Enjoy FREE delivery on all orders today! No minimum order value. Order now and save on delivery charges. 💸', type: 'promo' },
  { emoji: '🎁', label: 'Special Offer', title: '🎁 Exclusive Offer Just For You!', message: 'You have an exclusive offer waiting! Check your profile for special discounts on your next purchase. 💝', type: 'promo' },
  { emoji: '⚠️', label: 'Maintenance', title: '⚠️ Scheduled Maintenance', message: 'Our site will undergo scheduled maintenance tonight from 12AM to 2AM. Service may be temporarily unavailable. Sorry for the inconvenience.', type: 'admin' },
  { emoji: '✅', label: 'Back In Stock', title: '✅ Item Back In Stock!', message: 'Great news! An item from your wishlist is back in stock. Visit the store and grab it before it sells out again! 🏃', type: 'order' },
];

const TYPE_CONFIG = {
  admin: { label: 'Admin / System', emoji: '🔔', color: 'indigo' },
  promo: { label: 'Promotion / Offer', emoji: '🎁', color: 'amber' },
  order: { label: 'Order Related', emoji: '📦', color: 'emerald' },
};

const AdminNotifications = () => {
  const { adminUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [recentlySent, setRecentlySent] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'admin',
    userId: '',
    sendToAll: false
  });



  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const config = { headers: { Authorization: `Bearer ${adminUser?.token}` } };
      const { data } = await axios.get('/api/users', config);
      setUsers(data);
    } catch (error) {
      console.error('fetchUsers error:', error.response?.data || error.message);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const applyTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      message: template.message,
      type: template.type,
    }));
    toast.success('Template applied!');
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error('Title and message are required');
      return;
    }
    if (!formData.sendToAll && !formData.userId) {
      toast.error('Select a user or enable Broadcast to All');
      return;
    }

    try {
      setIsSending(true);
      const config = { headers: { Authorization: `Bearer ${adminUser?.token}` } };
      const { data } = await axios.post('/api/notifications', formData, config);
      const successMsg = formData.sendToAll
        ? `📢 Broadcast sent to ${data.count || 'all'} users!`
        : '📨 Message delivered to user in real-time!';

      toast.success(successMsg, {
        duration: 4000,
        style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', borderRadius: '12px' }
      });

      // Save to recently sent
      setRecentlySent(prev => [{
        title: formData.title,
        message: formData.message,
        type: formData.type,
        target: formData.sendToAll ? 'All Users' : (users.find(u => u.id == formData.userId)?.name || 'User'),
        sentAt: new Date()
      }, ...prev].slice(0, 5));

      setFormData({ title: '', message: '', type: 'admin', userId: '', sendToAll: false });
      setUserSearch('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const selectedUser = users.find(u => u.id == formData.userId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Notification Center
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Send real-time messages directly to users. Delivered instantly via Socket.IO. ⚡
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-full border border-emerald-100 dark:border-emerald-800">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Real-Time Active
        </div>
      </div>

      {/* Quick Templates */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" /> Quick Templates
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {QUICK_TEMPLATES.map((t, i) => (
            <button
              key={i}
              onClick={() => applyTemplate(t)}
              className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
            >
              <div className="text-xl mb-1">{t.emoji}</div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{t.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" /> Compose Message
          </h3>
          <form onSubmit={handleSendNotification} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Notification Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-colors"
                placeholder="e.g. 🎉 Flash Sale Alert!"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Message Type</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(TYPE_CONFIG).map(([val, cfg]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: val }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${formData.type === val
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}
                  >
                    <div className="text-lg">{cfg.emoji}</div>
                    <div className="text-xs font-bold mt-1">{cfg.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-colors resize-none"
                placeholder="Write your message here... (you can use emojis 🎉)"
                required
              ></textarea>
              <p className="text-xs text-slate-400 mt-1 text-right">{formData.message.length} characters</p>
            </div>

            {/* Target */}
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 space-y-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" /> Recipients</h4>

              {/* Broadcast Toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-400 transition-all">
                <div className={`w-11 h-6 rounded-full transition-colors relative ${formData.sendToAll ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.sendToAll ? 'translate-x-6' : 'translate-x-1'}`}></div>
                  <input type="checkbox" name="sendToAll" checked={formData.sendToAll} onChange={handleInputChange} className="sr-only" />
                </div>
                <div>
                  <div className="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5 text-indigo-500" /> Broadcast to ALL Users
                  </div>
                  <div className="text-xs text-slate-500">{users.length} registered users will receive this</div>
                </div>
              </label>

              {/* Specific user picker */}
              {!formData.sendToAll && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="🔍 Search user by name or email..."
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-400 text-slate-900 dark:text-white"
                  />
                  {isLoading ? (
                    <p className="text-sm text-slate-500 px-2">Loading users...</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                      {filteredUsers.length === 0 ? (
                        <p className="text-sm text-slate-400 p-3 text-center">No users found</p>
                      ) : filteredUsers.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => { setFormData(prev => ({ ...prev, userId: u.id })); setUserSearch(''); }}
                          className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors ${formData.userId == u.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{u.name}</div>
                            <div className="text-xs text-slate-400 truncate">{u.email}</div>
                          </div>
                          {formData.userId == u.id && <span className="ml-auto text-xs font-bold text-indigo-500">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedUser && (
                    <div className="flex items-center gap-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {selectedUser.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Sending to: {selectedUser.name}</span>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, userId: '' }))} className="ml-auto text-slate-400 hover:text-red-500 text-xs">✕</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-indigo-200 dark:shadow-none active:scale-95 text-sm"
            >
              {isSending ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending in Real-Time...</>
              ) : (
                <><Send className="w-4 h-4" /> {formData.sendToAll ? `📢 Broadcast to All ${users.length} Users` : '📨 Send to User'}</>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar: Recent + Tips */}
        <div className="space-y-4">
          {/* Preview */}
          {(formData.title || formData.message) && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Live Preview</h3>
              <div className="bg-slate-900 rounded-xl p-4 text-white">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate">{formData.title || 'Notification Title'}</div>
                    <div className="text-xs text-slate-300 mt-1 line-clamp-3">{formData.message || 'Your message will appear here...'}</div>
                    <div className="text-[10px] text-slate-500 mt-2">just now</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recently Sent */}
          {recentlySent.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" /> Recently Sent
              </h3>
              <div className="space-y-3">
                {recentlySent.map((n, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{n.title}</div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">{n.message}</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-1.5">→ {n.target}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800 p-4">
            <h3 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Tips
            </h3>
            <ul className="space-y-2 text-xs text-amber-700 dark:text-amber-400">
              <li>⚡ Messages are delivered <strong>instantly</strong> via Socket.IO if the user is online</li>
              <li>💾 All notifications are also saved to the database for offline users</li>
              <li>🎨 Use emojis in titles for better visibility</li>
              <li>📢 Broadcast sends to all {users.length} registered users at once</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
