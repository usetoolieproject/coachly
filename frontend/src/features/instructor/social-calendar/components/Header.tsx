import React from 'react';
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';

export function Header({ view, onChangeView, onNew, label, onPrev, onNext, onToday }: { view: 'month' | 'week'; onChangeView: (v: 'month' | 'week') => void; onNew: () => void; label: string; onPrev: () => void; onNext: () => void; onToday: () => void; }) {
  const { isDarkMode } = useTheme();
  
  const heading = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subheading = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const buttonBg = isDarkMode ? 'bg-gray-800' : 'bg-gray-100';
  const buttonText = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const buttonHover = isDarkMode ? 'hover:text-gray-100' : 'hover:text-gray-900';
  const activeButton = isDarkMode ? 'bg-gray-700 text-purple-400' : 'bg-white text-purple-600';
  const labelText = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const navButton = isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50';

  return (
    <div className="mb-6 sm:mb-7">
      {/* Desktop Layout - Original (lg and above) */}
      <div className="hidden lg:flex lg:items-start lg:justify-between">
        <div>
          <h1 className={`text-4xl font-bold tracking-tight ${heading}`}>Social Calendar</h1>
          <p className={`${subheading} mt-2 text-lg`}>Plan and schedule your social media content</p>
        </div>
        <button onClick={onNew} className="px-5 py-2.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-2.5 text-base">
          <Plus className="w-5 h-5" /> New Post
        </button>
      </div>

      {/* Mobile/Tablet Layout - Multi-row Design (below lg) */}
      <div className="lg:hidden">
        {/* Row 1: Title and Description */}
        <div className="mb-4 sm:mb-6">
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${heading}`}>Social Calendar</h1>
          <p className={`${subheading} mt-1 sm:mt-2 text-sm sm:text-base`}>Plan and schedule your social media content</p>
        </div>

        {/* Row 2: New Post Button */}
        <div className="mb-4 sm:mb-6">
          <button onClick={onNew} className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-2.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center justify-center gap-2.5 text-sm sm:text-base">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> New Post
          </button>
        </div>
      </div>

      {/* Navigation Controls - Responsive Design */}
      <div className={`mt-4 sm:mt-5 ${cardBg} rounded-xl border px-3 sm:px-4 lg:px-5 py-3 sm:py-4`}>
        {/* Desktop Layout - Horizontal (lg and above) */}
        <div className="hidden lg:flex lg:items-center lg:justify-between">
          <div className={`flex ${buttonBg} rounded-lg p-1.5`}>
            <button onClick={() => onChangeView('week')} className={`px-4.5 py-2.5 rounded-md font-medium transition-all duration-200 flex items-center gap-2.5 text-base ${view === 'week' ? activeButton : `${buttonText} ${buttonHover}`}`}>
              <Clock className="w-5 h-5" /> Week
            </button>
            <button onClick={() => onChangeView('month')} className={`px-4.5 py-2.5 rounded-md font-medium transition-all duration-200 flex items-center gap-2.5 text-base ${view === 'month' ? activeButton : `${buttonText} ${buttonHover}`}`}>
              <Calendar className="w-5 h-5" /> Month
            </button>
          </div>

          <div className={`text-center font-semibold ${labelText} text-lg`}>{label}</div>

          <div className="flex items-center gap-2">
            <button onClick={onPrev} className={`px-3.5 py-2 rounded-md border ${navButton}`}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={onToday} className={`px-3.5 py-2 rounded-md border ${navButton} text-base`}>Today</button>
            <button onClick={onNext} className={`px-3.5 py-2 rounded-md border ${navButton}`}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Layout - Multi-row Design (below lg) */}
        <div className="lg:hidden">
          {/* Row 1: View Toggle */}
          <div className="flex justify-center mb-4">
            <div className={`flex ${buttonBg} rounded-lg p-1.5`}>
              <button onClick={() => onChangeView('week')} className={`px-3 sm:px-4.5 py-2 sm:py-2.5 rounded-md font-medium transition-all duration-200 flex items-center gap-1.5 sm:gap-2.5 text-sm sm:text-base ${view === 'week' ? activeButton : `${buttonText} ${buttonHover}`}`}>
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Week</span>
              </button>
              <button onClick={() => onChangeView('month')} className={`px-3 sm:px-4.5 py-2 sm:py-2.5 rounded-md font-medium transition-all duration-200 flex items-center gap-1.5 sm:gap-2.5 text-sm sm:text-base ${view === 'month' ? activeButton : `${buttonText} ${buttonHover}`}`}>
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Month</span>
              </button>
            </div>
          </div>

          {/* Row 2: Current Period Label */}
          <div className="text-center mb-4">
            <div className={`font-semibold ${labelText} text-base sm:text-lg`}>{label}</div>
          </div>

          {/* Row 3: Navigation Controls */}
          <div className="flex items-center justify-center gap-2">
            <button onClick={onPrev} className={`px-3 sm:px-3.5 py-2 rounded-md border ${navButton}`}>
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button onClick={onToday} className={`px-3 sm:px-3.5 py-2 rounded-md border ${navButton} text-sm sm:text-base`}>Today</button>
            <button onClick={onNext} className={`px-3 sm:px-3.5 py-2 rounded-md border ${navButton}`}>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


