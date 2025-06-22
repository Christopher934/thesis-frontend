'use client';

import { useEffect, useState } from 'react';
import { Search, MessageSquare, Bell, User } from 'lucide-react';

const Navbar = () => {
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
      {/* Search Bar */}
      <div className="hidden md:flex items-center gap-2 text-xs ring-[1.5px] ring-gray-300  rounded-full px-2">
        <Search size={14} className="text-gray-400" />
        <input
          type="text"
          placeholder='Search...'
          className='w-[200px] p-2 bg-transparent outline-none'
        />
      </div>

      {/* Icon and User */}
      <div className='flex items-center gap-6 justify-end w-full'>
        <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer'>
          <MessageSquare size={20} className="text-gray-600" />
        </div>
        <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer'>
          <Bell size={20} className="text-gray-600" />
        </div>

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
