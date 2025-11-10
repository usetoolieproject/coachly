import React from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';

const baseSkeleton = (isDark: boolean) => isDark ? 'bg-gray-700/60' : 'bg-gray-200';
const Shimmer: React.FC<{ isDark: boolean, className?: string }> = ({ isDark, className = '' }) => (
  <span
    className={`absolute inset-0 -translate-x-full bg-gradient-to-r ${isDark ? 'from-transparent via-white/10 to-transparent' : 'from-transparent via-white/60 to-transparent'} animate-shimmer ${className}`}
    aria-hidden
  />
);

export const CardSkeleton: React.FC<{ className?: string } > = ({ className = '' }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`relative overflow-hidden rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'} shadow-sm p-4 ${className}`}>
      <div className={`relative h-4 w-24 rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
        <Shimmer isDark={isDarkMode} />
      </div>
      <div className={`relative mt-4 h-7 w-20 rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
        <Shimmer isDark={isDarkMode} />
      </div>
    </div>
  );
};

export const StatsCardsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
  </div>
);

export const RevenueOverviewSkeleton: React.FC = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`relative overflow-hidden rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'} shadow-sm p-6`}>
      <div className={`relative h-5 w-40 rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
        <Shimmer isDark={isDarkMode} />
      </div>
      <div className={`relative mt-6 h-48 w-full rounded ${isDarkMode ? 'bg-gray-700/70' : 'bg-gray-100'} animate-pulse`}>
        <Shimmer isDark={isDarkMode} />
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[0,1,2].map((k) => (
          <div key={k} className={`relative h-6 w-24 rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
            <Shimmer isDark={isDarkMode} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const TopCoursesSkeleton: React.FC = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`relative overflow-hidden rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'} shadow-sm p-6`}>
      <div className={`relative h-5 w-56 rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
        <Shimmer isDark={isDarkMode} />
      </div>
      <div className="mt-4 space-y-3">
        {[1,2,3].map((i) => (
          <div key={i} className={`relative h-14 w-full rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
            <Shimmer isDark={isDarkMode} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const RecentActivitySkeleton: React.FC = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`lg:col-span-2 relative overflow-hidden rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'} shadow-sm p-6`}>
      <div className={`relative h-5 w-40 rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
        <Shimmer isDark={isDarkMode} />
      </div>
      <div className="mt-4 space-y-3">
        {[1,2,3].map((i) => (
          <div key={i} className={`relative h-16 w-full rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
            <Shimmer isDark={isDarkMode} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const QuickActionsSkeleton: React.FC = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`relative overflow-hidden rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'} shadow-sm p-6`}>
      <div className={`relative h-5 w-32 rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
        <Shimmer isDark={isDarkMode} />
      </div>
      <div className="mt-4 space-y-3">
        {[1,2,3].map((i) => (
          <div key={i} className={`relative h-12 w-full rounded ${baseSkeleton(isDarkMode)} animate-pulse`}>
            <Shimmer isDark={isDarkMode} />
          </div>
        ))}
      </div>
    </div>
  );
};


