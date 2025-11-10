import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const baseSkeleton = (isDark: boolean) => isDark ? 'bg-gray-700/60' : 'bg-gray-200';
const Shimmer: React.FC<{ isDark: boolean, className?: string }> = ({ isDark, className = '' }) => (
  <span
    className={`absolute inset-0 -translate-x-full bg-gradient-to-r ${isDark ? 'from-transparent via-white/10 to-transparent' : 'from-transparent via-white/60 to-transparent'} animate-shimmer ${className}`}
    aria-hidden
  />
);

export const PageLoadingSkeleton: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className={`relative h-8 w-64 rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
            <Shimmer isDark={isDarkMode} />
          </div>
          <div className={`relative mt-2 h-4 w-96 rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
            <Shimmer isDark={isDarkMode} />
          </div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`relative overflow-hidden rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'} shadow-sm p-6`}>
              <div className={`relative h-4 w-20 rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
                <Shimmer isDark={isDarkMode} />
              </div>
              <div className={`relative mt-3 h-8 w-16 rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
                <Shimmer isDark={isDarkMode} />
              </div>
              <div className={`relative mt-2 h-3 w-24 rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
                <Shimmer isDark={isDarkMode} />
              </div>
            </div>
          ))}
        </div>

        {/* Content sections skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className={`relative overflow-hidden rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'} shadow-sm p-6`}>
            <div className={`relative h-5 w-40 rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
              <Shimmer isDark={isDarkMode} />
            </div>
            <div className={`relative mt-6 h-48 w-full rounded ${isDarkMode ? 'bg-gray-700/70' : 'bg-gray-100'} animate-pulse`}>
              <Shimmer isDark={isDarkMode} />
            </div>
          </div>
          
          <div className={`relative overflow-hidden rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'} shadow-sm p-6`}>
            <div className={`relative h-5 w-56 rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
              <Shimmer isDark={isDarkMode} />
            </div>
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`relative h-14 w-full rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
                  <Shimmer isDark={isDarkMode} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity section skeleton */}
        <div className={`relative overflow-hidden rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'} shadow-sm p-6`}>
          <div className={`relative h-5 w-40 rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
            <Shimmer isDark={isDarkMode} />
          </div>
          <div className="mt-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`relative h-16 w-full rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
                <Shimmer isDark={isDarkMode} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoadingSkeleton;
