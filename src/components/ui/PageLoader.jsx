import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <LoadingSpinner size="lg" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">{message}</h2>
        <p className="text-gray-500">Please wait a moment</p>
      </div>
    </div>
  );
};

export default PageLoader;
