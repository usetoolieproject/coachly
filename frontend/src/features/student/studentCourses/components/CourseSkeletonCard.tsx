import React from 'react';

const Shimmer: React.FC = () => (
  <div className="relative overflow-hidden">
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
  </div>
);

type Props = { isDark?: boolean };

export const CourseSkeletonCard: React.FC<Props> = ({ isDark }) => {
  const cardBg = isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const lineBg = isDark ? 'bg-gray-800' : 'bg-gray-200';
  return (
    <div className={`${cardBg} rounded-xl sm:rounded-2xl border shadow-sm overflow-hidden`}>
      <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} h-24 sm:h-32`}>
        <Shimmer />
      </div>
      <div className="p-3 sm:p-4 lg:p-5 space-y-2 sm:space-y-3">
        <div className={`${lineBg} h-4 sm:h-5 w-3/4 rounded`}></div>
        <div className={`${lineBg} h-3 sm:h-4 w-full rounded`}></div>
        <div className={`${lineBg} h-3 sm:h-4 w-5/6 rounded`}></div>
        <div className="mt-3 sm:mt-4 flex items-center justify-between">
          <div className={`${lineBg} h-1.5 sm:h-2 w-32 sm:w-40 rounded-full`}></div>
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-300'} h-8 sm:h-9 w-28 sm:w-36 rounded-lg`}></div>
        </div>
      </div>
    </div>
  );
};

export default CourseSkeletonCard;


