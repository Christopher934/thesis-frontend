// File: app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Lazy load NotificationProvider to improve initial page load performance
const NotificationProvider = dynamic(
  () => import('@/components/notifications').then(mod => ({ default: mod.NotificationProvider })),
  { 
    loading: () => null
  }
);

// Preload font with display: swap for faster loading
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

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
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563EB',
  colorScheme: 'light',
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
          {/* Konten halaman lain akan dirender di sini */}
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
