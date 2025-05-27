import CountChart from "../../../component/CountChart";
import UserCard from "../../../component/UserCard";
import AttendanceChart from "../../../component/AttandenceChart";
import EventCalendar from "../../../component/EventCalendar";
import Announcements from "../../../component/Announcement";

const AdminPage = () => {
  return (
    <div className=' p-4 flex gap-4 flex-col md:flex-row'>
      {/* Left */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="Dokter" />
          <UserCard type="Perawat" />
          <UserCard type="Staff" />
          <UserCard type="Total" />
        </div>
        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          {/* <div className="w-full lg:w-1/3 h-[450px]">
            <CountChart />
          </div> */}
          {/* ATTENDANCE CHART */}
          <div className="w-full lg:w-3/3 h-[450px]">
            <AttendanceChart />
          </div>
        </div>
        {/* BOTTOM CHART */}
        <div className="w-full h-[500px]">
        </div>
      </div>
      {/* Right */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        {/* <Announcements /> */}
        <Announcements />
      </div>
    </div>
  )
}

export default AdminPage