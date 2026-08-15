import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const { adminUser, adminLogin, adminVerifyLogin, adminGoogleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [authMethod, setAuthMethod] = useState('select'); // 'select' | 'email'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP States
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');

  // If already logged in as admin, redirect to admin panel
  useEffect(() => {
    if (adminUser && adminUser.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [adminUser, navigate]);

  const handleSuccess = (name) => {
    toast.success(`Welcome, ${name || 'Admin'}! 🛡️`);
    navigate('/admin', { replace: true });
  };

  const handleAccessDenied = (msg) => {
    const errMsg = msg || '🚫 Access Denied! This account does not have admin privileges. Contact the main admin to get access.';
    setErrorMsg(errMsg);
    toast.error('Access Denied! Admin privileges required.', { duration: 4000 });
    setIsSubmitting(false);
  };

  // Email login
  const submitHandler = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    const result = await adminLogin(email, password);
    setIsSubmitting(false);
    
    if (result.success) {
      if (result.requireOTP) {
        setOtpStep(true);
        toast.success(result.message || 'OTP sent to your email');
      } else {
        handleSuccess(JSON.parse(localStorage.getItem('adminInfo'))?.name);
      }
    } else {
      handleAccessDenied(result.error);
    }
  };

  // OTP Verification
  const otpSubmitHandler = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    const result = await adminVerifyLogin(email, otp);
    setIsSubmitting(false);
    
    if (result.success) {
      handleSuccess(JSON.parse(localStorage.getItem('adminInfo'))?.name);
    } else {
      handleAccessDenied(result.error);
    }
  };

  // Google login
  const handleGoogleSuccess = async (credentialResponse) => {
    setErrorMsg('');
    setIsSubmitting(true);
    const result = await adminGoogleLogin(credentialResponse.credential);
    if (result.success) {
      handleSuccess(JSON.parse(localStorage.getItem('adminInfo'))?.name);
    } else {
      handleAccessDenied(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]"></div>

      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 mb-4">
            <Shield className="w-8 h-8 text-amber-400" />
          </div>
          <div className="text-3xl font-black tracking-tighter">
            <span className="text-white">Live</span>
            <span className="text-[#FF8C00]">Mart</span>
          </div>
          <p className="text-slate-400 text-sm mt-1 font-medium">Admin Panel Access</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            {otpStep ? 'Verification Required' : 'Sign in as Administrator'}
          </h2>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 bg-red-500/10 border border-red-500/40 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{errorMsg}</p>
            </div>
          )}

          {!otpStep ? (
            <>
              {/* Auth Method Selection */}
              {authMethod === 'select' && (
                <div className="space-y-4">
                  {/* Email Button */}
                  <button
                    onClick={() => { setAuthMethod('email'); setErrorMsg(''); }}
                    className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    SIGN IN WITH EMAIL
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="text-slate-500 text-sm">Or</span>
                    <div className="flex-1 h-px bg-white/10"></div>
                  </div>

                  {/* Google Button */}
                  <div className="flex justify-center rounded-xl overflow-hidden shadow-lg border border-white/10 bg-white/5">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => handleAccessDenied('Google sign-in failed. Please try again.')}
                      theme="outline"
                      size="large"
                      width="300"
                      text="signin_with"
                    />
                  </div>
                </div>
              )}

              {/* Email Form */}
              {authMethod === 'email' && (
                <form onSubmit={submitHandler} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Admin Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        placeholder="admin@example.com"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-600 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-600 rounded-xl pl-11 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => { setAuthMethod('select'); setErrorMsg(''); }}
                      className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl border border-white/10 transition-all text-sm"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <><div className="w-5 h-5 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin"></div> Verifying...</>
                      ) : (
                        <><Shield className="w-4 h-4" /> Access</>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <form onSubmit={otpSubmitHandler} className="space-y-5">
              <p className="text-sm text-slate-300 text-center mb-4">
                Enter the 6-digit verification code sent to <span className="text-amber-400">{email}</span>
              </p>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Verification Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Zap className="h-5 w-5 text-amber-500" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-600 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-center tracking-[0.5em] font-bold text-xl"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setOtpStep(false); setOtp(''); }}
                  className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl border border-white/10 transition-all text-sm"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || otp.length !== 6}
                  className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><div className="w-5 h-5 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin"></div></>
                  ) : (
                    <>Verify & Login</>
                  )}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-xs text-slate-600 mt-6">
            Only authorized administrators can access this panel.
          </p>
        </div>

        <p className="text-center mt-6">
          <a href="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            ← Back to Store
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;

