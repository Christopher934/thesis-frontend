// src/app/(dashboard)/pegawai/page.tsx

import dynamic from 'next/dynamic';

const PegawaiPage = dynamic(() => import('@/component/pages/PegawaiPageProtected'), {
  ssr: false,
});

export default PegawaiPage;
