'use client';

import { useEffect } from 'react';

export default function AuthDebug() {
  useEffect(() => {
    // This will only run in the browser
    // All console.log statements removed for performance
  }, []);

  // This component doesn't render anything visible
  return null;
}
