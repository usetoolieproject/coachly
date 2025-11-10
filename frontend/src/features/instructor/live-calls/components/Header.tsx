import { UpdatingIndicator } from '../../../../components/shared';
import { useTheme } from '../../../../contexts/ThemeContext';

export function Header({ isUpdating, onCreate }: { isUpdating: boolean; onCreate: () => void }) {
  const { isDarkMode } = useTheme();
  
  const heading = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subheading = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="mb-6 sm:mb-8">
      {/* Desktop Layout - Original (lg and above) */}
      <div className="hidden lg:flex lg:flex-row lg:justify-between lg:items-center">
        <div>
          <h1 className={`text-3xl font-bold ${heading}`}>Live Calls</h1>
          <p className={`${subheading} mt-2`}>Schedule and manage live video calls with your students</p>
        </div>
        <div className="flex items-center gap-3">
          <UpdatingIndicator isUpdating={isUpdating} />
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors" onClick={onCreate}>Schedule Call</button>
        </div>
      </div>

      {/* Mobile/Tablet Layout - Two Row Design (below lg) */}
      <div className="lg:hidden">
        {/* Row 1: Title and Description */}
        <div className="mb-4 sm:mb-6">
          <h1 className={`text-2xl sm:text-3xl font-bold ${heading}`}>Live Calls</h1>
          <p className={`${subheading} mt-1 sm:mt-2 text-sm sm:text-base`}>Schedule and manage live video calls with your students</p>
        </div>

        {/* Row 2: Updating indicator and Schedule Call button (right side) */}
        <div className="flex items-center justify-end gap-3 sm:gap-4">
          <UpdatingIndicator isUpdating={isUpdating} />
          <button className="px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base" onClick={onCreate}>Schedule Call</button>
        </div>
      </div>
    </div>
  );
}


