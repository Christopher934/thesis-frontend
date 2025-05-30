'use client';

import dynamic from 'next/dynamic';
import withAuth from '@/lib/withAuth';

// Hanya di-load di client (browser), nggak di-SSR
const UserCard = dynamic(() => import('@/component/UserCard'), { ssr: false });
const CountChart = dynamic(() => import('@/component/CountChart'), { ssr: false });
const AttendanceChart = dynamic(() => import('@/component/AttandenceChart'), { ssr: false });
const EventCalendar = dynamic(() => import('@/component/EventCalendar'), { ssr: false });
const Announcements = dynamic(() => import('@/component/Announcement'), { ssr: false });

const AdminPage: React.FC = () => (
  <div className="p-4 flex flex-col md:flex-row gap-6">
    {/* LEFT */}
    <div className="w-full lg:w-2/3 space-y-6">
      {/* User Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <UserCard type="Dokter" />
        <UserCard type="Perawat" />
        <UserCard type="Staff" />
        <UserCard type="Total" />
      </div>

      {/* Charts Baris Tengah */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[450px]">
        <div className="bg-white p-4 rounded-lg shadow">
          <CountChart />
        </div>
        <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
          <AttendanceChart />
        </div>
      </div>

      {/* Bawah (boleh ditambahkan widget lain) */}
      <div className="bg-white p-4 rounded-lg shadow h-[500px]">
        {/* placeholder untuk chart/bottom content */}
      </div>
    </div>

    {/* RIGHT */}
    <aside className="w-full lg:w-1/3 space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Event Calendar</h3>
        <EventCalendar />
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Announcements</h3>
        <Announcements />
      </div>
    </aside>
  </div>
);

// Proteksi halaman hanya untuk role ADMIN
export default withAuth(AdminPage, ['ADMIN']);
