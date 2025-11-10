import React, { useState } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Pagination } from '../../../../components/shared';

interface ActivityItem {
  id: number;
  title: string;
  who: string;
  when: string;
  icon: React.ReactNode;
  bg: string;
}

const RecentActivity: React.FC<{ activity: ActivityItem[] }> = ({ activity }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(activity.length / pageSize));

  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = activity.slice(startIndex, startIndex + pageSize);

  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const { isDarkMode } = useTheme();
  const cardBase = isDarkMode
    ? 'lg:col-span-2 rounded-lg border border-gray-700 bg-gray-800/80 shadow-sm backdrop-blur flex flex-col min-h-64'
    : 'lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col min-h-64';
  const heading = isDarkMode ? 'text-gray-100' : 'text-slate-800';
  const muted = isDarkMode ? 'text-gray-400' : 'text-slate-500';

  return (
    <div className={cardBase}>
      <div className="p-4 sm:p-6 pb-2">
        <h3 className={`text-base sm:text-lg font-semibold ${heading}`}>Recent Activity</h3>
      </div>
      <div className="p-4 sm:p-6 pt-0 flex-1 flex flex-col">
        <div className="space-y-3 sm:space-y-4 flex-1">
          {currentItems.map((item) => (
            <div key={item.id} className={`flex items-start gap-3 rounded-2xl border p-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${item.bg} flex items-center justify-center flex-shrink-0`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <p className={`font-medium text-sm sm:text-base ${heading} truncate`}>{item.title}</p>
                  <span className={`text-xs ${muted} self-start sm:self-auto`}>{item.when}</span>
                </div>
                <p className={`text-xs sm:text-sm mt-0.5 ${muted} truncate`}>{item.who}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={goToPrev}
            onNext={goToNext}
          />
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;


