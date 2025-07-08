"use client";

import { ReactNode, useEffect, useState, useRef } from 'react';

interface MobileCalendarWrapperProps {
  children: ReactNode;
  className?: string;
}

const MobileCalendarWrapper = ({ children, className = '' }: MobileCalendarWrapperProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsLoading(false);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (isMobile && containerRef.current) {
      // Add mobile-specific optimizations
      const container = containerRef.current;
      
      // Prevent zoom on double tap for calendar elements
      container.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      }, { passive: false });

      // Handle touch scrolling
      let lastTouchEnd = 0;
      container.addEventListener('touchend', (e) => {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      }, { passive: false });

      // Add smooth scrolling for calendar navigation
      container.style.scrollBehavior = 'smooth';
      (container.style as any).WebkitOverflowScrolling = 'touch';
    }
  }, [isMobile]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`
        mobile-calendar-wrapper
        ${isMobile ? 'mobile-optimized' : 'desktop-optimized'}
        ${className}
      `}
      style={{
        height: '100%',
        overflow: isMobile ? 'hidden' : 'visible',
        touchAction: isMobile ? 'pan-y pinch-zoom' : 'auto',
      }}
    >
      {children}
      
      {/* Mobile-specific loading overlay */}
      {isMobile && (
        <style jsx>{`
          .mobile-calendar-wrapper {
            position: relative;
          }
          
          .mobile-calendar-wrapper.loading::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
        `}</style>
      )}
    </div>
  );
};

export default MobileCalendarWrapper;
