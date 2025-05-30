// src/components/pages/PegawaiPageProtected.tsx

'use client';

import Announcements from "@/component/Announcement";
import EventCalendar from "@/component/EventCalendar";
import BigCalendar from "@/component/BigCalendar";
import withAuth from '@/lib/withAuth';

const PegawaiPage = () => {
  return (
    <div className='p-2 flex gap-4 flex-col xl:flex-row'>
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold ">Schedule</h1>
          <BigCalendar />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default withAuth(PegawaiPage, ['DOKTER', 'PERAWAT', 'STAF']);
