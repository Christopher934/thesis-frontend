'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo, useCallback } from 'react';

interface FastLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
}

const FastLink = memo(({ href, children, className, prefetch = true }: FastLinkProps) => {
  const router = useRouter();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // Use router.push for instant navigation
    router.push(href);
  }, [href, router]);

  return (
    <Link 
      href={href} 
      className={className}
      prefetch={prefetch}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
});

FastLink.displayName = 'FastLink';

export default FastLink;
