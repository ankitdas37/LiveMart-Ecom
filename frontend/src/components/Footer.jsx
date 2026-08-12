import { Link, useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  // Show footer on mobile only for Home and Shop pages
  const isHomeOrShop = location.pathname === '/' || location.pathname === '/shop';
  const mobileVisibilityClass = isHomeOrShop ? 'block' : 'hidden md:block';

  return (
    <footer className={`bg-slate-900 text-slate-300 pt-16 pb-24 md:pb-8 ${mobileVisibilityClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div>
            <Link to="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2 mb-6">
              <img src="/logo.png" alt="LiveMart" className="h-9 w-9 rounded-xl object-contain shadow-sm" />
              <div className="flex">
                <span className="text-white">Live</span>
                <span className="text-[#FF8C00]">Mart</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Your one-stop shop for the best biscuits, Kurkure, delicious cakes, and crunchy snacks. Freshness delivered to your door.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors font-bold text-sm">FB</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors font-bold text-sm">TW</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors font-bold text-sm">IG</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/shop" className="hover:text-white transition-colors text-sm">Shop All</Link></li>
              <li><Link to="/categories/new" className="hover:text-white transition-colors text-sm">New Arrivals</Link></li>
              <li><Link to="/categories/bestsellers" className="hover:text-white transition-colors text-sm">Best Sellers</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors text-sm">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Customer Service</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors text-sm">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-sm">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-sm">Track Order</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-sm">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-sm">123 Commerce St.<br />New York, NY 10001</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-slate-400 shrink-0" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-slate-400 shrink-0" />
                <span className="text-sm">support@aurastore.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-slate-500 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} <span className="text-white">Live</span><span className="text-[#FF8C00]">Mart</span>. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <div className="h-6 w-10 bg-slate-800 rounded"></div>
            <div className="h-6 w-10 bg-slate-800 rounded"></div>
            <div className="h-6 w-10 bg-slate-800 rounded"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
