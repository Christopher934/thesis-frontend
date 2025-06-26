'use client';

import { useEffect, useState, memo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import ConfirmationModal from './ConfirmationModal';
import { useUserRole } from '@/hooks/useUserRole';
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
      { icon: Home, label: "Dashboard", href: "/", visible: ["admin", "perawat","staf","dokter","supervisor"] },
      { icon: UserPlus, label: "Pegawai", href: "/dashboard/list/pegawai", visible: ["admin"] },
      { icon: Calendar, label: "Managemen Jadwal", href: "/dashboard/list/managemenjadwal", visible: ["admin"] },
      { icon: ClipboardList, label: "Jadwal Saya", href: "/dashboard/list/jadwalsaya", visible: ["perawat","staf","dokter","supervisor"] },
      { icon: RefreshCw, label: "Ajukan Tukar Shift", href: "/dashboard/list/ajukantukarshift", visible: ["admin", "perawat","staf","dokter","supervisor"] },
      { 
        icon: CalendarDays, 
        label: "Absensi", 
        visible: ["admin", "perawat","staf","dokter","supervisor"],
        dropdown: [
          { label: "Dashboard Absensi", href: "/dashboard/list/dashboard-absensi", visible: ["perawat","staf","dokter","supervisor"], icon: BarChart3 },
          { label: "Riwayat Absensi", href: "/dashboard/list/riwayat-absensi", visible: ["perawat","staf","dokter","supervisor"], icon: History },
          { label: "Manajemen Absensi", href: "/dashboard/list/manajemen-absensi", visible: ["admin"], icon: Users },
          { label: "Laporan Absensi", href: "/dashboard/list/laporan-absensi", visible: ["admin"], icon: FileText },
        ]
      },
      { icon: CalendarDays, label: "Events", href: "/dashboard/list/events", visible: ["admin", "perawat","staf","dokter","supervisor"] },
      { icon: MessageSquare, label: "Pesan", href: "/dashboard/list/notifications", visible: ["admin", "perawat","staf","dokter","supervisor"] },
      { icon: FileBarChart, label: "Laporan", href: "/dashboard/list/laporan", visible: ["admin","supervisor"] },
    ],
  },
  {
    title: "OTHER",
    items: [
      { icon: User, label: "Profile", href: "/dashboard/list/profile", visible: ["admin", "perawat","staf","dokter"] },
      { icon: LogOut, label: "Logout", href: "/logout", visible: ["admin", "perawat","staf","dokter","supervisor"] },
    ],
  },
];

const Menu = memo(() => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { role, isLoading } = useUserRole();
  const router = useRouter();
  const pathname = usePathname();

  const toggleDropdown = useCallback((label: string) => {
    setOpenDropdown(prev => prev === label ? null : label);
  }, []);

  const handleLogout = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);

  const confirmLogout = useCallback(() => {
    import('@/lib/authUtils').then(({ clearAuthData }) => {
      clearAuthData();
      router.push("/sign-in");
    });
  }, [router]);

  // Fast navigation handler
  const handleNavigation = useCallback((href: string) => {
    router.push(href);
  }, [router]);

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

  // Show loading state until hydrated
  if (isLoading) {
    return (
      <div className="mt-4 text-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-16 mb-4"></div>
          <div className="space-y-3">
            <div className="h-9 bg-gray-200 rounded"></div>
            <div className="h-9 bg-gray-200 rounded"></div>
            <div className="h-9 bg-gray-200 rounded"></div>
            <div className="h-9 bg-gray-200 rounded"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-12 mt-6 mb-4"></div>
          <div className="space-y-3">
            <div className="h-9 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no role after hydration
  if (!role) {
    return (
      <div className="mt-4 text-sm">
        <div className="text-gray-400 text-center py-8">
          <div className="mb-2">🔒</div>
          <p className="text-xs">Please log in to access menu</p>
        </div>
      </div>
    );
  }

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
                  : "/dashboard/pegawai"
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
                    <div className="lg:ml-6 mt-2 lg:mt-2 space-y-1 bg-white lg:bg-transparent rounded-xl lg:rounded-none shadow-xl lg:shadow-none border lg:border-none p-3 lg:p-0 absolute lg:static z-50 lg:z-auto mobile-dropdown overflow-y-auto lg:overflow-visible">
                        {visibleDropdownItems.map((dropdownItem) => {
                          const IconComponent = dropdownItem.icon;
                          return (
                            <button
                              key={dropdownItem.label}
                              onClick={() => {
                                handleNavigation(dropdownItem.href);
                                setOpenDropdown(null);
                              }}
                              className="block py-2 lg:py-2 px-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-sm lg:text-sm touch-manipulation font-medium w-full text-left"
                            >
                              {/* Desktop view - full label */}
                              <span className="hidden lg:block">{dropdownItem.label}</span>
                              {/* Mobile view - icon only */}
                              <div className="lg:hidden flex items-center justify-center">
                                {IconComponent && <IconComponent className="w-6 h-6" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                  )}
                </div>
              );
            }

            // Regular menu item (non-dropdown) with fast navigation
            return (
              <button
                onClick={() => linkHref && handleNavigation(linkHref)}
                key={item.label}
                className={`flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-3 lg:py-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation w-full text-left ${
                  pathname === linkHref ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="hidden lg:block">{item.label}</span>
              </button>
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
});

Menu.displayName = 'Menu';

export default Menu;

