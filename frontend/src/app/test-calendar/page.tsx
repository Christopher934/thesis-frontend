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

// Test data untuk BigCalendar
const testShifts: ShiftData[] = [
  {
    id: 1,
    idpegawai: 'TEST001',
    tipeshift: 'PAGI',
    tanggal: '2025-07-14',
    lokasishift: 'RAWAT_INAP',
    jammulai: '07:00',
    jamselesai: '15:00',
    nama: 'Test User'
  },
  {
    id: 2,
    idpegawai: 'TEST001',
    tipeshift: 'SIANG',
    tanggal: '2025-07-15',
    lokasishift: 'UGD',
    jammulai: '14:00',
    jamselesai: '22:00',
    nama: 'Test User'
  },
  {
    id: 3,
    idpegawai: 'TEST001',
    tipeshift: 'MALAM',
    tanggal: '2025-07-16',
    lokasishift: 'ICU',
    jammulai: '22:00',
    jamselesai: '07:00',
    nama: 'Test User'
  },
  {
    id: 4,
    idpegawai: 'TEST002',
    tipeshift: 'PAGI',
    tanggal: '2025-07-17',
    lokasishift: 'LABORATORIUM',
    jammulai: '08:00',
    jamselesai: '16:00',
    nama: 'Test User 2'
  }
];

export default function TestCalendarPage() {
  const [mode, setMode] = useState<'empty' | 'real'>('real');
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mode === 'empty') {
      setShifts([]);
    } else {
      // For real mode, use empty array - BigCalendar should not add fallback data
      setShifts([]);
    }
    setLoading(false);
  }, [mode]);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Calendar - Loading...</h1>
        <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🧪 BigCalendar Test Page
          </h1>
          <p className="text-gray-600">
            Testing BigCalendar component with different data modes
          </p>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setMode('empty')}
            className={`px-4 py-2 rounded-lg font-medium ${
              mode === 'empty' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Empty Mode
          </button>
          <button
            onClick={() => setMode('real')}
            className={`px-4 py-2 rounded-lg font-medium ${
              mode === 'real' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Real Data Mode
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Calendar Display</h2>
              <div className={`px-3 py-1 rounded-full text-sm ${
                mode === 'empty' ? 'bg-gray-100 text-gray-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {mode === 'empty' ? 'No Data' : 'Real Data Only'}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border" style={{ height: '600px' }}>
              <BigCalendar 
                shifts={shifts} 
                useDefaultEvents={false}
              />
            </div>
          </div>
        </div>

        {/* No test data section anymore - we only show real data */}

        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                <div>Mode: {mode}</div>
                <div>Shifts Count: {shifts.length}</div>
                <div>Current Date: {new Date().toISOString()}</div>
                <div>Expected Events: None (testing empty calendar - check console for logs)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
