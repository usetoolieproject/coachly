import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Calendar, PlayCircle } from 'lucide-react';
import { LiveSessionItem } from '../types';
import Pagination from '../../../../components/shared/ui/Pagination';

interface Props {
  isDarkMode: boolean;
  sessions: LiveSessionItem[];
}

const UpcomingSessionsPanel: React.FC<Props> = ({ isDarkMode, sessions }) => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const pageSize = 3;

  const totalPages = Math.max(1, Math.ceil(sessions.length / pageSize));
  const start = (page - 1) * pageSize;
  const visible = sessions.slice(start, start + pageSize);

  const goToAllSessions = () => navigate('/student/live-calls');

  const viewSession = (session: LiveSessionItem) => {
    navigate('/student/live-calls', { state: { selectCallId: session.id, openModal: true } });
  };

  return (
    <section className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border min-h-[400px] max-h-[500px] ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} flex flex-col`}>
      <header className="mb-4 sm:mb-6 flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold">Upcoming Sessions</h2>
        <button onClick={goToAllSessions} className={`text-xs sm:text-sm font-medium inline-flex items-center gap-1 sm:gap-1.5 hover:underline transition-colors p-1 sm:p-2 ${isDarkMode ? 'text-purple-300 hover:text-purple-200' : 'text-indigo-600 hover:text-indigo-700'}`}>
          <span className="hidden sm:inline">All sessions</span>
          <span className="sm:hidden">All</span>
          <ArrowUpRight size={12} className="sm:w-3.5 sm:h-3.5" />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
        {visible.map((session) => (
          <div key={session.id} className={`flex items-center gap-2 rounded-lg p-2 border ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/60' : 'border-gray-100 hover:bg-gray-50'}`}>
            <div className={`rounded-lg p-2 flex-shrink-0 ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100'}`}>
              <Calendar size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-medium text-xs ${isDarkMode ? 'text-gray-100' : ''} truncate`}>{session.title}</div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>{session.when} · {session.host}</div>
            </div>
            <button onClick={() => viewSession(session)} className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white shadow flex-shrink-0 ${isDarkMode ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-green-600 hover:bg-green-700'}`}>
              <PlayCircle size={10} /> 
              <span>View</span>
            </button>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Calendar className={`mx-auto h-8 w-8 mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            No upcoming sessions
          </div>
        )}
        </div>
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPrevious={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        className="mt-4"
      />
    </section>
  );
};

export default UpcomingSessionsPanel;


