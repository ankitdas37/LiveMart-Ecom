import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, MessageSquare, User, Info } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const MobileNav = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Shop', path: '/shop', icon: Grid },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: MessageSquare },
    { name: 'Profile', path: user ? '/profile' : '/login', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          const actualPath = item.path;

          return (
            <Link
              key={item.name}
              to={actualPath}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative transition-colors ${
                active 
                  ? 'text-amber-600 dark:text-amber-500' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${active ? 'fill-amber-600/20' : ''}`} strokeWidth={active ? 2.5 : 2} />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'font-bold' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
