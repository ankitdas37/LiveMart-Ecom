import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Mail, Lock, ArrowRight, ShieldCheck, Zap, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState('select');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bgImage, setBgImage] = useState('https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=1920&q=80');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        if (data && data.LOGIN_BG_IMAGE) {
          setBgImage(data.LOGIN_BG_IMAGE);
        }
      } catch (err) {
        console.error('Failed to fetch settings');
      }
    };
    fetchSettings();
  }, []);

  const { login, googleLogin } = useContext(AuthContext);
  const { syncLocalCartToDb } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = location.search ? location.search.split('=')[1] : '/';

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsSubmitting(true);
    const result = await googleLogin(credentialResponse.credential, true);
    setIsSubmitting(false);
    if (result.success) {
      toast.success(`✅ Welcome back, ${result.user.name}!`);
      await syncLocalCartToDb();
      navigate(redirect);
    } else {
      setErrorMsg(result.error);
      toast.error(result.error);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`);
      await syncLocalCartToDb();
      navigate(redirect);
    } else {
      setErrorMsg(result.error);
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900">

      {/* Left Panel: Branding & Image (Hidden on Mobile, Visible on Desktop) */}
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
            Your ultimate destination for the freshest biscuits, crunchiest snacks, and delicious cakes.
          </p>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative overflow-hidden pt-20 lg:pt-0">
        {/* Decorative background elements for mobile/right panel */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[120px]"></div>

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
                Welcome Back
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Log in to your LiveMart account
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-xl">
                <div className="flex">
                  <ShieldCheck className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="ml-3 text-sm text-red-200 font-medium">{errorMsg}</p>
                </div>
              </div>
            )}

            {authMethod === 'select' && (
              <div className="w-full max-w-sm mx-auto flex flex-col items-center">
                
                <button
                  onClick={() => setAuthMethod('email')}
                  className="w-full py-3.5 px-4 bg-[#3B5998] hover:bg-[#314a80] text-white rounded-full font-bold text-sm tracking-wide transition-colors mb-6 shadow-md"
                >
                  LOGIN WITH EMAIL
                </button>

                <div className="w-full flex items-center justify-between mb-6">
                  <div className="w-full h-px bg-slate-700"></div>
                  <span className="px-4 text-slate-400 text-sm">Or</span>
                  <div className="w-full h-px bg-slate-700"></div>
                </div>

                <div className="w-full space-y-4">
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
                      LOGIN WITH GOOGLE
                    </button>
                  </div>
                </div>

              </div>
            )}

            <form className={`space-y-5 ${authMethod === 'select' ? 'hidden' : ''}`} onSubmit={submitHandler}>
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
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <label className="block text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                    placeholder="••••••••"
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.3)] text-sm font-bold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-400 transition-all disabled:opacity-70 disabled:cursor-not-allowed group mt-4"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
                {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
              </button>
              
              {authMethod === 'email' && (
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
              Don't have an account?{' '}
              <Link
                to={redirect ? `/signup?redirect=${redirect}` : '/signup'}
                className="font-medium text-white hover:text-amber-400 transition-colors"
              >
                Create one now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
