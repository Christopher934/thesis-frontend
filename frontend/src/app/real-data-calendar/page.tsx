'use client';

import { useState, useEffect } from 'react';
import BigCalendar from '@/components/common/BigCalendar';

interface ShiftData {
  id: number;
  idpegawai: string;
  tipeshift?: string;
  tanggal: string;
  originalDate?: string;
  lokasishift: string;
  jammulai: string;
  jamselesai: string;
  nama?: string;
}

export default function RealDataCalendarPage() {
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRealShifts = async () => {
      try {
        // Try to get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please login first.');
          setLoading(false);
          return;
        }

        // Fetch real data from API
        const response = await fetch('http://localhost:3001/shifts', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Real shifts data from API:', data);

        // Process the data like JadwalSaya page does
        const formattedShifts = data.map((shift: any) => {
          const originalDate = shift.tanggal;
          let date;
          
          if (originalDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = originalDate.split('-').map(Number);
            date = new Date(year, month - 1, day);
          } else {
            date = new Date(originalDate);
          }
          
          const formattedDate = date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });

          return {
            ...shift,
            tanggal: formattedDate,
            originalDate: originalDate,
          };
        });

        setShifts(formattedShifts);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching real shifts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRealShifts();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">📡 Fetching Real Data...</h1>
        <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">❌ Error Loading Real Data</h1>
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
          <p className="text-red-800">{error}</p>
          <p className="text-sm text-red-600 mt-2">
            Please visit <a href="/sign-in" className="underline">login page</a> first to authenticate.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">📅 Real Data Calendar</h1>
      
      <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
        <h2 className="font-bold text-green-800 mb-2">✅ Real Data Loaded</h2>
        <p><strong>Shifts from API:</strong> {shifts.length}</p>
        <p><strong>Source:</strong> Backend API (real database)</p>
      </div>

      <div className="h-[600px] border border-gray-300 rounded-lg">
        <BigCalendar 
          shifts={shifts} 
          useDefaultEvents={false}
        />
      </div>
      
      {shifts.length > 0 && (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Sample Real Shift Data:</h3>
          <pre className="text-xs overflow-auto bg-white p-2 rounded border max-h-40">
            {JSON.stringify(shifts[0], null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
