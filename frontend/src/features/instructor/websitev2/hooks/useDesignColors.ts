import { usePageBuilderStoreState } from '../stores/pageBuilderStore';

interface UseDesignColorsProps {
  allSectionData?: any;
}

export const useDesignColors = (props?: UseDesignColorsProps) => {
  const { sectionData: storeSectionData } = usePageBuilderStoreState();
  
  // Use provided section data if available (for public view), otherwise use store
  const sectionData = props?.allSectionData || storeSectionData;
  
  const designData = sectionData?.design || {};
  
  return {
    primaryColor: designData.primaryColor || '#8b5cf6',
    secondaryColor: designData.secondaryColor || '#3b82f6',
    darkMode: designData.darkMode || false
  };
};