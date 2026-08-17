import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Settings as SettingsIcon } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    SHIPPING_CHARGE: 0,
    FREE_SHIPPING_MIN_ORDER_VALUE: 200,
    BEST_SELLER_TITLE: '',
    BEST_SELLER_SUBTITLE: '',
    PAYMENT_UPI_ID: 'merchant@upi',
    PAYMENT_QR_CODE: '',
    PAYMENT_COD_ENABLED: true,
    PAYMENT_ONLINE_ENABLED: true,
    CONTACT_PHONE: '',
    CONTACT_EMAIL: '',
    CONTACT_ADDRESS: '',
    LOGIN_BG_IMAGE: '',
    SIGNUP_BG_IMAGE: ''
  });
  const [isUploadingQR, setIsUploadingQR] = useState(false);
  const [isUploadingLogin, setIsUploadingLogin] = useState(false);
  const [isUploadingSignup, setIsUploadingSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Failed to fetch settings', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleQRUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const uploadData = new FormData();
    uploadData.append('image', file);
    
    try {
      setIsUploadingQR(true);
      const res = await axios.post('/api/upload', uploadData);
      setSettings(prev => ({ ...prev, PAYMENT_QR_CODE: res.data.url }));
      setMessage({ type: 'success', text: "QR Code uploaded temporarily. Don't forget to Save Settings!" });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload QR image.' });
    } finally {
      setIsUploadingQR(false);
    }
  };

  const handleAuthImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const uploadData = new FormData();
    uploadData.append('image', file);
    
    const setUploading = fieldName === 'LOGIN_BG_IMAGE' ? setIsUploadingLogin : setIsUploadingSignup;
    
    try {
      setUploading(true);
      const res = await axios.post('/api/upload', uploadData);
      setSettings(prev => ({ ...prev, [fieldName]: res.data.url }));
      setMessage({ type: 'success', text: "Image uploaded temporarily. Don't forget to Save Settings!" });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload image.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    try {
      const payload = Object.keys(settings).map(key => {
        let type = 'STRING';
        if (typeof settings[key] === 'number' || (!isNaN(parseFloat(settings[key])) && typeof settings[key] !== 'boolean' && key !== 'PAYMENT_UPI_ID')) {
          type = 'NUMBER';
        } else if (typeof settings[key] === 'boolean') {
          type = 'BOOLEAN';
        }
        return {
          key,
          value: typeof settings[key] === 'boolean' ? String(settings[key]) : settings[key],
          type
        };
      });

      await axios.put('/api/settings', payload);
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <SettingsIcon className="w-8 h-8 text-slate-700 dark:text-slate-300" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Global Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage store configuration and charges</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b pb-4">Checkout Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Flat Shipping Charge (₹)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 dark:text-slate-400 font-medium">
                  ₹
                </span>
                <input 
                  type="number" 
                  name="SHIPPING_CHARGE" 
                  value={settings.SHIPPING_CHARGE} 
                  onChange={handleChange} 
                  required 
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                This amount will be added to every order as a shipping fee if order value is below minimum. Set to 0 for free shipping on all orders.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Min. Order Value for Free Delivery (₹)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 dark:text-slate-400 font-medium">
                  ₹
                </span>
                <input 
                  type="number" 
                  name="FREE_SHIPPING_MIN_ORDER_VALUE" 
                  value={settings.FREE_SHIPPING_MIN_ORDER_VALUE !== undefined ? settings.FREE_SHIPPING_MIN_ORDER_VALUE : 200} 
                  onChange={handleChange} 
                  required 
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Orders above this amount will get free shipping (for global shipping items).
              </p>
            </div>
            
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b pb-4">Payment Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Merchant UPI ID
              </label>
              <input 
                type="text" 
                name="PAYMENT_UPI_ID" 
                value={settings.PAYMENT_UPI_ID || ''} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="e.g. merchant@upi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Payment QR Code Image
              </label>
              <div className="flex items-center space-x-4">
                {settings.PAYMENT_QR_CODE && (
                  <div className="relative w-16 h-16 border rounded-lg overflow-hidden flex-shrink-0">
                    <img src={settings.PAYMENT_QR_CODE} alt="QR Code" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setSettings({...settings, PAYMENT_QR_CODE: ''})}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-xs font-bold"
                    >
                      X
                    </button>
                  </div>
                )}
                <div className="flex-1">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleQRUpload}
                    disabled={isUploadingQR}
                    className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 transition-colors cursor-pointer"
                  />
                  {isUploadingQR && <p className="text-xs text-amber-600 mt-1">Uploading...</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Enabled Payment Methods</h3>
            <div className="flex flex-col space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="PAYMENT_COD_ENABLED"
                  checked={settings.PAYMENT_COD_ENABLED}
                  onChange={handleChange}
                  className="w-5 h-5 text-amber-600 rounded border-slate-300 dark:border-slate-600 focus:ring-amber-500"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Cash on Delivery (COD)</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="PAYMENT_ONLINE_ENABLED"
                  checked={settings.PAYMENT_ONLINE_ENABLED}
                  onChange={handleChange}
                  className="w-5 h-5 text-amber-600 rounded border-slate-300 dark:border-slate-600 focus:ring-amber-500"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Pay Online (Manual UPI / Bank Transfer)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b pb-4">Contact Details (shown on invoices &amp; receipts)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Contact Phone Number</label>
              <input type="text" name="CONTACT_PHONE" value={settings.CONTACT_PHONE || ''} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. +91 9876543210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Contact Email</label>
              <input type="email" name="CONTACT_EMAIL" value={settings.CONTACT_EMAIL || ''} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. support@W!FOMART.in" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Business Address</label>
              <input type="text" name="CONTACT_ADDRESS" value={settings.CONTACT_ADDRESS || ''} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. 123 Main Street, Kolkata, WB" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b pb-4">Authentication Pages</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Login Page Background Image
              </label>
              <div className="flex items-center space-x-4">
                {settings.LOGIN_BG_IMAGE && (
                  <div className="relative w-16 h-16 border rounded-lg overflow-hidden flex-shrink-0">
                    <img src={settings.LOGIN_BG_IMAGE} alt="Login BG" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setSettings({...settings, LOGIN_BG_IMAGE: ''})}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-xs font-bold"
                    >
                      X
                    </button>
                  </div>
                )}
                <div className="flex-1">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleAuthImageUpload(e, 'LOGIN_BG_IMAGE')}
                    disabled={isUploadingLogin}
                    className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 transition-colors cursor-pointer"
                  />
                  {isUploadingLogin && <p className="text-xs text-amber-600 mt-1">Uploading...</p>}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Signup Page Background Image
              </label>
              <div className="flex items-center space-x-4">
                {settings.SIGNUP_BG_IMAGE && (
                  <div className="relative w-16 h-16 border rounded-lg overflow-hidden flex-shrink-0">
                    <img src={settings.SIGNUP_BG_IMAGE} alt="Signup BG" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setSettings({...settings, SIGNUP_BG_IMAGE: ''})}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-xs font-bold"
                    >
                      X
                    </button>
                  </div>
                )}
                <div className="flex-1">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleAuthImageUpload(e, 'SIGNUP_BG_IMAGE')}
                    disabled={isUploadingSignup}
                    className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 transition-colors cursor-pointer"
                  />
                  {isUploadingSignup && <p className="text-xs text-amber-600 mt-1">Uploading...</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b pb-4">Home Page Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Best Sellers Section Title
              </label>
              <input 
                type="text" 
                name="BEST_SELLER_TITLE" 
                value={settings.BEST_SELLER_TITLE || ''} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="e.g. Best Sellers"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Best Sellers Section Subtitle
              </label>
              <input 
                type="text" 
                name="BEST_SELLER_SUBTITLE" 
                value={settings.BEST_SELLER_SUBTITLE || ''} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="e.g. Our most loved products"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSaving}
          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center disabled:opacity-70"
        >
          <Save className="w-5 h-5 mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;

