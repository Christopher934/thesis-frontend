'use client';

import { useEffect, useState } from 'react';
import { Search, MessageSquare, User, Menu as MenuIcon } from 'lucide-react';
import { NotificationCenter } from '@/components/notifications';

interface NavbarProps {
  onMenuToggle?: () => void;
}

const Navbar = ({ onMenuToggle }: NavbarProps) => {
  const [user, setUser] = useState<{
    nameDepan: string;
    nameBelakang: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    const nameDepan = localStorage.getItem('nameDepan') || '';
    const nameBelakang = localStorage.getItem('nameBelakang') || '';
    const role = localStorage.getItem('role') || '';
    setUser({ nameDepan, nameBelakang, role });
  }, []);

  return (
    <div className='flex items-center justify-between p-4'>
      {/* Mobile Hamburger Menu - Left side */}
      <div className="lg:hidden">
        <button
          onClick={onMenuToggle}
          className="p-2 bg-blue-600 rounded-xl shadow-lg border-2 border-blue-700 hover:bg-blue-700 transition-all duration-200 active:scale-95"
          aria-label="Toggle menu"
        >
          <MenuIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Desktop spacer or mobile empty space */}
      <div className="hidden lg:block flex-1"></div>

      {/* Icon and User - Right side */}
      <div className='flex items-center gap-6'>
        {/* <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer'>
          <MessageSquare size={20} className="text-gray-600" />
        </div> */}
        
        {/* Notification Center */}
        {/* <NotificationCenter bellSize={20} /> */}

        <div className="flex flex-col text-right">
          <span className='text-xs leading-3 font-medium'>
            {user
              ? `${user.nameDepan}${user.nameBelakang ? ' ' + user.nameBelakang : ''}`
              : '-'}
          </span>
          <span className='text-[10px] text-gray-500 capitalize'>
            {user?.role || '-'}
          </span>        </div>
        <User size={36} className="text-gray-600 rounded-full bg-gray-100 p-2" />
      </div>
    </div>
  );
};

export default Navbar;
