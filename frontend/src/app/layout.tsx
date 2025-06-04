// File: app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import StorageCleaner from '@/component/StorageCleaner'; // ← impor Client Component

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AnugerahCare',
  description: 'Next.js Staff Management System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Komponen ini hanya menjalankan efek di client (menghapus localStorage saat unload) */}
        <StorageCleaner />

        {/* Konten halaman lain akan dirender di sini */}
        {children}
      </body>
    </html>
  );
}
