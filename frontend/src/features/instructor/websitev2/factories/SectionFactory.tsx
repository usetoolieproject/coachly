import React from 'react';
import { getSectionConfig } from '../config/themeConfig';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useUpdateSectionData } from '../stores/pageBuilderStore';

// Import all section components
import { Hero } from '../themes/theme1/components/Hero';
import { Banner } from '../themes/theme1/components/Banner';
import { Video } from '../themes/theme1/components/Video';
import { OfferBox } from '../themes/theme1/components/OfferBox';
import { WhatsIncluded } from '../themes/theme1/components/WhatsIncluded';
import { Testimonials } from '../themes/theme1/components/Testimonials';
import { Design } from '../themes/theme1/components/Design';
import { Domain } from '../themes/theme1/components/Domain';
import { CustomSection } from '../themes/theme1/components/CustomSection';
import { About } from '../themes/theme1/components/About';
import { JoinCommunity } from '../themes/theme1/components/JoinCommunity';
import { AboutJoinCombined } from '../themes/theme1/components/AboutJoinCombined';
import { PrivacySection } from '../themes/theme1/components/PrivacySection';
import { TermsSection } from '../themes/theme1/components/TermsSection';

// Import fitness trainer components
import { FitnessHero } from '../themes/theme2/components/FitnessHero';
import { FitnessBanner } from '../themes/theme2/components/FitnessBanner';
import { TrainerAbout } from '../themes/theme2/components/TrainerAbout';
import { WorkoutPlans } from '../themes/theme2/components/WorkoutPlans';
import { TransformationGallery } from '../themes/theme2/components/TransformationGallery';
import { FitnessTestimonials } from '../themes/theme2/components/FitnessTestimonials';
import { FitnessVideo } from '../themes/theme2/components/FitnessVideo';
import { FitnessWhatsIncluded } from '../themes/theme2/components/FitnessWhatsIncluded';

// Section component registry
const sectionComponents: { [key: string]: React.ComponentType<any> } = {
  // Theme1 components (professional-coach, start-from-scratch)
  Hero,
  Banner,
  About,
  Video,
  OfferBox,
  WhatsIncluded,
  Testimonials,
  Design,
  Domain,
  CustomSection,
  JoinCommunity,
  AboutJoinCombined,
  PrivacySection,
  TermsSection,
  // Fitness Trainer components
  FitnessHero,
  FitnessBanner,
  TrainerAbout,
  WorkoutPlans,
  TransformationGallery,
  FitnessTestimonials,
  FitnessVideo,
  FitnessWhatsIncluded
};

interface SectionFactoryProps {
  themeId: string;
  sectionId: string;
  sectionData: any;
  allSectionData?: any;
  isSelected?: boolean;
  isEditable?: boolean;
  onClick?: () => void;
  className?: string;
  onHeightChange?: (height: string) => void;
  publicViewData?: {
    instructorId?: string;
    communityId?: string;
    subdomain?: string;
  };
}

export const SectionFactory: React.FC<SectionFactoryProps> = ({
  themeId,
  sectionId,
  sectionData,
  allSectionData,
  isSelected = false,
  isEditable = false,
  onClick,
  className = '',
  onHeightChange,
  publicViewData
}) => {
  const sectionConfig = getSectionConfig(themeId, sectionId);
  const updateSectionData = useUpdateSectionData();
  
  if (!sectionConfig) {
    console.warn(`Section config not found for theme: ${themeId}, section: ${sectionId}`);
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-600">Section configuration not found</p>
      </div>
    );
  }

  const SectionComponent = sectionComponents[sectionConfig.component];
  
  if (!SectionComponent) {
    console.warn(`Section component not found: ${sectionConfig.component}`);
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-600">Component not found: {sectionConfig.component}</p>
      </div>
    );
  }

  // Merge default data with provided data
  const mergedData = {
    ...sectionConfig.defaultData,
    ...sectionData
  };


  // Add selection styling
  const selectionClass = isSelected ? 'ring-2 ring-purple-400 ring-offset-2' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';

  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <p className="text-red-600">Error rendering section: {sectionId}</p>
        </div>
      }
    >
      <div 
        className={`transition-all ${selectionClass} ${clickableClass} ${className}`}
        onClick={onClick}
      >
        <SectionComponent 
          {...mergedData} 
          sectionId={sectionId}
          allSectionData={allSectionData}
          isEditable={isEditable}
          editorMode={mergedData.editorMode}
          order={sectionId === 'about-join-combined' ? (mergedData.position === 'about-left' ? 'about-first' : 'join-first') : undefined}
          onBannerClick={onClick}
          onHeightChange={sectionId === 'banner' ? onHeightChange : undefined}
          onAboutClick={sectionId === 'about-join-combined' ? () => {
            // Update editor mode to 'about'
            updateSectionData(sectionId, { editorMode: 'about' });
          } : undefined}
          onJoinClick={sectionId === 'about-join-combined' ? () => {
            // Update editor mode to 'join'
            updateSectionData(sectionId, { editorMode: 'join' });
          } : undefined}
          publicViewData={publicViewData}
        />
      </div>
    </ErrorBoundary>
  );
};

// Helper function to get all available sections for a theme
export const getAvailableSections = (_themeId: string) => {
  // TODO: Implement proper theme config access
  return [];
};

// Helper function to render multiple sections
export const renderSections = (
  themeId: string,
  sections: string[],
  sectionData: { [key: string]: any },
  selectedSection?: string,
  onSelectSection?: (sectionId: string) => void
) => {
  return sections.map(sectionId => (
    <SectionFactory
      key={sectionId}
      themeId={themeId}
      sectionId={sectionId}
      sectionData={sectionData[sectionId] || {}}
      isSelected={selectedSection === sectionId}
      onClick={() => onSelectSection?.(sectionId)}
    />
  ));
};
