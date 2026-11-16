import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures that on any route navigation, the new page always displays
 * from the very top section (scroll position 0, 0) instead of retaining
 * previous scroll offsets or momentarily flashing the bottom / footer.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable browser automatic scroll restoration to avoid starting at footer
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Temporarily disable smooth scrolling so the new page renders instantly at top
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // Re-enable original scroll behavior smoothly for in-page actions
    const rafId = requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = originalScrollBehavior || '';
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
