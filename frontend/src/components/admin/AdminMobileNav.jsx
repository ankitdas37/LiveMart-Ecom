import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Menu } from 'lucide-react';

const AdminMobileNav = ({ onMenuClick }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Products', path: '/admin/products', icon: Package },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-colors duration-300">
      <div className="flex justify-around items-center h-16 px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-full h-full group"
            >
              {/* Active Indicator Glow */}
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-amber-500 rounded-b-full shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all" />
              )}
              
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 scale-110 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-800'
              }`}>
                <item.icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className={`text-[10px] mt-1 font-semibold transition-colors ${
                isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {item.name}
              </span>
            </NavLink>
          );
        })}

        {/* Menu Button (triggers sidebar) */}
        <button
          onClick={onMenuClick}
          className="relative flex flex-col items-center justify-center w-full h-full group focus:outline-none"
        >
          <div className="p-2 rounded-xl transition-all duration-300 text-slate-500 dark:text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-800">
            <Menu className="w-5 h-5 stroke-2" />
          </div>
          <span className="text-[10px] mt-1 font-semibold text-slate-500 dark:text-slate-400">
            Menu
          </span>
        </button>
      </div>
    </div>
  );
};

export default AdminMobileNav;
