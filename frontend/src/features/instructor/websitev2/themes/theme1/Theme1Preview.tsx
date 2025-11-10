import React from 'react';
import { 
  Footer 
} from './components';
import { SectionFactory } from '../../factories/SectionFactory';
import { useDesignColors } from '../../hooks/useDesignColors';
import { StickyCTA } from '../../components/StickyCTA';

interface Theme1PreviewProps {
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

export const Theme1Preview: React.FC<Theme1PreviewProps> = ({
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
  const { darkMode, primaryColor } = useDesignColors({ allSectionData: sectionData });
  const showSticky = !isEditable && (sectionData?.design?.showStickyCta !== false);

  // Convert hex color to rgba string for gradient background
  const hexToRgba = (hex: string, alpha: number) => {
    const h = hex.replace('#', '');
    const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Dynamic Sections - Group regular sections inside a bordered container */}
      <div className="flex flex-col">
        {(() => {
          const fullWidthBlocks: React.ReactNode[] = [];
          const beforeGroupBlocks: React.ReactNode[] = [];
          const groupedBlocks: React.ReactNode[] = [];
          const afterGroupBlocks: React.ReactNode[] = [];

          const visibleIds = addedSections.filter(sectionId => {
            if (pageType === 'privacy-policy') return sectionId === 'privacy-section';
            if (pageType === 'terms-of-service') return sectionId === 'terms-section';
            if (pageType === 'sales-page') return sectionId !== 'privacy-section' && sectionId !== 'terms-section';
            return true;
          });

          let inGroup = false;
          let endedGroup = false;
          for (const sectionId of visibleIds) {
            const sectionDataForSection = sectionData[sectionId] || {};
            const effectiveLayout = sectionId === 'video' ? 'container' : sectionDataForSection.layout;
            const isFullWidth = effectiveLayout === 'full' || sectionId === 'banner';
            const node = (
              <div key={sectionId} className="w-full px-2 md:px-3 pt-0 pb-4 md:pb-5">
                <div className="max-w-[1120px] mx-auto">
                  <SectionFactory
                    themeId="professional-coach"
                    sectionId={sectionId}
                    sectionData={sectionDataForSection}
                    allSectionData={sectionData}
                    isSelected={selectedSection === sectionId}
                    onClick={() => onSelectSection?.(sectionId)}
                    onHeightChange={(height: string) => onHeightChange?.(sectionId, height)}
                    publicViewData={publicViewData}
                  />
                </div>
              </div>
            );
            if (isFullWidth) fullWidthBlocks.push(
              <div key={`fw-${sectionId}`} className="w-full">
                <SectionFactory
                  themeId="professional-coach"
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
            ); else {
              if (sectionId === 'about-join-combined') inGroup = true;
              if (!inGroup) {
                beforeGroupBlocks.push(node);
              } else if (!endedGroup) {
                groupedBlocks.push(node);
                if (sectionId === 'testimonials') endedGroup = true;
              } else {
                afterGroupBlocks.push(node);
              }
            }
          }

          return (
            <>
              {fullWidthBlocks}
              {beforeGroupBlocks}
              {groupedBlocks.length > 0 && (
                <div
                  className="max-w-[1140px] mx-auto mt-0 pt-0 rounded-2xl px-[15px]"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, ${hexToRgba(primaryColor, darkMode ? 0.16 : 0.08)} 0%, ${hexToRgba(primaryColor, 0)} 100%)`
                  }}
                >
                   {groupedBlocks}
                </div>
              )}
              {afterGroupBlocks}
            </>
          );
        })()}
      </div>
      
      {/* Footer */}
      <div className="w-full px-4 md:px-6 py-4">
        <div className="max-w-[1120px] mx-auto">
          <Footer 
            onPrivacyClick={onPrivacyClick} 
            onTermsClick={onTermsClick} 
            allSectionData={sectionData}
          />
        </div>
      </div>

      {showSticky && (
        <StickyCTA />
      )}
    </div>
  );
};
