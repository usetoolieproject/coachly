import React from 'react';
import { FitnessFooter } from './components/FitnessFooter';
import { SectionFactory } from '../../factories/SectionFactory';
import { useDesignColors } from '../../hooks/useDesignColors';

interface Theme2PreviewProps {
  // Section data for real-time editing
  sectionData?: {[key: string]: any};
  // Dynamic sections
  addedSections?: string[];
  selectedSection?: string;
  onSelectSection?: (sectionId: string) => void;
  onHeightChange?: (sectionId: string, height: string) => void;
  // Whether sections are editable (for builder vs public view)
  isEditable?: boolean;
  // Public view data (for payment components)
  publicViewData?: {
    instructorId?: string;
    communityId?: string;
    subdomain?: string;
  };
  // Page type for conditional rendering
  pageType?: string;
  // Modal handlers for privacy/terms
  onPrivacyClick?: () => void;
  onTermsClick?: () => void;
}

export const Theme2Preview: React.FC<Theme2PreviewProps> = ({
  sectionData = {},
  addedSections = [],
  selectedSection,
  onSelectSection,
  onHeightChange,
  isEditable = false,
  publicViewData,
  pageType = 'sales-page',
  onPrivacyClick,
  onTermsClick
}) => {
  const { darkMode } = useDesignColors({ allSectionData: sectionData });

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-orange-50'}`}>
      {/* Dynamic Sections - Fitness-Specific Layout */}
      <div className="flex flex-col">
        {addedSections.filter(sectionId => {
          // Filter sections based on page type
          if (pageType === 'privacy-policy') return sectionId === 'privacy-section';
          if (pageType === 'terms-of-service') return sectionId === 'terms-section';
          if (pageType === 'sales-page') {
            return sectionId !== 'privacy-section' && sectionId !== 'terms-section';
          }
          return true;
        }).map(sectionId => {
          const sectionDataForSection = sectionData[sectionId] || {};
          // Only hero uses full-width, banner and video should match container width
          const isFullWidth = sectionId === 'hero' || sectionDataForSection.layout === 'full';
          
          if (isFullWidth) {
            // Full width sections break out of container (only hero)
            return (
              <div key={sectionId} className="w-full">
                <SectionFactory
                  themeId="fitness-trainer"
                  sectionId={sectionId}
                  sectionData={sectionDataForSection}
                  allSectionData={sectionData}
                  isSelected={selectedSection === sectionId}
                  isEditable={isEditable}
                  onClick={() => onSelectSection?.(sectionId)}
                  onHeightChange={(height: string) => onHeightChange?.(sectionId, height)}
                  publicViewData={publicViewData}
                />
              </div>
            );
          } else {
            // All other sections (banner, video, testimonials, etc.) get container with padding
            return (
              <div key={sectionId} className="w-full px-4 py-8">
                <div className="max-w-7xl mx-auto">
                  <SectionFactory
                    themeId="fitness-trainer"
                    sectionId={sectionId}
                    sectionData={sectionDataForSection}
                    allSectionData={sectionData}
                    isSelected={selectedSection === sectionId}
                    isEditable={isEditable}
                    onClick={() => onSelectSection?.(sectionId)}
                    onHeightChange={(height: string) => onHeightChange?.(sectionId, height)}
                    publicViewData={publicViewData}
                  />
                </div>
              </div>
            );
          }
        })}
      </div>
      
      {/* Footer - Full width like hero */}
      <div className="w-full">
        <FitnessFooter 
          onPrivacyClick={onPrivacyClick} 
          onTermsClick={onTermsClick} 
          allSectionData={sectionData}
        />
      </div>
    </div>
  );
};
