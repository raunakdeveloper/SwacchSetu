import React from 'react';

const Loader = ({ text = 'Loading...', size = 'medium', fullScreen = false }) => {
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-12 w-12 border-b-2',
    large: 'h-16 w-16 border-b-3',
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 transition-opacity duration-300">
        <div className="text-center">
          <div className={`inline-block animate-spin rounded-full ${sizeClasses[size]} border-blue-600`}></div>
          <p className="mt-4 text-gray-600 animate-pulse">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 transition-opacity duration-300">
      <div className="text-center">
        <div className={`inline-block animate-spin rounded-full ${sizeClasses[size]} border-blue-600`}></div>
        <p className="mt-4 text-gray-600 animate-pulse">{text}</p>
      </div>
    </div>
  );
};

export default Loader;