'use client';

import { useEffect, useState, memo, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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

const FastMenu = memo(() => {
  const [role, setRole] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Memoize role check for performance
  const userRole = useMemo(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("role")?.toLowerCase() || null;
    }
    return null;
  }, []);

  useEffect(() => {
    setRole(userRole);
  }, [userRole]);

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

  // Fast navigation handler - optimized for instant page changes
  const handleNavigation = useCallback((href: string) => {
    // Close any open dropdowns first
    setOpenDropdown(null);
    // Use router.push for instant navigation
    router.push(href);
  }, [router]);

  if (!role) return null;

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((group) => (
        <div className="flex flex-col gap-2" key={group.title}>
          <span className="hidden lg:block text-grey-400 font-light my-4">{group.title}</span>
          {group.items.map((item: MenuItem) => {
            if (!item.visible.includes(role)) return null;

            // Handle special dashboard URL
            const linkHref =
              item.label === "Dashboard"
                ? role === "admin"
                  ? "/admin"
                  : "/dashboard/pegawai"
                : item.href;

            // Handle logout button
            if (item.label === "Logout") {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={handleLogout}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-3 lg:py-2 touch-manipulation hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="hidden lg:block">{item.label}</span>
                </button>
              );
            }

            // Handle dropdown items
            if (item.dropdown) {
              const visibleDropdownItems = item.dropdown.filter(dropdownItem => 
                dropdownItem.visible.includes(role)
              );

              if (visibleDropdownItems.length === 0) return null;

              return (
                <div key={item.label} className="relative dropdown-container">
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

                  {openDropdown === item.label && (
                    <div className="lg:ml-6 mt-2 space-y-1 bg-white lg:bg-transparent rounded-xl lg:rounded-none shadow-xl lg:shadow-none border lg:border-none p-3 lg:p-0">
                      {visibleDropdownItems.map((dropdownItem) => {
                        const IconComponent = dropdownItem.icon;
                        return (
                          <button
                            key={dropdownItem.label}
                            onClick={() => handleNavigation(dropdownItem.href)}
                            className="block py-2 px-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-sm touch-manipulation font-medium w-full text-left"
                          >
                            <span className="hidden lg:block">{dropdownItem.label}</span>
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

            // Regular menu item with fast navigation
            return (
              <button
                onClick={() => linkHref && handleNavigation(linkHref)}
                key={item.label}
                className={`flex items-center justify-center lg:justify-start gap-4 py-3 lg:py-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation w-full text-left ${
                  pathname === linkHref ? 'bg-blue-50 text-blue-600' : 'text-gray-500'
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

FastMenu.displayName = 'FastMenu';

export default FastMenu;
