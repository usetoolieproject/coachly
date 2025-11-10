import React from 'react';

export const ProfessionalCoachThumbnail: React.FC = () => {
  return (
    <div className="w-full h-full bg-gray-50 p-3">
      {/* Purple Banner Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded mb-2 h-12 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="text-white text-xs font-bold">Professional Coach</div>
      </div>

      {/* Offer Box */}
      <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-purple-200">
        <div className="text-center">
          <div className="h-3 w-20 bg-purple-500 rounded mx-auto mb-1"></div>
          <div className="h-2 w-16 bg-green-500 rounded mx-auto mb-1"></div>
          <div className="h-2 w-12 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>

      {/* Community Cards Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white rounded-lg shadow-sm p-2 border border-purple-100">
          <div className="flex items-center mb-1">
            <div className="w-4 h-4 bg-purple-600 rounded-full mr-1"></div>
            <div className="h-2 w-16 bg-gray-300 rounded"></div>
          </div>
          <div className="h-2 w-20 bg-gray-200 rounded mb-1"></div>
          <div className="flex space-x-1">
            <div className="h-2 w-2 bg-gray-300 rounded"></div>
            <div className="h-2 w-2 bg-gray-300 rounded"></div>
            <div className="h-2 w-2 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-2 border border-blue-100">
          <div className="h-2 w-16 bg-gray-300 rounded mb-1"></div>
          <div className="h-1 w-full bg-gray-200 rounded mb-1"></div>
          <div className="h-1 w-3/4 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="flex items-center justify-between mt-2 px-2">
        <div className="h-2 w-8 bg-purple-500 rounded"></div>
        <div className="h-2 w-8 bg-gray-300 rounded"></div>
        <div className="h-2 w-8 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};
