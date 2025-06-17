'use client';

import { useEffect } from 'react';

export default function AuthDebug() {
  useEffect(() => {
    // This will only run in the browser
    console.log('====== Auth Debug Info ======');
    console.log('localStorage token:', localStorage.getItem('token') ? '✓ Present' : '❌ Missing');
    console.log('localStorage role:', localStorage.getItem('role'));
    console.log('Cookies:', document.cookie);
    console.log('===========================');
  }, []);

  // This component doesn't render anything visible
  return null;
}
