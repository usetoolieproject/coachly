import { useMemo } from 'react';
import { usePageBuilderStore } from './pageBuilderStore';
import { useTheme1Store } from './theme1Store';
import { useStartFromScratchStore } from './startFromScratchStore';

/**
 * Hook to get the appropriate store based on currently selected theme
 */
export const useCurrentStore = () => {
  const selectedTheme = usePageBuilderStore((state) => state.selectedTheme);
  
  const theme1Store = useTheme1Store();
  const startFromScratchStore = useStartFromScratchStore();
  
  return useMemo(() => {
    if (selectedTheme === 'professional-coach') {
      return theme1Store;
    } else if (selectedTheme === 'start-from-scratch') {
      return startFromScratchStore;
    }
    return theme1Store; // Default fallback
  }, [selectedTheme, theme1Store, startFromScratchStore]);
};
