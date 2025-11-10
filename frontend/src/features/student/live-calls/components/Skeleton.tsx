import React from 'react';

const Skeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-300 rounded w-1/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-32 bg-gray-300 rounded"></div>
        <div className="h-32 bg-gray-300 rounded"></div>
      </div>
      <div className="h-64 bg-gray-300 rounded"></div>
    </div>
  );
};

export default Skeleton;


