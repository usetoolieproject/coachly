import React from 'react';
import { List, Calendar as CalendarIcon } from 'lucide-react';
import { SearchInput } from '../../../../components/shared';

interface Props {
  view: 'list' | 'calendar';
  onChangeView: (v: 'list' | 'calendar') => void;
  search: string;
  onSearch: (v: string) => void;
}

const Toolbar: React.FC<Props> = ({ view, onChangeView, search, onSearch }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
      <SearchInput
        value={search}
        onChange={onSearch}
        placeholder="Search by title, platform, date, link..."
        className="w-full sm:flex-1"
      />
      <div className="flex items-center justify-center sm:justify-end">
        <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-full sm:w-auto max-w-xs sm:max-w-none">
          <button
            onClick={() => onChangeView('list')}
            className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium flex-1 sm:flex-none ${view === 'list' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            <List className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${view === 'list' ? 'text-purple-600' : 'text-gray-500'}`} />
            <span className="hidden sm:inline">List</span>
            <span className="sm:hidden">L</span>
          </button>
          <button
            onClick={() => onChangeView('calendar')}
            className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium flex-1 sm:flex-none ${view === 'calendar' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            <CalendarIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${view === 'calendar' ? 'text-purple-600' : 'text-gray-500'}`} />
            <span className="hidden sm:inline">Calendar</span>
            <span className="sm:hidden">C</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;


