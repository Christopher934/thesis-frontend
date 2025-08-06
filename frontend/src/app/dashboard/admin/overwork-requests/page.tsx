'use client';

import React from 'react';
import withAuth from '@/lib/withAuth';
import OverworkRequestSystem from '@/components/OverworkRequestSystem';

function AdminOverworkRequestsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin: Overwork Request Management</h1>
          <p className="text-gray-600 mt-2">
            Kelola semua permintaan overwork dari pegawai
          </p>
        </div>

        {/* Overwork Request System Component */}
        <div className="bg-white rounded-lg shadow-sm">
          <OverworkRequestSystem defaultTab="admin-panel" />
        </div>
      </div>
    </div>
  );
}

export default withAuth(AdminOverworkRequestsPage, ['ADMIN']);
