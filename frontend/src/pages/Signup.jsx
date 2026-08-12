import { useState, useContext, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, AlertCircle, KeyRound, Eye, EyeOff, RefreshCw, ShieldCheck } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import axios from 'axios';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [authMethod, setAuthMethod] = useState('select');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [bgImage, setBgImage] = useState('https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=1920&q=80');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        if (data && data.SIGNUP_BG_IMAGE) {
          setBgImage(data.SIGNUP_BG_IMAGE);
        }
      } catch (err) {
        console.error('Failed to fetch settings');
      }
    };
    fetchSettings();
  }, []);

  const { register, sendOTP, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleResendOTP = useCallback(async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg('');
    const result = await sendOTP(email);
    setIsResending(false);
    if (result.success) {
      setResendTimer(60);
      setOtp('');
      toast.success('New OTP sent to your email!');
    } else {
      setErrorMsg(result.error);
      toast.error(result.error);
    }
  }, [resendTimer, isResending, email, sendOTP]);

  const redirect = location.search ? location.search.split('=')[1] : '/';

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsSubmitting(true);
    const result = await googleLogin(credentialResponse.credential);
    setIsSubmitting(false);
    if (result.success) {
      if (result.isNewUser) {
        toast.success('🎉 Account created successfully! Welcome to LiveMart!');
      } else {
        toast.success('Welcome back! Signed in with Google.');
      }
      navigate(redirect);
    } else {
      setErrorMsg(result.error);
      toast.error(result.error);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (step === 1) {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match');
        return;
      }
      setIsSubmitting(true);
      const result = await sendOTP(email);
      setIsSubmitting(false);

      if (result.success) {
        toast.success('Verification code sent to your email!');
        setStep(2);
        setResendTimer(60); // start 60s countdown on first send
      } else {
        setErrorMsg(result.error);
        toast.error(result.error);
      }
    } else {
      setIsSubmitting(true);
      const result = await register(name, email, password, otp);
      setIsSubmitting(false);

      if (result.success) {
        toast.success('Account created successfully!');
        navigate(redirect);
      } else {
        setErrorMsg(result.error);
        toast.error(result.error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-row-reverse bg-slate-900">

      {/* Right Panel (visually): Branding & Image (Hidden on Mobile, Visible on Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url('${bgImage}')` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        <div className="relative z-10 p-12 text-center flex flex-col items-center">
          <Link to="/" className="flex items-center gap-4 mb-6 hover:scale-105 transition-transform">
            <img src="/logo.png" alt="LiveMart" className="h-16 w-16 rounded-2xl object-contain shadow-lg" />
            <div className="text-6xl font-black tracking-tighter">
              <span className="text-white">Live</span><span className="text-[#FF8C00]">Mart</span>
            </div>
          </Link>
          <p className="text-xl text-slate-300 max-w-md leading-relaxed font-medium">
            Join the LiveMart family today and unlock exclusive benefits, early access to new snacks, and special discounts.
          </p>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative overflow-hidden py-12 pt-24 lg:pt-12">
        {/* Decorative background elements for mobile/right panel */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px]"></div>

        <div className="w-full max-w-md px-4 sm:px-6 relative z-10">
          <div className="bg-white/10 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border border-white/20 lg:border-transparent p-8 sm:p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] lg:shadow-none">

            <div className="text-center mb-8">
              <Link to="/" className="lg:hidden flex items-center justify-center gap-2 mb-6 hover:scale-105 transition-transform">
                <img src="/logo.png" alt="LiveMart" className="h-10 w-10 rounded-xl object-contain shadow-sm" />
                <div className="text-4xl font-black tracking-tighter">
                  <span className="text-white">Live</span><span className="text-[#FF8C00]">Mart</span>
                </div>
              </Link>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Create Account
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Join LiveMart to unlock exclusive benefits
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-xl">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="ml-3 text-sm text-red-200 font-medium">{errorMsg}</p>
                </div>
              </div>
            )}

            {step === 1 && authMethod === 'select' && (
              <div className="w-full max-w-sm mx-auto flex flex-col items-center">
                <p className="text-slate-400 mb-8 font-medium">Get started - it's free.</p>
                
                <button
                  onClick={() => setAuthMethod('email')}
                  className="w-full py-3.5 px-4 bg-[#3B5998] hover:bg-[#314a80] text-white rounded-full font-bold text-sm tracking-wide transition-colors mb-6 shadow-md"
                >
                  SIGN UP WITH EMAIL
                </button>

                <div className="w-full flex items-center justify-between mb-6">
                  <div className="w-full h-px bg-slate-700"></div>
                  <span className="px-4 text-slate-400 text-sm">Or</span>
                  <div className="w-full h-px bg-slate-700"></div>
                </div>

                <div className="w-full space-y-4">
                  {/* Google Login Wrapper - We'll use the custom button style but still trigger the GoogleLogin invisible or via useGoogleLogin if we had it, but here we'll just style a normal button for now and we can hook it up */}
                  <div className="relative">
                    <div className="absolute inset-0 opacity-0 z-10">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setErrorMsg('Google sign in failed')}
                        size="large"
                        width="100%"
                      />
                    </div>
                    <button className="w-full relative flex justify-center items-center py-3.5 px-4 bg-transparent border border-slate-600 hover:border-slate-400 hover:bg-slate-800/50 text-white rounded-full font-bold text-sm tracking-wide transition-all">
                      <svg className="absolute left-4 w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      SIGN UP WITH GOOGLE
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form className={`space-y-5 ${step === 1 && authMethod === 'select' ? 'hidden' : ''}`} onSubmit={submitHandler}>
              {step === 1 ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {/* Email indicator */}
                  <div className="flex items-center gap-3 bg-slate-900/60 border border-amber-500/20 rounded-xl px-4 py-3">
                    <ShieldCheck className="h-5 w-5 text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Verification code sent to</p>
                      <p className="text-sm font-semibold text-white truncate">{email}</p>
                    </div>
                  </div>

                  {/* OTP input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                      6-Digit Verification Code
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <KeyRound className="h-5 w-5 text-amber-400" />
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="block w-full pl-11 pr-4 py-4 bg-slate-900/50 border border-amber-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 transition-all text-center tracking-[0.5em] font-black text-2xl"
                        placeholder="——————"
                        maxLength={6}
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Resend OTP */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {resendTimer > 0 ? (
                      <p className="text-xs text-slate-500">
                        Resend code in <span className="text-amber-400 font-bold">{resendTimer}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isResending}
                        className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
                        {isResending ? 'Sending...' : "Didn't receive it? Resend"}
                      </button>
                    )}
                  </div>

                  {/* Security tip */}
                  <p className="text-xs text-slate-500 text-center">
                    🔒 Never share this code with anyone. Expires in 10 minutes.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.3)] text-sm font-bold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-400 transition-all disabled:opacity-70 disabled:cursor-not-allowed group mt-6"
              >
                {isSubmitting ? 'Processing...' : (step === 1 ? 'Continue' : 'Create Account')}
                {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
              </button>
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-sm text-slate-400 hover:text-white transition-colors text-center mt-4"
                >
                  Back to details
                </button>
              )}
              {step === 1 && authMethod === 'email' && (
                <button
                  type="button"
                  onClick={() => setAuthMethod('select')}
                  className="w-full text-sm text-slate-400 hover:text-white transition-colors text-center mt-4"
                >
                  Back to options
                </button>
              )}
            </form>

            <div className="mt-8 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link
                to={redirect ? `/login?redirect=${redirect}` : '/login'}
                className="font-medium text-white hover:text-amber-400 transition-colors"
              >
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
