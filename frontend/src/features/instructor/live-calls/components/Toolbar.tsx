import React from 'react';
import { List, Grid } from 'lucide-react';
import SearchInput from '../../../../components/shared/ui/SearchInput';
import { useTheme } from '../../../../contexts/ThemeContext';

export function Toolbar({ view, onChangeView, search, onSearch }: {
  view: 'list' | 'calendar';
  onChangeView: (v: 'list' | 'calendar') => void;
  search: string;
  onSearch: (s: string) => void;
}) {
  const { isDarkMode } = useTheme();
  
  const cardClass = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const toggleBg = isDarkMode ? 'bg-gray-800' : 'bg-gray-100';
  const toggleActive = isDarkMode ? 'bg-gray-700 text-purple-300' : 'bg-white text-purple-600';
  const toggleInactive = isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900';

  return (
    <div className={`rounded-xl shadow-sm border p-4 sm:p-6 mb-6 sm:mb-8 ${cardClass}`}>
      {/* Desktop Layout - Original (md and above) */}
      <div className="hidden md:flex md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <SearchInput value={search} onChange={onSearch} placeholder="Search by title, platform, date, link…" />
        </div>
        <div className={`flex ${toggleBg} rounded-lg p-1`}>
          <button className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${view==='list'?toggleActive:toggleInactive}`} onClick={()=>onChangeView('list')}>
            <List className="w-4 h-4" />
            <span>List</span>
          </button>
          <button className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${view==='calendar'?toggleActive:toggleInactive}`} onClick={()=>onChangeView('calendar')}>
            <Grid className="w-4 h-4" />
            <span>Calendar</span>
          </button>
        </div>
      </div>

      {/* Mobile Layout - Stacked Design (below md) */}
      <div className="md:hidden space-y-4">
        {/* Row 1: Search input (full width) */}
        <div className="w-full">
          <SearchInput value={search} onChange={onSearch} placeholder="Search calls..." />
        </div>
        
        {/* Row 2: View toggle (centered) */}
        <div className="flex justify-center">
          <div className={`flex ${toggleBg} rounded-lg p-1`}>
            <button className={`px-3 py-2 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 text-sm ${view==='list'?toggleActive:toggleInactive}`} onClick={()=>onChangeView('list')}>
              <List className="w-4 h-4" />
              <span>List</span>
            </button>
            <button className={`px-3 py-2 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 text-sm ${view==='calendar'?toggleActive:toggleInactive}`} onClick={()=>onChangeView('calendar')}>
              <Grid className="w-4 h-4" />
              <span>Calendar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


