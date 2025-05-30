'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function withAuth(Component: any, allowedRoles: string[]) {
  return function AuthWrapper(props: any) {
    const router = useRouter();

    useEffect(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user || !allowedRoles.includes(user.role)) {
        router.push('/sign-in');
      }
    }, []);

    return <Component {...props} />;
  };
}

export default withAuth;
