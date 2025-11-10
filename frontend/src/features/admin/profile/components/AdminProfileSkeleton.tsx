import React from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';

const AdminProfileSkeleton: React.FC = () => {
  const { isDarkMode } = useTheme();

  const baseSkeleton = isDarkMode ? 'bg-gray-700/60' : 'bg-gray-200';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className={`h-8 w-48 rounded ${baseSkeleton}`} />
        <div className={`h-10 w-32 rounded ${baseSkeleton}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information Skeleton */}
        <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className={`h-6 w-40 rounded mb-4 ${baseSkeleton}`} />
          
          {/* Profile Picture Skeleton */}
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-20 h-20 rounded-full ${baseSkeleton}`} />
            <div>
              <div className={`h-4 w-24 rounded mb-2 ${baseSkeleton}`} />
              <div className={`h-3 w-32 rounded ${baseSkeleton}`} />
            </div>
          </div>

          {/* Form Fields Skeleton */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={`h-4 w-20 rounded mb-2 ${baseSkeleton}`} />
                <div className={`h-10 rounded ${baseSkeleton}`} />
              </div>
              <div>
                <div className={`h-4 w-20 rounded mb-2 ${baseSkeleton}`} />
                <div className={`h-10 rounded ${baseSkeleton}`} />
              </div>
            </div>

            <div>
              <div className={`h-4 w-24 rounded mb-2 ${baseSkeleton}`} />
              <div className={`h-10 rounded ${baseSkeleton}`} />
            </div>

            <div>
              <div className={`h-4 w-28 rounded mb-2 ${baseSkeleton}`} />
              <div className={`h-10 rounded ${baseSkeleton}`} />
            </div>
          </div>
        </div>

        {/* Password Settings Skeleton */}
        <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className={`h-6 w-32 rounded mb-4 ${baseSkeleton}`} />
          
          <div className="space-y-4">
            <div>
              <div className={`h-4 w-32 rounded mb-2 ${baseSkeleton}`} />
              <div className={`h-10 rounded ${baseSkeleton}`} />
            </div>

            <div>
              <div className={`h-4 w-28 rounded mb-2 ${baseSkeleton}`} />
              <div className={`h-10 rounded ${baseSkeleton}`} />
            </div>

            <div>
              <div className={`h-4 w-36 rounded mb-2 ${baseSkeleton}`} />
              <div className={`h-10 rounded ${baseSkeleton}`} />
            </div>

            {/* Password Requirements Skeleton */}
            <div className="space-y-2">
              <div className={`h-3 w-48 rounded ${baseSkeleton}`} />
              <div className={`h-3 w-40 rounded ${baseSkeleton}`} />
              <div className={`h-3 w-44 rounded ${baseSkeleton}`} />
              <div className={`h-3 w-36 rounded ${baseSkeleton}`} />
            </div>

            <div className={`h-10 w-full rounded ${baseSkeleton}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfileSkeleton;
