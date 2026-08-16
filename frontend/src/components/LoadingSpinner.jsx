import React from 'react';

export const LoadingSpinner = ({ size = 'md', fullPage = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div className={`${sizeClasses[size]} border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}></div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-4">
            {spinner}
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <div className="flex justify-center">{spinner}</div>;
};

export const SkeletonLoader = ({ count = 3, columns = 'grid-cols-3' }) => {
  return (
    <div className={`grid ${columns} gap-4 animate-pulse`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-xl h-48 animate-shimmer"></div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
