// File: app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import StorageCleaner from '@/components/common/StorageCleaner'; // ← impor Client Component
import AuthStateSynchronizer from '@/components/auth/AuthStateSynchronizer';
import InvalidTokenHandler from '@/components/auth/InvalidTokenHandler';
import { NotificationProvider } from '@/components/notifications';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RSUD Anugerah - Hospital Management System',
  description: 'Sistem Manajemen Rumah Sakit RSUD Anugerah Tomohon - Staff Management, Attendance Tracking, and Shift Scheduling',
  keywords: 'RSUD Anugerah, Hospital Management, Staff Scheduling, Attendance Tracking, Healthcare System',
  authors: [{ name: 'RSUD Anugerah IT Team' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/logo.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: '/logo.png'
  },
  manifest: '/manifest.json',
  themeColor: '#2563EB',
  colorScheme: 'light',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NotificationProvider>
          {/* Komponen ini hanya menjalankan efek di client (menghapus localStorage saat unload) */}
          <StorageCleaner />
          
          {/* Synchronize auth state between localStorage and cookies */}
          <AuthStateSynchronizer />
          
          {/* Handle invalid JWT tokens and auto-logout */}
          <InvalidTokenHandler />

          {/* Konten halaman lain akan dirender di sini */}
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
