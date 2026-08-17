import { useState, useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, Settings, LogOut, Menu, X, MapPin, Star, Image as ImageIcon, Award, ShoppingBag, Ticket, Zap, CreditCard, FileText, Users, Headset, Moon, Sun, Bell, RefreshCw } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import AdminMobileNav from '../../components/admin/AdminMobileNav';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser: user, adminLogout: logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  // 🔒 Guard: redirect to admin login if not logged in as admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Returns', path: '/admin/returns', icon: RefreshCw },
    { name: 'Online Payments', path: '/admin/online-payments', icon: CreditCard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { name: 'Extra Charges', path: '/admin/extracharges', icon: Zap },
    { name: 'Delivery Areas', path: '/admin/pincodes', icon: MapPin },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Hero Banner', path: '/admin/hero', icon: ImageIcon },
    { name: 'Best Sellers', path: '/admin/bestsellers', icon: Zap },
    { name: 'Support', path: '/admin/support', icon: Headset },
    { name: 'Notes', path: '/admin/notes', icon: FileText },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-900 flex transition-colors duration-300 pb-16 md:pb-0">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-[70] md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-[80] w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:relative
      `}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="W!FO MART" className="h-10 w-10 rounded-xl object-contain shadow-sm bg-white dark:bg-slate-900 p-0.5" />
            <div className="flex flex-col">
              <div className="text-2xl font-black tracking-tighter flex leading-none">
                <span className="text-white">W!FO</span>
                <span className="text-[#FF8C00] ml-1.5">MART</span>
              </div>
              <div className="flex flex-col mt-1">
                <span className="text-[8px] font-black text-[#A0705E] tracking-[0.1em] leading-none">A BASRIC Company</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Admin Panel</span>
              </div>
            </div>
          </Link>
          <button className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path) && !(item.path === '/admin' && location.pathname !== '/admin');

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl transition-colors ${active
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-red-400 border border-red-900/30 bg-red-900/10 hover:bg-red-900/40 hover:text-red-300 transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-bold">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 dark:border-slate-800 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 transition-colors duration-300 shadow-sm relative z-10">
          <div className="flex items-center">
            {/* Desktop logo placeholder or title if needed */}
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200 dark:text-white hidden md:block">
              {navItems.find(item => isActive(item.path) && !(item.path === '/admin' && location.pathname !== '/admin'))?.name || 'Dashboard'}
            </h1>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200 dark:text-white md:hidden">
              W!FO MART
            </h1>
          </div>

          <div className="flex items-center space-x-4 ml-auto">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm overflow-hidden border-2 border-amber-300 shadow-sm">
                {user?.profile_pic ? (
                  <img src={user.profile_pic} alt="Admin" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || 'A'
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 dark:text-slate-200 leading-none mb-1">{user?.name?.split(' ')[0] || 'Admin'}</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider leading-none">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-900 text-slate-900 dark:text-white dark:text-slate-100 transition-colors duration-300">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation */}
      <AdminMobileNav onMenuClick={() => setIsSidebarOpen(true)} />
    </div>
  );
};

export default AdminLayout;
