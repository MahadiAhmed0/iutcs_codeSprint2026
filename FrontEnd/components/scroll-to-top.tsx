'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronUp } from 'lucide-react';

export function ScrollToTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const progressCircleRef = useRef<SVGCircleElement>(null);
  const circumference = 2 * Math.PI * 26;

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show/hide scroll button and update progress ring directly via ref (no state = no lag)
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      
      // Update visibility via state (only when threshold crossed)
      const shouldShow = scrollTop > 400;
      setShowScrollTop(prev => prev !== shouldShow ? shouldShow : prev);
      
      // Update progress ring directly via ref (instant, no re-render)
      if (progressCircleRef.current) {
        progressCircleRef.current.style.strokeDashoffset = String(circumference * (1 - progress));
      }
    };

    // Initial call
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [circumference]);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-accent hover:text-white transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:scale-110 active:scale-95 group ${
        showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      {/* SVG Progress Ring */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 56 56"
      >
        {/* Background circle */}
        <circle
          cx="28"
          cy="28"
          r="26"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-accent/20"
        />
        {/* Progress circle */}
        <circle
          ref={progressCircleRef}
          cx="28"
          cy="28"
          r="26"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="text-accent"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference,
          }}
        />
      </svg>
      {/* Inner hover background */}
      <div className="absolute inset-2 rounded-full bg-transparent group-hover:bg-accent transition-colors duration-300" />
      {/* Icon */}
      <ChevronUp className="relative w-5 h-5 sm:w-6 sm:h-6 group-hover:text-white transition-colors duration-300" />
    </button>
  );
}
