import { UpdatingIndicator, RefreshButton } from '../../../../components/shared';
import { ExportPdfButton } from '../../../../components/shared/ui/ExportPdfButton';
import { ExportButton } from '../../../../components/shared/ui/ExportButton';
import { useTheme } from '../../../../contexts/ThemeContext';

export function StudentsHeader({ total, onExport, onExportPdf, isUpdating, onRefresh }: { total: number; onExport: () => void; onExportPdf: () => void; isUpdating: boolean; onRefresh: () => void; }) {
  const { isDarkMode } = useTheme();
  
  const heading = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subheading = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="mb-6 sm:mb-8">
      {/* Desktop Layout - Original (lg and above) */}
      <div className="hidden lg:flex lg:flex-row lg:justify-between lg:items-start">
        <div>
          <h1 className={`text-3xl font-bold ${heading}`}>Students</h1>
          <p className={`${subheading} mt-2`}>Manage and track your community members</p>
          <div className={`text-sm mt-2 ${muted}`}>Total: {total}</div>
        </div>
        <div className="flex items-center gap-3">
          <UpdatingIndicator isUpdating={isUpdating} />
          <RefreshButton onClick={onRefresh} />
          <ExportPdfButton onExport={onExportPdf} />
          <ExportButton onClick={onExport} />
        </div>
      </div>

      {/* Mobile/Tablet Layout - Multi-row Design (below lg) */}
      <div className="lg:hidden">
        {/* Row 1: Title and Description */}
        <div className="mb-4 sm:mb-6">
          <h1 className={`text-2xl sm:text-3xl font-bold ${heading}`}>Students</h1>
          <p className={`${subheading} mt-1 sm:mt-2 text-sm sm:text-base`}>Manage and track your community members</p>
          <div className={`text-sm mt-1 sm:mt-2 ${muted}`}>Total: {total}</div>
        </div>

        {/* Row 2: Refresh button (left) and Updating indicator (right) - Swapped for mobile */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <RefreshButton onClick={onRefresh} />
          <UpdatingIndicator isUpdating={isUpdating} />
        </div>

        {/* Row 3: Export buttons (full width) */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ExportPdfButton onExport={onExportPdf} />
          <ExportButton onClick={onExport} />
        </div>
      </div>
    </div>
  );
}


