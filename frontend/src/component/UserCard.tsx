// src/components/UserCard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

interface UserCardProps {
  /** "DOKTER" | "PERAWAT" | "STAF" | "TOTAL" */
  type: string;
}

const UserCard: React.FC<UserCardProps> = ({ type }) => {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        setLoading(true);
        const res = await axios.get<{ counts: Record<string, number> }>('/api/users/count-by-role');
        const countsObj = res.data.counts;
        console.log('DEBUG countsObj:', countsObj); // Lihat bentuk object di console

        let valueToShow = 0;

        if (type.toUpperCase() === 'TOTAL') {
          // JUMLAHKAN SEMUA VALUE
          valueToShow = Object.values(countsObj).reduce((sum, v) => sum + v, 0);
        } else {
          // Kita cek dulu: key backend mungkin lowercase, uppercase, titlecase, dll.
          // Misal jika backend meng‐embalikan: { dokter: 3, perawat: 4, STAF: 1 }, gunakan:
          const keyLower = type.toLowerCase(); // e.g. 'dokter'
          // Jika backend mengembalikan: { DOKTER: 3, … }, gunakan:
          const keyUpper = type.toUpperCase(); // e.g. 'DOKTER'
          // Jika backend mengembalikan: { Dokter: 3, … }, gunakan:
          const keyTitle = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(); // 'Dokter'

          // Periksa urutannya: coba keyLower dulu, kalau tidak ada, coba keyUpper, baru keyTitle
          if (countsObj[keyLower] !== undefined) {
            valueToShow = countsObj[keyLower];
          } else if (countsObj[keyUpper] !== undefined) {
            valueToShow = countsObj[keyUpper];
          } else if (countsObj[keyTitle] !== undefined) {
            valueToShow = countsObj[keyTitle];
          } else {
            valueToShow = 0; // cadangan: jika tidak ada sama sekali
          }
        }

        setCount(valueToShow);
      } catch (err) {
        console.error('Error fetching count-by-role:', err);
        setError('Gagal ambil data');
      } finally {
        setLoading(false);
      }
    }
    fetchCount();
  }, [type]);

  if (loading) {
    return (
      <div className="rounded-2xl odd:bg-lamaPurple even:bg-[#e200de22] p-4 flex-1 min-w-[130px] h-[120px] flex items-center justify-center">
        <span className="text-gray-400">Memuat...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-2xl odd:bg-lamaPurple even:bg-[#e200de22] p-4 flex-1 min-w-[130px] h-[120px] flex items-center justify-center">
        <span className="text-red-500">{error}</span>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl odd:bg-lamaPurple even:bg-[#e200de88] p-4 flex-1 min-w-[130px]">
      <div className="flex justify-between items-center">
        <h2 className="capitalize text-sm font-medium text-gray-500">{type}</h2>
        <Image src="/more.png" alt="more" width={20} height={20} />
      </div>
      <h1 className="text-2xl font-semibold my-4">
        {count !== null ? count.toLocaleString() : '0'}
      </h1>
      
    </div>
  );
};

export default UserCard;
