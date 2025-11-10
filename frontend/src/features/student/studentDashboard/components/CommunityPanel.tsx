import React, { useMemo, useState } from 'react';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { Pagination } from '../../../../components/shared';
import { CommunityActivityItem } from '../types';
import { useNavigate } from 'react-router-dom';

interface Props {
  isDarkMode: boolean;
  activities: CommunityActivityItem[];
}

const CommunityPanel: React.FC<Props> = ({ isDarkMode, activities }) => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil((activities?.length || 0) / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return (activities || []).slice(start, start + pageSize);
  }, [activities, page]);

  const openCommunity = () => {
    navigate('/student/community');
  };

  const viewPost = (item: CommunityActivityItem) => {
    // Navigate with only route state, no URL parameters to avoid persistence issues
    navigate('/student/community', { state: { postId: item.id, open: true } });
  };

  return (
    <section className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border min-h-[400px] max-h-[500px] ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} flex flex-col`}>
      <header className="mb-4 sm:mb-6 flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold">Community</h2>
        <button onClick={openCommunity} className={`text-xs sm:text-sm font-medium inline-flex items-center gap-1 sm:gap-1.5 hover:underline transition-colors p-1 sm:p-2 ${isDarkMode ? 'text-purple-300 hover:text-purple-200' : 'text-indigo-600 hover:text-indigo-700'}`}>
          <span className="hidden sm:inline">Open community</span>
          <span className="sm:hidden">Open</span>
          <ArrowUpRight size={12} className="sm:w-3.5 sm:h-3.5" />
        </button>
      </header>
      <div className="flex-1 overflow-y-hidden">
        <ul className="space-y-3">
        {paged.map((item) => (
          <li key={item.id} className={`flex items-start gap-2 rounded-lg p-2 border ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/60' : 'border-gray-100 hover:bg-gray-50'}`}>
            <div className={`mt-0.5 rounded-full p-1.5 flex-shrink-0 ${isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-indigo-50 text-indigo-600'}`}>
              <MessageCircle size={12} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-xs ${isDarkMode ? 'text-gray-200' : ''} line-clamp-2`}>
                <span className="font-medium">{item.actor}</span> {item.text}
              </div>
              <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.time}</div>
            </div>
            <button onClick={() => viewPost(item)} className={`rounded-lg px-2 py-1 text-xs shadow-sm border flex-shrink-0 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100 hover:bg-gray-800' : 'bg-white border-gray-200'}`}>View</button>
          </li>
        ))}
        {(activities?.length || 0) === 0 && (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <MessageCircle className={`mx-auto h-8 w-8 mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            No recent activity
          </div>
        )}
        </ul>
      </div>
      <div className="mt-auto pt-4">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPrevious={() => setPage(p => Math.max(1, p - 1))}
          onNext={() => setPage(p => Math.min(totalPages, p + 1))}
        />
      </div>
    </section>
  );
};

export default CommunityPanel;


