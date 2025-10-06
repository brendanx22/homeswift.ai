import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`inline-block ${className}`}>
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-t-2 border-[#FF6B35] border-opacity-80`}
        style={{
          borderTopColor: 'transparent',
          borderRightColor: 'currentColor',
          borderBottomColor: 'currentColor',
          borderLeftColor: 'currentColor',
        }}
      />
    </div>
  );
};

export default LoadingSpinner;
