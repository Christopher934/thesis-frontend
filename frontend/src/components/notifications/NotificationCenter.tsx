/**
 * NotificationCenter - Komponen utama yang menggabungkan bell dan dropdown
 * Siap digunakan di layout atau header aplikasi
 */
'use client';

import React, { useState } from 'react';
import { NotificationBell } from './NotificationBell';
import { NotificationDropdown } from './NotificationDropdown';

interface NotificationCenterProps {
  className?: string;
  bellSize?: number;
}

export function NotificationCenter({ 
  className = '', 
  bellSize = 24 
}: NotificationCenterProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleBellClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCloseDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <NotificationBell 
        onClick={handleBellClick}
        size={bellSize}
        className="transition-transform hover:scale-110"
      />
      
      <NotificationDropdown 
        isOpen={isDropdownOpen}
        onClose={handleCloseDropdown}
      />
    </div>
  );
}
