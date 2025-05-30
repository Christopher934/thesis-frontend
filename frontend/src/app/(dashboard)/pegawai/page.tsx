// File: src/app/(dashboard)/dashboard/pegawai/page.tsx
'use client';

import dynamic from 'next/dynamic';
import withAuth from '@/lib/withAuth';

// Load komponen yang butuh browser-only (mis. FullCalendar) tanpa SSR
const BigCalendar = dynamic(
  () => import('@/component/BigCalendar'),
  { ssr: false }
);

const EventCalendar = dynamic(
  () => import('@/component/EventCalendar'),
  { ssr: false }
);

const Announcements = dynamic(
  () => import('@/component/Announcement'),
  { ssr: false }
);

function PegawaiPage() {
  return (
    <div className="p-4 flex flex-col xl:flex-row gap-6">
      {/* LEFT: Kalender penuh */}
      <div className="w-full xl:w-2/3 bg-white rounded-lg shadow p-4">
        <h2 className="text-2xl font-semibold mb-4">Jadwal Saya</h2>
        <BigCalendar />
      </div>

      {/* RIGHT: Event & Pengumuman */}
      <aside className="w-full xl:w-1/3 flex flex-col gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-xl font-medium mb-2">Event Mendatang</h3>
          <EventCalendar />
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-xl font-medium mb-2">Pengumuman</h3>
          <Announcements />
        </div>
      </aside>
    </div>
  );
}

// Hanya user dengan role DOKTER, PERAWAT, atau STAF yang bisa akses
export default withAuth(PegawaiPage, ['DOKTER', 'PERAWAT', 'STAF']);
