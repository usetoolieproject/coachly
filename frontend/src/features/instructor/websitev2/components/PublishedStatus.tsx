import React from 'react';
import { Globe, Copy, ExternalLink } from 'lucide-react';
import { WebsiteUtils } from '../utils/websiteUtils';
import { useTheme } from '../../../../contexts/ThemeContext';

interface PublishedStatusProps {
  isPublished: boolean;
}

export const PublishedStatus: React.FC<PublishedStatusProps> = ({ isPublished }) => {
  const { isDarkMode } = useTheme();
  
  if (!isPublished) return null;

  return (
    <div className={`border rounded-lg p-4 mb-8 ${
      isDarkMode 
        ? 'bg-green-900/20 border-green-700' 
        : 'bg-green-50 border-green-200'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Row 1: Live status and description */}
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isDarkMode ? 'bg-green-800/30' : 'bg-green-100'
          }`}>
            <Globe className={`w-5 h-5 ${
              isDarkMode ? 'text-green-400' : 'text-green-600'
            }`} />
          </div>
          <div>
            <h3 className={`font-medium ${
              isDarkMode ? 'text-green-300' : 'text-green-900'
            }`}>
              Your Website is Live!
            </h3>
            <p className={`text-sm ${
              isDarkMode ? 'text-green-400' : 'text-green-700'
            }`}>
              Your website is now published and accessible to students.
            </p>
          </div>
        </div>
        
        {/* Row 2: URL section with actions */}
        <div className="text-sm">
          <div className={`font-medium mb-1 ${
            isDarkMode ? 'text-green-300' : 'text-green-900'
          }`}>
            Your website URL:
          </div>
          <div className="flex items-center gap-2">
            <div className={`border rounded px-3 py-2 font-mono text-xs break-all flex-1 ${
              isDarkMode 
                ? 'bg-gray-800 border-green-700 text-green-300' 
                : 'bg-white border-green-200 text-green-800'
            }`}>
              {WebsiteUtils.getWebsiteUrl()}
            </div>
            <button
              onClick={WebsiteUtils.copyWebsiteUrl}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title="Copy URL"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={WebsiteUtils.openWebsiteUrl}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
