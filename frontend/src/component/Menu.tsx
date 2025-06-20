'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import ConfirmationModal from './ConfirmationModal';
import { 
  BarChart3, 
  History, 
  Users, 
  FileText,
  Home,
  UserPlus,
  Calendar,
  ClipboardList,
  RefreshCw,
  CalendarDays,
  MessageSquare,
  FileBarChart,
  User,
  LogOut
} from 'lucide-react';

// Interface untuk menu item dropdown
interface DropdownItem {
  label: string;
  href: string;
  visible: string[];
  icon?: React.ComponentType<{ className?: string }>;
}

// Interface untuk menu item
interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  visible: string[];
  dropdown?: DropdownItem[];
}

const menuItems = [
  {
    title: "MENU",
    items: [
      { icon: Home, label: "Dashboard", href: "/", visible: ["admin", "perawat","staf","dokter"] },
      { icon: UserPlus, label: "Pegawai", href: "/list/pegawai", visible: ["admin"] },
      { icon: Calendar, label: "Managemen Jadwal", href: "/list/managemenjadwal", visible: ["admin"] },
      { icon: ClipboardList, label: "Jadwal Saya", href: "/list/jadwalsaya", visible: ["perawat","staf","dokter"] },
      { icon: RefreshCw, label: "Ajukan Tukar Shift", href: "/list/ajukantukarshift", visible: ["admin", "perawat","staf","dokter","supervisor"] },
      { 
        icon: CalendarDays, 
        label: "Absensi", 
        visible: ["admin", "perawat","staf","dokter"],
        dropdown: [
          { label: "Dashboard Absensi", href: "/list/dashboard-absensi", visible: ["perawat","staf","dokter"], icon: BarChart3 },
          { label: "Riwayat Absensi", href: "/list/riwayat-absensi", visible: ["perawat","staf","dokter"], icon: History },
          { label: "Manajemen Absensi", href: "/list/manajemen-absensi", visible: ["admin"], icon: Users },
          { label: "Laporan Absensi", href: "/list/laporan-absensi", visible: ["admin"], icon: FileText },
        ]
      },
      { icon: CalendarDays, label: "Events", href: "/list/events", visible: ["admin", "perawat","staf","dokter"] },
      { icon: MessageSquare, label: "Pesan", href: "/list/messages", visible: ["admin", "perawat","staf","dokter"] },
      { icon: FileBarChart, label: "Laporan", href: "/list/laporan", visible: ["admin"] },
    ],
  },
  {
    title: "OTHER",
    items: [
      { icon: User, label: "Profile", href: "/list/profile", visible: ["admin", "perawat","staf","dokter"] },
      { icon: LogOut, label: "Logout", href: "/logout", visible: ["admin", "perawat","staf","dokter","supervisor"] },
    ],
  },
];

const Menu = () => {
  const [role, setRole] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("role")?.toLowerCase() || null;
    setRole(storedRole);
  }, []);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    import('@/lib/authUtils').then(({ clearAuthData }) => {
      clearAuthData();
      window.location.href = "/sign-in";
    });
  };

  // Close dropdown when clicking outside (for mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (openDropdown && !target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

  if (!role) return null;

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((group) => (
        <div className="flex flex-col gap-2" key={group.title}>
          <span className="hidden lg:block text-grey-400 font-light my-4">{group.title}</span>
          {group.items.map((item: MenuItem) => {
            if (!item.visible.includes(role)) return null;

            // Tangani URL khusus dashboard
            const linkHref =
              item.label === "Dashboard"
                ? role === "admin"
                  ? "/admin"
                  : "/pegawai"
                : item.href;

            if (item.label === "Logout") {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={handleLogout}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-3 lg:py-2 touch-manipulation hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="hidden lg:block">{item.label}</span>
                </button>
              );
            }

            // Jika item memiliki dropdown
            if (item.dropdown) {
              // Filter dropdown items berdasarkan role
              const visibleDropdownItems = item.dropdown.filter(dropdownItem => 
                dropdownItem.visible.includes(role)
              );

              // Jika tidak ada dropdown item yang visible untuk role ini, skip
              if (visibleDropdownItems.length === 0) return null;

              return (
                <div key={item.label} className="relative dropdown-container">
                  {/* Main dropdown trigger */}
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={`w-full flex items-center justify-center lg:justify-start gap-4 py-3 lg:py-2 rounded-lg transition-colors touch-manipulation ${
                      openDropdown === item.label 
                        ? 'text-blue-600 bg-blue-50 lg:text-gray-500 lg:bg-gray-100' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="hidden lg:block flex-1 text-left">{item.label}</span>
                    {/* Show arrow on both mobile and desktop with better mobile visibility */}
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        openDropdown === item.label ? 'rotate-180' : ''
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown menu - improved mobile styling */}
                  {openDropdown === item.label && (
                    <div className="lg:ml-6 mt-2 lg:mt-2 space-y-1 bg-white lg:bg-transparent rounded-xl lg:rounded-none shadow-xl lg:shadow-none border lg:border-none p-3 lg:p-0 lg:relative absolute lg:static z-50 lg:z-auto mobile-dropdown overflow-y-auto lg:overflow-visible">
                        {visibleDropdownItems.map((dropdownItem) => {
                          const IconComponent = dropdownItem.icon;
                          return (
                            <Link
                              key={dropdownItem.label}
                              href={dropdownItem.href}
                              className="block py-2 lg:py-2 px-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-sm lg:text-sm touch-manipulation font-medium"
                              onClick={() => setOpenDropdown(null)} // Close dropdown when item is clicked
                            >
                              {/* Desktop view - full label */}
                              <span className="hidden lg:block">{dropdownItem.label}</span>
                              {/* Mobile view - icon only */}
                              <div className="lg:hidden flex items-center justify-center">
                                {IconComponent && <IconComponent className="w-6 h-6" />}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                  )}
                </div>
              );
            }

            // Regular menu item (non-dropdown)
            return (
              <Link
                href={linkHref!}
                key={item.label}
                className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-3 lg:py-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
              >
                <item.icon className="w-5 h-5" />
                <span className="hidden lg:block">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
      
      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari aplikasi? Anda perlu login ulang untuk mengakses sistem."
        confirmText="Ya, Logout"
        cancelText="Batal"
        type="warning"
      />
    </div>
  );
};

export default Menu;

