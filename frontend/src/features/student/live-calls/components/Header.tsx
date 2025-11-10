import React from 'react';
import { UpdatingIndicator } from '../../../../components/shared/ui/UpdatingIndicator';
import { RefreshButton } from '../../../../components/shared/ui/RefreshButton';

interface HeaderProps {
  isUpdating: boolean;
  onRefresh: () => void;
}

const Header: React.FC<HeaderProps> = ({ isUpdating, onRefresh }) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Live Sessions</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Join live sessions with your instructor and peers</p>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4 mt-4 lg:mt-0 flex-shrink-0">
        {/* Mobile: Refresh button first, then updating indicator */}
        <div className="lg:hidden flex items-center space-x-2">
          <RefreshButton onClick={onRefresh} isRefreshing={isUpdating} />
          <UpdatingIndicator isUpdating={isUpdating} />
        </div>
        {/* Desktop: Original order */}
        <div className="hidden lg:flex items-center space-x-4">
          <UpdatingIndicator isUpdating={isUpdating} />
          <RefreshButton onClick={onRefresh} isRefreshing={isUpdating} />
        </div>
      </div>
    </div>
  );
};

export default Header;


