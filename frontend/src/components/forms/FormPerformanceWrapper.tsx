import React, { memo, useMemo } from 'react';

interface FormPerformanceWrapperProps {
  children: React.ReactNode;
  cacheKey?: string;
}

const FormPerformanceWrapper = memo(({ children, cacheKey }: FormPerformanceWrapperProps) => {
  const memoizedChildren = useMemo(() => children, [children]);
  
  return <>{memoizedChildren}</>;
});

FormPerformanceWrapper.displayName = 'FormPerformanceWrapper';

export default FormPerformanceWrapper;
