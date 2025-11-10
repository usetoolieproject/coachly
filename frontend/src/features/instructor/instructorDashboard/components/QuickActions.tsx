import React from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { CalendarClock, Users, PlusCircle, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const cardBase = isDarkMode
    ? 'rounded-lg border border-gray-700 bg-gray-800/80 shadow-sm backdrop-blur'
    : 'rounded-lg border border-gray-200 bg-white shadow-sm';
  return (
    <div className={cardBase}>
      <div className="p-4 sm:p-6 pb-2">
        <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-slate-800'}`}>Quick Actions</h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Start building and manage faster</p>
      </div>
      <div className="p-4 sm:p-6 pt-0">
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => navigate('/coach/courses')}
            className={`flex items-center justify-between w-full rounded-xl p-3 sm:p-4 shadow-sm transition ${isDarkMode ? 'bg-indigo-900/20 hover:bg-indigo-900/30 text-indigo-300' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'}`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-1.5 sm:p-2 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-white/70'}`}>
                <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
              </div>
              <span className="font-medium text-sm sm:text-base">Create Course</span>
            </div>
            <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 opacity-70" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/coach/live-calls')}
            className={`flex items-center justify-between w-full rounded-xl p-3 sm:p-4 shadow-sm transition ${isDarkMode ? 'bg-purple-900/20 hover:bg-purple-900/30 text-purple-300' : 'bg-purple-50 hover:bg-purple-100 text-purple-700'}`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-1.5 sm:p-2 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-white/70'}`}>
                <CalendarClock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
              <span className="font-medium text-sm sm:text-base">Schedule Live Session</span>
            </div>
            <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 opacity-70" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/coach/students')}
            className={`flex items-center justify-between w-full rounded-xl p-3 sm:p-4 shadow-sm transition ${isDarkMode ? 'bg-teal-900/20 hover:bg-teal-900/30 text-teal-300' : 'bg-teal-50 hover:bg-teal-100 text-teal-700'}`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-1.5 sm:p-2 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-white/70'}`}>
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
              </div>
              <span className="font-medium text-sm sm:text-base">Manage Students</span>
            </div>
            <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 opacity-70" />
          </button>

          {/* Removed Analytics & Reports action by request */}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;


