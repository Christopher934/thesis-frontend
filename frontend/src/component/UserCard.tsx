// src/components/UserCard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MoreHorizontal } from 'lucide-react';

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

        let valueToShow = 0;

        if (type.toUpperCase() === 'TOTAL') {
          // JUMLAHKAN SEMUA VALUE KECUALI ADMIN
          valueToShow = Object.entries(countsObj).reduce((sum, [key, value]) => {
            // Skip ADMIN role in total count
            if (key.toUpperCase() !== 'ADMIN') {
              return sum + value;
            }
            return sum;
          }, 0);
        } else {
          // Kita cek dulu: key backend mungkin lowercase, uppercase, titlecase, dll.
          // Misal jika backend meng‐embalikan: { dokter: 3, perawat: 4, STAF: 1 }, gunakan:
          const keyLower = type.toLowerCase(); // e.g. 'dokter'
          // Jika backend mengembalikan: { DOKTER: 3, … }, gunakan:
          const keyUpper = type.toUpperCase(); // e.g. 'DOKTER'
          // Jika backend mengembalikan: { Dokter: 3, … }, gunakan:
          const keyTitle = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(); // 'Dokter'

          // Special case for SUPERVISOR since it might not be in the counts object
          if (type.toUpperCase() === 'SUPERVISOR') {
            // Check if server includes SUPERVISOR in the response
            valueToShow = countsObj['SUPERVISOR'] || 0;
            // The API route should handle adding SUPERVISOR if missing
          }
          // Hide Admin role from display
          else if (type.toUpperCase() === 'ADMIN') {
            // Return -1 to indicate this card should not be displayed
            valueToShow = -1;
          } 
          // For other roles, check various case formats
          else if (countsObj[keyLower] !== undefined) {
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
  
  // Don't render anything for Admin role
  if (count === -1 || type.toUpperCase() === 'ADMIN') {
    return null;
  }

  return (
    <div className="relative rounded-2xl odd:bg-lamaPurple even:bg-[#e200de88] p-4 flex-1 min-w-[130px]">
      <div className="flex justify-between items-center">
        <h2 className="capitalize text-sm font-medium text-gray-500">{type}</h2>
        <MoreHorizontal size={20} className="text-gray-500" />
      </div>
      <h1 className="text-2xl font-semibold my-4">
        {count !== null ? count.toLocaleString() : '0'}
      </h1>
      
    </div>
  );
};

export default UserCard;
