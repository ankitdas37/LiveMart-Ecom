import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import PageLoader from './components/PageLoader';
import ScrollToTop from './components/ScrollToTop';

// Lazy load standard pages
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Payment = lazy(() => import('./pages/Payment'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const About = lazy(() => import('./pages/About'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const OrderHelp = lazy(() => import('./pages/OrderHelp'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const FAQ = lazy(() => import('./pages/FAQ'));
const TechSupport = lazy(() => import('./pages/TechSupport'));

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';

// Lazy load admin pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const AdminPincodes = lazy(() => import('./pages/admin/AdminPincodes'));
const ReviewsAdmin = lazy(() => import('./pages/admin/ReviewsAdmin'));
const AdminHero = lazy(() => import('./pages/admin/AdminHero'));
const AdminBestSellers = lazy(() => import('./pages/admin/AdminBestSellers'));
const AdminExtraCharges = lazy(() => import('./pages/admin/AdminExtraCharges'));
const AdminOnlinePayments = lazy(() => import('./pages/admin/AdminOnlinePayments'));
const AdminNotes = lazy(() => import('./pages/admin/AdminNotes'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminSupport = lazy(() => import('./pages/admin/AdminSupport'));
const ReturnsList = lazy(() => import('./pages/admin/ReturnsList'));

// Layout for the main storefront
const StoreLayout = () => {
  const location = useLocation();
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    // If language is not English, briefly fade out the main content on navigation
    // This gives Google Translate time to translate the new DOM nodes without showing a flash of English
    const lang = localStorage.getItem('appLanguage');
    if (lang && lang !== 'English') {
      setIsTranslating(true);
      const timer = setTimeout(() => {
        setIsTranslating(false);
      }, 400); // 400ms is exactly enough for Google Translate to finish
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
      <Navbar />
      <main className={`flex-grow pt-[84px] md:pt-24 pb-20 md:pb-0 transition-opacity duration-200 ${isTranslating ? 'opacity-0' : 'opacity-100'}`}>
        <Outlet />
      </main>
      {isTranslating && <PageLoader />}
      <Footer />
      <MobileNav />
    </div>
  );
};

import { ServerStatusProvider, ServerStatusContext } from './context/ServerStatusContext';
const ServerDownPage = lazy(() => import('./components/ServerDownPage'));

// A wrapper to handle the global offline state without polluting the main App render function
const AppContent = () => {
  const { isServerDown, checkServerStatus } = React.useContext(ServerStatusContext);

  if (isServerDown) {
    return (
      <Suspense fallback={<PageLoader />}>
        <ServerDownPage onRetry={checkServerStatus} />
      </Suspense>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '10px',
            padding: '16px',
            fontWeight: 'bold',
          },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Storefront Routes */}
          <Route path="/" element={<StoreLayout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="about" element={<About />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="payment" element={<Payment />} />
            <Route path="order-success" element={<OrderSuccess />} />
            <Route path="track-order" element={<TrackOrder />} />
            <Route path="order/:id" element={<OrderDetails />} />
            <Route path="order-help/:id" element={<OrderHelp />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="contact" element={<ContactUs />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
            <Route path="shipping-policy" element={<ShippingPolicy />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="tech-support" element={<TechSupport />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrders />} />
            <Route path="online-payments" element={<AdminOnlinePayments />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="pincodes" element={<AdminPincodes />} />
            <Route path="reviews" element={<ReviewsAdmin />} />
            <Route path="hero" element={<AdminHero />} />
            <Route path="bestsellers" element={<AdminBestSellers />} />
            <Route path="extracharges" element={<AdminExtraCharges />} />
            <Route path="notes" element={<AdminNotes />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="returns" element={<ReturnsList />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ServerStatusProvider>
          <SocketProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </SocketProvider>
        </ServerStatusProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
