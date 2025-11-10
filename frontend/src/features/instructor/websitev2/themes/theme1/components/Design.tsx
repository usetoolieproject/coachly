import React from 'react';

interface DesignProps {
  primaryColor?: string;
  secondaryColor?: string;
  darkMode?: boolean;
  padding?: number;
}

export const Design: React.FC<DesignProps> = ({
  primaryColor = '#8b5cf6',
  secondaryColor = '#3b82f6',
  darkMode = false,
  padding = 4
}) => {
  return (
    <div 
      className={`rounded-xl shadow-sm border p-6 ${
        darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
      }`}
      style={{ padding: `${padding * 0.25}rem` }}
    >
      <h2 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Design System
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Color Preview */}
        <div className="text-center">
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Primary Color</h3>
          <div 
            className="w-24 h-24 rounded-lg mx-auto mb-4 shadow-lg"
            style={{ backgroundColor: primaryColor }}
          />
          <p className={`text-sm font-mono ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{primaryColor}</p>
        </div>

        {/* Secondary Color Preview */}
        <div className="text-center">
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Secondary Color</h3>
          <div 
            className="w-24 h-24 rounded-lg mx-auto mb-4 shadow-lg"
            style={{ backgroundColor: secondaryColor }}
          />
          <p className={`text-sm font-mono ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{secondaryColor}</p>
        </div>
      </div>

      {/* Color Usage Examples */}
      <div className="mt-8">
        <h3 className={`text-lg font-semibold mb-4 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>Color Usage Examples</h3>
        <div className="space-y-4">
          {/* Button Examples */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              className="px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: primaryColor }}
            >
              Primary Button
            </button>
            <button 
              className="px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: secondaryColor }}
            >
              Secondary Button
            </button>
          </div>

          {/* Banner Example */}
          <div 
            className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: primaryColor }}
          >
            Banner Background
          </div>
        </div>
      </div>
    </div>
  );
};
