import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import TrackOrder from './pages/TrackOrder';
import About from './pages/About';
import OrderDetails from './pages/OrderDetails';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import UserProfile from './pages/UserProfile';
import ContactUs from './pages/ContactUs';
import OrderHelp from './pages/OrderHelp';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Admin imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminSettings from './pages/admin/AdminSettings';
import ProductForm from './pages/admin/ProductForm';
import AdminPincodes from './pages/admin/AdminPincodes';
import ReviewsAdmin from './pages/admin/ReviewsAdmin';
import AdminHero from './pages/admin/AdminHero';
import AdminBestSellers from './pages/admin/AdminBestSellers';
import AdminExtraCharges from './pages/admin/AdminExtraCharges';
import AdminOnlinePayments from './pages/admin/AdminOnlinePayments';
import AdminNotes from './pages/admin/AdminNotes';
import AdminUsers from './pages/admin/AdminUsers';
import AdminLogin from './pages/admin/AdminLogin';
import AdminSupport from './pages/admin/AdminSupport';

// Layout for the main storefront
const StoreLayout = () => (
  <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
    <Navbar />
    <main className="flex-grow pt-16 pb-20 md:pb-0">
      <Outlet />
    </main>
    <Footer />
    <MobileNav />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
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
              <Route path="online-payments" element={<AdminOnlinePayments />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="pincodes" element={<AdminPincodes />} />
              <Route path="reviews" element={<ReviewsAdmin />} />
              <Route path="hero" element={<AdminHero />} />
              <Route path="bestsellers" element={<AdminBestSellers />} />
              <Route path="extracharges" element={<AdminExtraCharges />} />
              <Route path="notes" element={<AdminNotes />} />
              <Route path="support" element={<AdminSupport />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
