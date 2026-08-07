'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { portfolioRoutes } from '@/data/portfolioData';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const pathUrl = usePathname();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Portfolio pages (homepage, résumé) are self-contained and use their own
  // design system; the generic scroll-to-top button doesn't match and would
  // sit outside #pf-root's print stylesheet scope.
  if (portfolioRoutes.includes(pathUrl)) return null;

  return (
    <button
      onClick={scrollToTop}
      className='bg-purple fixed right-8 bottom-8 size-10 place-items-center rounded-sm text-white shadow-md transition-opacity duration-300 hover:opacity-70'
      style={{
        display: isVisible ? 'grid' : 'none',
      }}
    >
      <span className='sr-only'>Scroll to top</span>

      <svg
        className='size-5 fill-white'
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 512 512'
      >
        <path d='M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z' />
      </svg>
    </button>
  );
}
