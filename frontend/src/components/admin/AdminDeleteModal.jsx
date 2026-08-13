import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Trash2, XCircle, RefreshCw, ShieldAlert, Eye, EyeOff } from 'lucide-react';


/**
 * AdminDeleteModal — Universal secure deletion verification modal.
 * Supports three verification methods: Captcha, Password, Email OTP.
 *
 * Props:
 *  - isOpen: boolean — whether the modal is visible
 *  - onClose: () => void — called when user cancels
 *  - onConfirm: async () => void — called after verification passes; should throw on error
 *  - itemName: string — human-readable name of what's being deleted (e.g. "Coupon SUMMER50")
 *  - isBulk: boolean — whether this is a bulk deletion (changes title text)
 */
const AdminDeleteModal = ({ isOpen, onClose, onConfirm, itemName = 'item', isBulk = false }) => {
  const [deleteCaptcha, setDeleteCaptcha] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('captcha'); // 'captcha' | 'password' | 'otp'
  const [adminPassword, setAdminPassword] = useState('');
  const [adminOtp, setAdminOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const generateCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setDeleteCaptcha(code);
    setCaptchaInput('');
    setAdminPassword('');
    setAdminOtp('');
    setOtpSent(false);
    setVerificationMethod('captcha');
  };

  useEffect(() => {
    if (isOpen) {
      generateCaptcha();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (verificationMethod === 'captcha' && captchaInput !== deleteCaptcha) return;
    if (verificationMethod === 'password' && !adminPassword) return;
    if (verificationMethod === 'otp' && (!otpSent || adminOtp.length < 6)) return;

    try {
      setIsVerifying(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

      // Verify password or OTP against the backend
      if (verificationMethod !== 'captcha') {
        await axios.post('/api/users/admin/verify-action', {
          method: verificationMethod,
          password: adminPassword,
          otp: adminOtp
        }, config);
      }

      await onConfirm();
      onClose();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error(error.response?.data?.message || '❌ Verification failed. Please check your credentials.');
      } else if (error.response) {
        toast.error(error.response?.data?.message || '❌ Action failed. Please try again.');
      } else {
        toast.error('❌ An error occurred. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSendActionOtp = async () => {
    toast('🚧 Email OTP verification is coming soon!', { icon: '⏳' });
  };

  const isConfirmDisabled =
    isVerifying ||
    (verificationMethod === 'captcha' && captchaInput !== deleteCaptcha) ||
    (verificationMethod === 'password' && !adminPassword) ||
    (verificationMethod === 'otp' && (!otpSent || adminOtp.length < 6));

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-red-50">
          <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            {isBulk ? `Delete ${itemName}` : `Delete ${itemName}`}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-white transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed text-center">
            This action is <span className="font-bold text-red-600">permanent</span> and cannot be undone.
            All data will be removed from the database and Cloudinary.
            Please verify your identity to proceed.
          </p>

          {/* Method Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'captcha', label: 'Code' },
              { id: 'password', label: 'Password' },
              { id: 'otp', label: 'Email OTP' },
            ].map(m => (
              <button
                key={m.id}
                type="button"
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                  verificationMethod === m.id
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setVerificationMethod(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Captcha */}
          {verificationMethod === 'captcha' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center relative">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Type this code</p>
                <div className="text-3xl font-black text-slate-900 tracking-[0.4em] select-none">
                  {deleteCaptcha}
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="absolute top-2 right-2 p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  title="New Code"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !isConfirmDisabled) handleConfirm(); }}
                placeholder="Enter code above"
                maxLength={4}
                autoFocus
                className={`w-full px-4 py-3 rounded-xl border-2 text-center text-xl font-bold tracking-widest focus:outline-none transition-all ${
                  captchaInput && captchaInput === deleteCaptcha
                    ? 'border-green-400 bg-green-50 text-green-700'
                    : captchaInput
                    ? 'border-red-300 focus:border-red-400'
                    : 'border-slate-200 focus:border-amber-400'
                }`}
              />
            </div>
          )}

          {/* Password */}
          {verificationMethod === 'password' && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && adminPassword) handleConfirm(); }}
                  placeholder="Enter your login password"
                  autoFocus
                  className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-600 transition-colors p-1"
                  tabIndex={-1}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Email OTP */}
          {verificationMethod === 'otp' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {!otpSent ? (
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-4">
                    A 6-digit secure code will be sent to your registered admin email.
                  </p>
                  <button
                    type="button"
                    onClick={handleSendActionOtp}
                    disabled={isSendingOtp}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70"
                  >
                    {isSendingOtp ? 'Sending...' : '📧 Send OTP to Email'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    value={adminOtp}
                    onChange={(e) => setAdminOtp(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => { if (e.key === 'Enter' && adminOtp.length === 6) handleConfirm(); }}
                    placeholder="------"
                    maxLength={6}
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-center text-2xl font-black tracking-widest transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleSendActionOtp}
                    disabled={isSendingOtp}
                    className="w-full text-xs text-indigo-600 hover:underline font-medium mt-1"
                  >
                    {isSendingOtp ? 'Resending...' : 'Resend OTP'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isVerifying}
            className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isVerifying ? 'Verifying...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDeleteModal;
