'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const Navbar = () => {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const name = localStorage.getItem('name') || 'Pengguna';
    const role = localStorage.getItem('role') || '';
    setUser({ name, role });
  }, []);

  return (
    <div className='flex items-center justify-between p-4'>
      {/* Search Bar */}
      <div className="hidden md:flex items-center gap-2 text-xs ring-[1.5px] ring-gray-300  rounded-full px-2">
        <Image src="/search.png" alt='' width={14} height={14} />
        <input
          type="text"
          placeholder='Search...'
          className='w-[200px] p-2 bg-transparent outline-none'
        />
      </div>

      {/* Icon and User */}
      <div className='flex items-center gap-6 justify-end w-full'>
        <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer'>
          <Image src="/message.png" alt='' width={20} height={20} />
        </div>
        <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer'>
          <Image src="/announcement.png" alt='' width={20} height={20} />
        </div>

        <div className="flex flex-col text-right">
          <span className='text-xs leading-3 font-medium'>
            {user?.name || '-'}
          </span>
          <span className='text-[10px] text-gray-500 capitalize'>
            {user?.role || '-'}
          </span>
        </div>

        <Image src='/avatar.png' alt='' width={36} height={36} className='rounded-full' />
      </div>
    </div>
  );
};

export default Navbar;
