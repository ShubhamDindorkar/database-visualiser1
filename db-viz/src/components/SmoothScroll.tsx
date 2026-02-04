'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8, // Slightly slower for better control
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Handle anchor links with smooth scroll
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement;
      
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href !== '#') {
          e.preventDefault();
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            lenis.scrollTo(targetElement, {
              offset: -80, // Account for fixed navbar
              duration: 1.5,
            });
          }
        } else if (href === '#') {
          // Scroll to top
          e.preventDefault();
          lenis.scrollTo(0, { duration: 1.5 });
        }
      }
    };

    // Handle hash on page load (with delay to ensure DOM is ready)
    const handleHashOnLoad = () => {
      if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const targetElement = document.getElementById(hash);
        if (targetElement) {
          setTimeout(() => {
            lenis.scrollTo(targetElement, {
              offset: -80,
              duration: 1.5,
            });
          }, 300);
        }
      }
    };

    // Wait for DOM to be ready
    if (document.readyState === 'complete') {
      handleHashOnLoad();
    } else {
      window.addEventListener('load', handleHashOnLoad);
    }

    document.addEventListener('click', handleAnchorClick);

    // Scroll to top on route change
    lenis.scrollTo(0, { immediate: true });

    return () => {
      lenis.destroy();
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('load', handleHashOnLoad);
    };
  }, [pathname]);

  return <>{children}</>;
}
