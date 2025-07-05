'use client';

import { useEffect } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiResponseTime: number;
}

export default function PerformanceMonitor() {
  useEffect(() => {
    // Monitor page load performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log('📊 Performance Metrics:', {
            loadTime: navEntry.loadEventEnd - navEntry.fetchStart,
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
            firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
          });
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });

    return () => observer.disconnect();
  }, []);

  return null; // This component doesn't render anything
}
