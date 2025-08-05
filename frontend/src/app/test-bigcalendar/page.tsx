"use client";

import BigCalendar from '@/components/common/BigCalendar';

const TestBigCalendarPage = () => {
  console.log('🧪 TestBigCalendarPage: Rendering test page for BigCalendar');
  
  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            🧪 BigCalendar Test Page
          </h1>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Halaman ini untuk testing BigCalendar component dengan test data.
              Buka browser console untuk melihat logs detail.
            </p>
          </div>
          
          <div className="h-[600px] border border-gray-200 rounded-lg">
            <BigCalendar useDefaultEvents={false} />
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Test Data Info:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 3 test shifts akan muncul di kalender</li>
              <li>• Tanggal: 14, 15, 16 Juli 2025</li>
              <li>• Lokasi: Rawat Inap, UGD, ICU</li>
              <li>• Shift: Pagi (07:00-15:00), Siang (14:00-22:00), Malam (22:00-07:00)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestBigCalendarPage;
