import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Global map to store scroll positions across route changes without polluting sessionStorage
const scrollPositions = new Map();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  const prevPathname = useRef(pathname);

  // 1. Track and save scroll position before leaving the current page
  useEffect(() => {
    let timeoutId = null;
    const handleScroll = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        scrollPositions.set(pathname, window.scrollY);
        timeoutId = null;
      }, 100); // throttle to 100ms
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
      // Save exact position immediately on unmount/route change
      scrollPositions.set(pathname, window.scrollY);
    };
  }, [pathname]);

  // 2. Restore scroll position or scroll to top when entering a new page
  useEffect(() => {
    // If the user taps the SAME tab/link they are already on, force scroll to top (like Instagram/Flipkart)
    if (navType !== 'POP' && pathname === prevPathname.current) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      scrollPositions.set(pathname, 0);
    } else {
      // Try to restore previous scroll position for this path (works for POP and switching Bottom Tabs)
      const savedPosition = scrollPositions.get(pathname);
      
      if (savedPosition !== undefined && savedPosition > 0) {
        // Because data loads asynchronously (like fetching products), the page height
        // might initially be smaller than the saved scroll position.
        // We poll for up to 500ms to ensure the page has grown enough to restore scroll.
        let attempts = 0;
        const intervalId = setInterval(() => {
          attempts++;
          const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          
          if (maxScroll >= savedPosition || attempts > 10) {
            window.scrollTo({ top: Math.min(savedPosition, maxScroll), left: 0, behavior: 'auto' });
            
            // Clear interval if we successfully restored or ran out of attempts
            if (maxScroll >= savedPosition || attempts > 10) {
               clearInterval(intervalId);
            }
          }
        }, 50); // Check every 50ms, up to 10 times (500ms total)
      } else {
        // No saved position or saved position is 0, it's a fresh visit to this page
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    }
    prevPathname.current = pathname;
  }, [pathname, navType]);

  return null;
};

export default ScrollToTop;
