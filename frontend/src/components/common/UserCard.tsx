// src/components/UserCard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MoreHorizontal, User, Stethoscope, Shield, Users } from 'lucide-react';

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
        
        // Get the authorization token from localStorage
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await axios.get<{ counts: Record<string, number> }>('/api/users/count-by-role', {
          headers
        });
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

  // Icon and color per role
  const getRoleIcon = () => {
    switch (type.toUpperCase()) {
      case 'DOKTER':
        return <Stethoscope className="w-7 h-7 text-blue-500 bg-blue-100 rounded-full p-1" />;
      case 'PERAWAT':
        return <User className="w-7 h-7 text-green-500 bg-green-100 rounded-full p-1" />;
      case 'STAF':
        return <Users className="w-7 h-7 text-orange-500 bg-orange-100 rounded-full p-1" />;
      case 'SUPERVISOR':
        return <Shield className="w-7 h-7 text-purple-500 bg-purple-100 rounded-full p-1" />;
      case 'TOTAL':
        return <Users className="w-7 h-7 text-gray-500 bg-gray-100 rounded-full p-1" />;
      default:
        return <User className="w-7 h-7 text-gray-400 bg-gray-100 rounded-full p-1" />;
    }
  };
  const getRoleColor = () => {
    switch (type.toUpperCase()) {
      case 'DOKTER': return 'border-blue-200';
      case 'PERAWAT': return 'border-green-200';
      case 'STAF': return 'border-orange-200';
      case 'SUPERVISOR': return 'border-purple-200';
      case 'TOTAL': return 'border-gray-200';
      default: return 'border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`rounded-xl bg-white border ${getRoleColor()} shadow-sm p-4 flex-1 min-w-[120px] h-[100px] flex flex-col items-center justify-center`}>
        <span className="text-gray-400 text-sm">Memuat...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className={`rounded-xl bg-white border ${getRoleColor()} shadow-sm p-4 flex-1 min-w-[120px] h-[100px] flex flex-col items-center justify-center`}>
        <span className="text-red-500 text-sm">{error}</span>
      </div>
    );
  }
  if (count === -1 || type.toUpperCase() === 'ADMIN') {
    return null;
  }
  return (
    <div className={`relative rounded-xl bg-white border ${getRoleColor()} shadow-sm p-4 flex-1 min-w-[120px] flex flex-col justify-between h-[100px]`}> 
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {getRoleIcon()}
          <h2 className="capitalize text-xs font-semibold text-gray-600 tracking-wide">{type}</h2>
        </div>
        <MoreHorizontal size={18} className="text-gray-300" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 text-center mb-0">
        {count !== null ? count.toLocaleString() : '0'}
      </h1>
    </div>
  );
};

export default UserCard;
