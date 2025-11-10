import React from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';

const baseSkeleton = (isDark: boolean) => isDark ? 'bg-gray-700/60' : 'bg-gray-200';
const Shimmer: React.FC<{ isDark: boolean, className?: string }> = ({ isDark, className = '' }) => (
  <span
    className={`absolute inset-0 -translate-x-full bg-gradient-to-r ${isDark ? 'from-transparent via-white/10 to-transparent' : 'from-transparent via-white/60 to-transparent'} animate-shimmer ${className}`}
    aria-hidden
  />
);

export const TopStatsSkeleton: React.FC = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
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
  );
};

export const CoursesPanelSkeleton: React.FC = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`relative overflow-hidden rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'} shadow-sm p-6`}>
      <div className={`relative h-6 w-32 rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
        <Shimmer isDark={isDarkMode} />
      </div>
      <div className="mt-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`relative h-20 w-full rounded-lg ${baseSkeleton(isDarkMode)} animate-pulse`}>
            <Shimmer isDark={isDarkMode} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CommunityPanelSkeleton: React.FC = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`relative overflow-hidden rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'} shadow-sm p-6`}>
      <div className={`relative h-6 w-40 rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
        <Shimmer isDark={isDarkMode} />
      </div>
      <div className="mt-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`relative h-16 w-full rounded-lg ${baseSkeleton(isDarkMode)} animate-pulse`}>
            <Shimmer isDark={isDarkMode} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const UpcomingSessionsPanelSkeleton: React.FC = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`relative overflow-hidden rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'} shadow-sm p-6`}>
      <div className={`relative h-6 w-48 rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
        <Shimmer isDark={isDarkMode} />
      </div>
      <div className="mt-6 space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className={`relative h-24 w-full rounded-lg ${baseSkeleton(isDarkMode)} animate-pulse`}>
            <Shimmer isDark={isDarkMode} />
          </div>
        ))}
      </div>
    </div>
  );
};
