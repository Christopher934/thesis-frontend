"use client";

import React from 'react';

interface ContentCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

const ContentCard: React.FC<ContentCardProps> = ({
  children,
  title,
  className = "",
  padding = 'md',
  shadow = 'sm'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${shadowClasses[shadow]} ${paddingClasses[padding]} ${className}`}>
      {title && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
};

export default ContentCard;
