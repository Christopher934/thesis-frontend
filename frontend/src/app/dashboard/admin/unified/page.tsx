'use client';

import dynamic from 'next/dynamic';

// Dynamic import untuk menghindari SSR issues
const UnifiedAdminPageComponent = dynamic(() => import('../unified'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <div className="text-lg">Loading Admin Dashboard...</div>
      </div>
    </div>
  )
});

const UnifiedAdminPage: React.FC = () => {
  return <UnifiedAdminPageComponent />;
};

export default UnifiedAdminPage;
