import React from 'react';

export const FitnessTrainerThumbnail: React.FC = () => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-orange-50 to-red-50 p-3">
      {/* Hero Section with Orange/Red Gradient */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded mb-2 h-16 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="text-white text-xs font-bold">Transform Your Body</div>
      </div>

      {/* Trainer About Card */}
      <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-orange-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
          <div className="flex-1">
            <div className="h-2 w-16 bg-gray-300 rounded mb-1"></div>
            <div className="h-1.5 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="mt-1 flex gap-1">
          <div className="h-1.5 w-8 bg-orange-200 rounded"></div>
          <div className="h-1.5 w-10 bg-orange-200 rounded"></div>
        </div>
      </div>

      {/* Workout Plans Grid */}
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <div className="bg-white rounded shadow-sm p-1.5 border border-orange-100">
          <div className="h-3 w-full bg-gradient-to-r from-orange-400 to-red-500 rounded mb-1"></div>
          <div className="h-1.5 w-12 bg-gray-200 rounded mb-0.5"></div>
          <div className="flex gap-0.5">
            <div className="h-1 w-1 bg-gray-300 rounded"></div>
            <div className="h-1 w-1 bg-gray-300 rounded"></div>
            <div className="h-1 w-1 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded shadow-sm p-1.5 text-white">
          <div className="h-2 w-8 bg-white/30 rounded mb-1 mx-auto"></div>
          <div className="h-1.5 w-10 bg-white/30 rounded mb-0.5 mx-auto"></div>
          <div className="flex gap-0.5 justify-center">
            <div className="h-1 w-1 bg-white/50 rounded"></div>
            <div className="h-1 w-1 bg-white/50 rounded"></div>
          </div>
        </div>
        <div className="bg-white rounded shadow-sm p-1.5 border border-orange-100">
          <div className="h-3 w-full bg-gray-300 rounded mb-1"></div>
          <div className="h-1.5 w-10 bg-gray-200 rounded mb-0.5"></div>
          <div className="flex gap-0.5">
            <div className="h-1 w-1 bg-gray-300 rounded"></div>
            <div className="h-1 w-1 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>

      {/* Transformation Gallery Preview */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="bg-white rounded shadow-sm p-1 border border-orange-100">
          <div className="h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded mb-0.5"></div>
          <div className="h-1 w-12 bg-orange-300 rounded"></div>
        </div>
        <div className="bg-white rounded shadow-sm p-1 border border-orange-100">
          <div className="h-8 bg-gradient-to-r from-orange-300 to-red-400 rounded mb-0.5"></div>
          <div className="h-1 w-14 bg-orange-300 rounded"></div>
        </div>
      </div>
    </div>
  );
};

