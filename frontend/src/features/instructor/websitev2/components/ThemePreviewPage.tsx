import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Theme } from '../types';
import { Theme1Preview } from '../themes/theme1/Theme1Preview';
import { Theme2Preview } from '../themes/theme2/Theme2Preview';

// Component mapper for string references
const componentMap: { [key: string]: React.ComponentType<any> } = {
  'Theme1Preview': Theme1Preview,
  'Theme2Preview': Theme2Preview,
};

interface ThemePreviewPageProps {
  theme: Theme;
  onClose: () => void;
  onSelect: (theme: Theme) => void;
}

export const ThemePreviewPage: React.FC<ThemePreviewPageProps> = ({
  theme,
  onClose,
  onSelect
}) => {
  const PreviewComponent = theme.previewComponent ? componentMap[theme.previewComponent] : null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="h-6 w-px bg-gray-300"></div>
          
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{theme.name}</h1>
            <p className="text-sm text-gray-500">{theme.category} • {theme.price === 0 ? 'Free' : `$${theme.price}`}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onSelect(theme)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Select Theme
          </button>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="h-full overflow-auto">
        {PreviewComponent ? (
          <PreviewComponent />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Not Available</h3>
              <p className="text-gray-600">This theme doesn't have a preview component yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
