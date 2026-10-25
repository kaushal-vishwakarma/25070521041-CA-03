import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router keeps the old scroll position when the page changes; this resets it.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
