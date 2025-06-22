'use client';

import { ComponentType } from 'react';
import RouteGuard from './RouteGuard';

/**
 * Higher-order component that wraps a page component with route protection
 */
export function withRouteGuard<P extends object>(
  WrappedComponent: ComponentType<P>,
  fallback?: React.ReactNode
) {
  const WithRouteGuardComponent = (props: P) => {
    return (
      <RouteGuard fallback={fallback}>
        <WrappedComponent {...props} />
      </RouteGuard>
    );
  };

  WithRouteGuardComponent.displayName = `withRouteGuard(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithRouteGuardComponent;
}
