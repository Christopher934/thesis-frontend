'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Cookies from 'js-cookie';

const menuItems = [
  {
    title: "MENU",
    items: [
      { icon: "/home.png", label: "Dashboard", href: "/", visible: ["admin", "perawat","staf","dokter"] },
      { icon: "/tenagakerja.png", label: "Pegawai", href: "/list/pegawai", visible: ["admin"] },
      { icon: "/subject.png", label: "Managemen Jadwal", href: "/list/managemenjadwal", visible: ["admin"] },
      { icon: "/class.png", label: "Jadwal Saya", href: "/list/jadwalsaya", visible: ["perawat","staf","dokter"] },
      { icon: "/assignment.png", label: "Ajukan Tukar Shift", href: "/list/ajukantukarshift", visible: ["admin", "perawat","staf","dokter","supervisor"] },
      { icon: "/attendance.png", label: "Absensi", href: "/list/absensi", visible: ["admin", "perawat","staf","dokter"] },
      { icon: "/calendar.png", label: "Events", href: "/list/events", visible: ["admin", "perawat","staf","dokter"] },
      { icon: "/message.png", label: "Pesan", href: "/list/messages", visible: ["admin", "perawat","staf","dokter"] },
      { icon: "/announcement.png", label: "Laporan", href: "/list/laporan", visible: ["admin"] },
    ],
  },
  {
    title: "OTHER",
    items: [
      { icon: "/profile.png", label: "Profile", href: "/list/profile", visible: ["admin", "perawat","staf","dokter"] },
      { icon: "/logout.png", label: "Logout", href: "/logout", visible: ["admin", "perawat","staf","dokter","supervisor"] },
    ],
  },
];

const Menu = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role")?.toLowerCase() || null;
    setRole(storedRole);
  }, []);

  if (!role) return null;

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((group) => (
        <div className="flex flex-col gap-2" key={group.title}>
          <span className="hidden lg:block text-grey-400 font-light my-4">{group.title}</span>
          {group.items.map((item) => {
            if (!item.visible.includes(role)) return null;

            // Tangani URL khusus dashboard
            const linkHref =
              item.label === "Dashboard"
                ? role === "admin"
                  ? "/admin"
                  : "/pegawai"
                : item.href;

            if (item.label === "Logout") {
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    import('@/lib/authUtils').then(({ clearAuthData }) => {
                      clearAuthData();
                      window.location.href = "/sign-in";
                    });
                  }}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2"
                >
                  <Image src={item.icon} alt={item.label} width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                href={linkHref}
                key={item.label}
                className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2"
              >
                <Image src={item.icon} alt={item.label} width={20} height={20} />
                <span className="hidden lg:block">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
