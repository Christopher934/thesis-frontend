'use client';

import withAuth from '@/lib/withAuth';
import AdminShiftOptimizationDashboard from '@/components/admin/AdminShiftOptimizationDashboard';

const AdminOptimizationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminShiftOptimizationDashboard />
    </div>
  );
};

// Proteksi halaman hanya untuk role ADMIN dan SUPERVISOR
export default withAuth(AdminOptimizationPage, ['ADMIN', 'SUPERVISOR']);
