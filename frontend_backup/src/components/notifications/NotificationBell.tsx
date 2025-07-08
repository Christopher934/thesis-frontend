/**
 * NotificationBell - Komponen bell icon dengan badge counter
 * Menampilkan jumlah notifikasi yang belum dibaca
 */
'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from './NotificationContext';

interface NotificationBellProps {
  className?: string;
  onClick?: () => void;
  size?: number;
}

export function NotificationBell({ 
  className = '', 
  onClick, 
  size = 24 
}: NotificationBellProps) {
  const { unreadCount, isConnected } = useNotifications();

  return (
    <div className={`relative cursor-pointer ${className}`} onClick={onClick}>
      <Bell 
        size={size} 
        className={`${
          isConnected ? 'text-gray-700 hover:text-gray-900' : 'text-gray-400'
        } transition-colors duration-200`}
      />
      
      {/* Unread count badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      
      {/* Connection status indicator */}
      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
        isConnected ? 'bg-green-500' : 'bg-gray-400'
      }`} />
    </div>
  );
}
