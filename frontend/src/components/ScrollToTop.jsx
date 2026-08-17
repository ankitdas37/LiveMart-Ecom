import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // Only scroll to top if the user clicks a new link (PUSH) or replaces the URL (REPLACE)
    // If they hit the Back button (POP), we do NOT scroll to top, so the browser maintains their scroll position.
    if (navType !== 'POP') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
    }
  }, [pathname, navType]);

  return null;
};

export default ScrollToTop;
