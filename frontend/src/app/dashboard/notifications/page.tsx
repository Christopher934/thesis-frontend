'use client';

import React, { useState, useEffect } from 'react';
import { NotificationList } from '@/components/notifications/NotificationList';

export default function NotificationsPage() {
  const [userId, setUserId] = useState<number>(0);
  const [role, setRole] = useState<'ADMIN' | 'SUPERVISOR' | 'PERAWAT' | 'DOKTER'>('PERAWAT');

  useEffect(() => {
    // Get user info from localStorage (atau dari context/state management)
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      const storedRole = localStorage.getItem('role');
      
      if (storedUserId) {
        setUserId(parseInt(storedUserId));
      }
      
      if (storedRole && ['ADMIN', 'SUPERVISOR', 'PERAWAT', 'DOKTER'].includes(storedRole)) {
        setRole(storedRole as 'ADMIN' | 'SUPERVISOR' | 'PERAWAT' | 'DOKTER');
      }
    }
  }, []);

  if (userId === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <NotificationList 
          userId={userId} 
          role={role} 
          className="min-h-screen"
        />
      </div>
    </div>
  );
}
