import React from 'react';
import { 
  Footer 
} from '../theme1/components';
import { SectionFactory } from '../../factories/SectionFactory';
import { useDesignColors } from '../../hooks/useDesignColors';

interface StartFromScratchPreviewProps {
  // Section data for real-time editing
  sectionData?: {[key: string]: any};
  // Dynamic sections
  addedSections?: string[];
  selectedSection?: string;
  onSelectSection?: (sectionId: string) => void;
  onHeightChange?: (sectionId: string, height: string) => void;
  // Whether sections are editable (for builder vs public view)
  isEditable?: boolean;
}

export const StartFromScratchPreview: React.FC<StartFromScratchPreviewProps> = ({
  sectionData = {},
  addedSections = [],
  selectedSection,
  onSelectSection,
  onHeightChange,
  isEditable = false
}) => {
  const { darkMode } = useDesignColors({ allSectionData: sectionData });

  // Show empty state when no sections
  if (addedSections.length === 0) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center max-w-md px-4">
          <div className={`w-20 h-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
            <svg className={`w-10 h-10 ${darkMode ? 'text-gray-400' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
            Start Building
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Your canvas is blank. Add sections from the sidebar to start creating your website.
          </p>
          <div className={`flex flex-wrap justify-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'} text-xs`}>
            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-full">Banner</span>
            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-full">Offer Box</span>
            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-full">About</span>
            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-full">Video</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Dynamic Sections - Full Width Support */}
      <div className="flex flex-col">
        {addedSections.map(sectionId => {
          const sectionDataForSection = sectionData[sectionId] || {};
          // Force video section to use container layout
          const effectiveLayout = sectionId === 'video' ? 'container' : sectionDataForSection.layout;
          const isFullWidth = effectiveLayout === 'full' || sectionId === 'banner';
          
          if (isFullWidth) {
            // Full width sections (like banner) break out of container
            return (
              <div key={sectionId} className="w-full">
                <SectionFactory
                  themeId="start-from-scratch"
                  sectionId={sectionId}
                  sectionData={sectionDataForSection}
                  allSectionData={sectionData}
                  isSelected={selectedSection === sectionId}
                  isEditable={isEditable}
                  onClick={() => onSelectSection?.(sectionId)}
                  onHeightChange={(height: string) => onHeightChange?.(sectionId, height)}
                />
              </div>
            );
          } else {
            // All regular sections get the same wide container with consistent padding
            return (
              <div key={sectionId} className="w-full px-4 py-6">
                <div className="max-w-6xl mx-auto">
                  <SectionFactory
                    themeId="start-from-scratch"
                    sectionId={sectionId}
                    sectionData={sectionDataForSection}
                    allSectionData={sectionData}
                    isSelected={selectedSection === sectionId}
                    isEditable={isEditable}
                    onClick={() => onSelectSection?.(sectionId)}
                    onHeightChange={(height: string) => onHeightChange?.(sectionId, height)}
                  />
                </div>
              </div>
            );
          }
        })}
      </div>
      
      {/* Footer */}
      <div className="w-full px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
};
