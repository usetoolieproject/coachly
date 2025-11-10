import React from 'react';
import SearchInput from '../../../shared/ui/SearchInput';
import { useTheme } from '../../../../contexts/ThemeContext';

type CommunityHeaderProps = {
  title: string;
  search: string;
  onSearchChange: (v: string) => void;
  actionsSlot?: React.ReactNode;
};

const CommunityHeader: React.FC<CommunityHeaderProps> = ({ title, search, onSearchChange, actionsSlot }) => {
  const { isDarkMode } = useTheme();
  
  const heading = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subheading = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="mb-6 sm:mb-8">
      {/* Desktop Layout - Original (lg and above) */}
      <div className="hidden lg:flex lg:flex-row lg:justify-between lg:items-center">
        <div>
          <h1 className={`text-3xl font-bold ${heading}`}>{title}</h1>
          <p className={`${subheading} mt-2`}>Connect with your students and share updates</p>
        </div>
        <div className="flex items-center space-x-4">
          {actionsSlot}
          <div className="w-64">
            <SearchInput value={search} onChange={onSearchChange} placeholder="Search posts..." />
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Layout - Two Row Design (below lg) */}
      <div className="lg:hidden">
        {/* Row 1: Title and Description */}
        <div className="mb-4 sm:mb-6">
          <h1 className={`text-2xl sm:text-3xl font-bold ${heading}`}>{title}</h1>
          <p className={`${subheading} mt-1 sm:mt-2 text-sm sm:text-base`}>Connect with your students and share updates</p>
        </div>

        {/* Row 2: Updating indicator and Refresh button (right side) */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 mb-4 sm:mb-6">
          {actionsSlot}
        </div>

        {/* Row 3: Search input (full width) */}
        <div className="w-full">
          <SearchInput value={search} onChange={onSearchChange} placeholder="Search posts..." />
        </div>
      </div>
    </div>
  );
};

export default CommunityHeader;


