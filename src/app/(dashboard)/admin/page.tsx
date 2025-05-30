'use client';

import dynamic from 'next/dynamic';
import UserCard from '@/component/UserCard';
import EventCalendar from '@/component/EventCalendar';
import Announcements from '@/component/Announcement';
import { withAuth } from '@/lib/withAuth';

// Recharts butuh SSR=false
const CountChart = dynamic(() => import('@/component/CountChart'), { ssr: false });
const AttendanceChart = dynamic(() => import('@/component/AttandenceChart'), { ssr: false });

const AdminPage = () => (
  <div className="p-4 flex gap-4 flex-col md:flex-row">
    {/* Left */}
    <div className="w-full lg:w-2/3 flex flex-col gap-8">
      <div className="flex gap-4 flex-wrap">
        <UserCard type="Dokter" />
        <UserCard type="Perawat" />
        <UserCard type="Staff" />
        <UserCard type="Total" />
      </div>
      <div className="flex gap-4 flex-col lg:flex-row">
        <div className="w-full lg:w-1/3 h-[450px]"><CountChart /></div>
        <div className="w-full lg:w-2/3 h-[450px]"><AttendanceChart /></div>
      </div>
      <div className="w-full h-[500px]">
        {/* Tambahan chart/bottom content */}
      </div>
    </div>
    {/* Right */}
    <div className="w-full lg:w-1/3 flex flex-col gap-8">
      <EventCalendar />
      <Announcements />
    </div>
  </div>
);

export default withAuth(AdminPage, ['admin']);
