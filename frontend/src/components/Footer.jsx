import { Link, useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const GithubIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.15-.38 6.5-1.4 6.5-7a4.6 4.6 0 0 0-1.2-3.21 4.3 4.3 0 0 0-.12-3.17s-1-.31-3.2 1.18a11 11 0 0 0-6 0c-2.2-1.49-3.2-1.18-3.2-1.18a4.3 4.3 0 0 0-.12 3.17 4.6 4.6 0 0 0-1.2 3.21c0 5.6 3.35 6.6 6.5 7a4.8 4.8 0 0 0-1 3.03V22"></path>
    <path d="M9 20c-5 1.5-5-2.5-7-3"></path>
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Footer = () => {
  const location = useLocation();
  // Show footer on mobile only for Home, About, and Contact pages
  const showOnMobile = ['/', '/about', '/contact'].includes(location.pathname);
  const mobileVisibilityClass = showOnMobile ? 'block mb-16 md:mb-0' : 'hidden md:block';

  return (
    <footer className={`bg-slate-900 text-slate-300 pt-16 pb-24 md:pb-8 ${mobileVisibilityClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-12 mb-8 md:mb-12">
          {/* Brand Info */}
          <div className="mb-6 md:mb-0 border-b border-slate-800 pb-8 md:border-0 md:pb-0">
            <Link to="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2 mb-4 md:mb-6">
              <img src="/logo.png" alt="W!FO MART" className="h-8 w-8 md:h-9 md:w-9 rounded-xl object-contain shadow-sm" />
              <div className="flex flex-col">
                <div className="flex leading-none">
                  <span className="text-white">W!FO</span>
                  <span className="text-[#FF8C00] ml-1.5">MART</span>
                </div>
                <span className="text-[9px] font-black text-[#A0705E] tracking-widest mt-0.5">A BASRIC Company</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Your one-stop shop for the best biscuits, Kurkure, delicious cakes, and crunchy snacks. Freshness delivered to your door.
            </p>
            <div className="flex space-x-4">
              <a href="" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <GithubIcon className="w-5 h-5" />
              </a>
              <a href="" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <TwitterIcon className="w-5 h-5" />
              </a>
              <a href="" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <InstagramIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="border-b border-slate-800 pb-4 md:border-0 md:pb-0">
            <h4 className="hidden md:block text-white font-semibold mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
            <details className="md:hidden group">
              <summary className="flex justify-between items-center font-semibold text-white uppercase tracking-wider text-sm cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                Quick Links
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <ul className="space-y-3 pt-4 text-slate-400">
                <li><Link to="/shop" className="hover:text-white transition-colors text-sm">Shop All</Link></li>
                <li><Link to="/categories/bestsellers" className="hover:text-white transition-colors text-sm">Best Sellers</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors text-sm">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors text-sm">Contact</Link></li>
              </ul>
            </details>
            <ul className="hidden md:block space-y-3">
              <li><Link to="/shop" className="hover:text-white transition-colors text-sm">Shop All</Link></li>
              <li><Link to="/categories/bestsellers" className="hover:text-white transition-colors text-sm">Best Sellers</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors text-sm">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="border-b border-slate-800 pb-4 md:border-0 md:pb-0">
            <h4 className="hidden md:block text-white font-semibold mb-6 uppercase tracking-wider text-sm">Customer Service</h4>
            <details className="md:hidden group">
              <summary className="flex justify-between items-center font-semibold text-white uppercase tracking-wider text-sm cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                Customer Service
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <ul className="space-y-3 pt-4 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors text-sm">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm">Shipping & Returns</a></li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); toast('Coming Soon!', { icon: '🚀' }); }} className="hover:text-white transition-colors text-sm">
                    Track Order
                  </a>
                </li>
                <li><a href="#" className="hover:text-white transition-colors text-sm">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm">Terms of Service</a></li>
              </ul>
            </details>
            <ul className="hidden md:block space-y-3">
              <li><a href="#" className="hover:text-white transition-colors text-sm">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-sm">Shipping & Returns</a></li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); toast('Coming Soon!', { icon: '🚀' }); }} className="hover:text-white transition-colors text-sm">
                  Track Order
                </a>
              </li>
              <li><a href="#" className="hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-sm">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="border-b border-slate-800 pb-4 md:border-0 md:pb-0">
            <h4 className="hidden md:block text-white font-semibold mb-6 uppercase tracking-wider text-sm">Contact Us</h4>
            <details className="md:hidden group">
              <summary className="flex justify-between items-center font-semibold text-white uppercase tracking-wider text-sm cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                Contact Us
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <ul className="space-y-4 pt-4 text-slate-400">
                <li className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-sm">Online.<br />Hooghly, West Bengal</span>
                </li>
                <li className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-slate-400 shrink-0" />
                  <a href="tel:+919876543210" className="text-sm hover:text-white transition-colors">+91 9876543210</a>
                </li>
                <li className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-slate-400 shrink-0" />
                  <a href="mailto:livemart.support@gmail.com" className="text-sm hover:text-white transition-colors">livemart.support@gmail.com</a>
                </li>
              </ul>
            </details>
            <ul className="hidden md:block space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-sm">Online.<br />Hooghly, West Bengal</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-slate-400 shrink-0" />
                <a href="tel:+919876543210" className="text-sm hover:text-white transition-colors">+91 9876543210</a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-slate-400 shrink-0" />
                <a href="mailto:livemart.support@gmail.com" className="text-sm hover:text-white transition-colors">livemart.support@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-slate-500 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} <span className="text-white font-bold">W!FO</span><span className="text-[#FF8C00] font-bold ml-1">MART</span>. A BASRIC Company. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a href="" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded flex items-center justify-center">
              <GithubIcon className="w-4 h-4" />
            </a>
            <a href="" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded flex items-center justify-center">
              <TwitterIcon className="w-4 h-4" />
            </a>
            <a href="" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded flex items-center justify-center">
              <InstagramIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
