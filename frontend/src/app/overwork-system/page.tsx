'use client';

import React from 'react';
import OverworkRequestSystem from '../../components/OverworkRequestSystem';

export default function OverworkSystemPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔥 Overwork Request Management System
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Sistem canggih untuk mengelola permintaan overwork ketika pegawai sudah mencapai batas maksimal shift. 
            User yang sudah full beban akan otomatis disabled dan harus buat request ke admin untuk menambah kapasitas.
          </p>
        </div>

        <OverworkRequestSystem />
        
        <div className="mt-12 bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📋 Cara Kerja Sistem Overwork Request
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">🚫 User Disabled</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• User mencapai batas maksimal shift (20/bulan)</li>
                <li>• Otomatis TIDAK BISA menambah jadwal lagi</li>
                <li>• Status berubah menjadi "DISABLED"</li>
                <li>• Perlu overwork request untuk lanjut</li>
              </ul>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">📝 Submit Request</h3>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• User buat overwork request</li>
                <li>• Pilih temporary atau permanent</li>
                <li>• Tentukan berapa tambahan shift</li>
                <li>• Berikan alasan yang jelas</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ Admin Approval</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Admin review semua pending request</li>
                <li>• Approve atau reject dengan alasan</li>
                <li>• Jika approved, user bisa shift lagi</li>
                <li>• Update limit permanent atau temporary</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">⚡ Fitur Advanced</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <strong>Real-time Validation:</strong>
                <ul className="ml-4 space-y-1">
                  <li>• Automatic eligibility checking</li>
                  <li>• Disable user saat limit tercapai</li>
                  <li>• Warning saat mendekati 90% limit</li>
                </ul>
              </div>
              <div>
                <strong>Smart Request System:</strong>
                <ul className="ml-4 space-y-1">
                  <li>• Temporary vs Permanent requests</li>
                  <li>• Priority levels (Low/Medium/High)</li>
                  <li>• Admin approval workflow</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
