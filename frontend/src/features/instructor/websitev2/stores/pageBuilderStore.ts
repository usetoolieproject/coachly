import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { websiteService, WebsiteConfiguration } from '../../../../services/websiteService';
import { useTheme1Store } from './theme1Store';
import { useStartFromScratchStore } from './startFromScratchStore';
import { useFitnessTrainerStore } from './fitnessTrainerStore';

export interface SectionData {
  [key: string]: any;
}

export interface PageBuilderState {
  // Core state - only selectedTheme is managed here
  selectedTheme: string;
  
  // UI state for save/publish buttons
  isSaving: boolean;
  isPublishing: boolean;
  
  // Actions
  setSelectedTheme: (theme: string) => void;
  
  // Save/Load actions - these route to appropriate theme store
  saveWebsiteConfiguration: () => Promise<boolean>;
  loadWebsiteConfiguration: () => Promise<boolean>;
  publishWebsite: () => Promise<boolean>;
  unpublishWebsite: () => Promise<boolean>;
}

const initialState = {
  selectedTheme: 'professional-coach',
  isSaving: false,
  isPublishing: false,
};

export const usePageBuilderStore = create<PageBuilderState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setSelectedTheme: (theme: string) => {
        set({ 
          selectedTheme: theme,
        }, false, 'setSelectedTheme');
      },
      
      // Save website configuration to user account
      saveWebsiteConfiguration: async () => {
        
        const currentState = get();
        
        // Set saving state on the appropriate theme store
        if (currentState.selectedTheme === 'professional-coach') {
          useTheme1Store.setState({ isSaving: true });
        } else if (currentState.selectedTheme === 'fitness-trainer') {
          useFitnessTrainerStore.setState({ isSaving: true });
        } else {
          useStartFromScratchStore.setState({ isSaving: true });
        }
        
        try {
          const currentState = get();
          const theme1Store = useTheme1Store.getState();
          const startFromScratchStore = useStartFromScratchStore.getState();
          const fitnessTrainerStore = useFitnessTrainerStore.getState();
          
          // Get data from appropriate store
          let storeState;
          if (currentState.selectedTheme === 'professional-coach') {
            storeState = theme1Store;
          } else if (currentState.selectedTheme === 'fitness-trainer') {
            storeState = fitnessTrainerStore;
          } else {
            storeState = startFromScratchStore;
          }
          
          
          const config: WebsiteConfiguration = {
            themeId: currentState.selectedTheme,
            addedSections: storeState.addedSections,
            sectionData: storeState.sectionData,
            selectedPageType: storeState.selectedPageType,
            isMobileView: storeState.isMobileView,
            isPublished: false, // ALWAYS false for Save button - draft mode only
          };
          
          
          const result = await websiteService.saveWebsiteConfiguration(config);
          
          // Reset saving state on the appropriate theme store
          if (currentState.selectedTheme === 'professional-coach') {
            useTheme1Store.setState({ isSaving: false });
          } else if (currentState.selectedTheme === 'fitness-trainer') {
            useFitnessTrainerStore.setState({ isSaving: false });
          } else {
            useStartFromScratchStore.setState({ isSaving: false });
          }
          
          set({ isSaving: false }, false, 'setIsSaving');
          
          return result.success;
        } catch (error) {
          
          
          // Reset saving state on the appropriate theme store
          const currentState = get();
          if (currentState.selectedTheme === 'professional-coach') {
            useTheme1Store.setState({ isSaving: false });
          } else if (currentState.selectedTheme === 'fitness-trainer') {
            useFitnessTrainerStore.setState({ isSaving: false });
          } else {
            useStartFromScratchStore.setState({ isSaving: false });
          }
          
          set({ isSaving: false }, false, 'setIsSaving');
          return false;
        }
      },
      
      // Load website configuration from user account
      loadWebsiteConfiguration: async () => {
        try {
          const currentState = get();
          // Load configuration for the currently selected theme
          const config = await websiteService.loadWebsiteConfiguration(currentState.selectedTheme);
          if (config) {
            // Route to appropriate store
            if (config.themeId === 'professional-coach') {
              useTheme1Store.setState({
                addedSections: config.addedSections,
                sectionData: config.sectionData,
                selectedPageType: config.selectedPageType,
                isMobileView: config.isMobileView,
                isPublished: config.isPublished || false,
                salesPageSections: config.addedSections,
                isInitialized: true,
              });
            } else if (config.themeId === 'fitness-trainer') {
              useFitnessTrainerStore.setState({
                addedSections: config.addedSections,
                sectionData: config.sectionData,
                selectedPageType: config.selectedPageType,
                isMobileView: config.isMobileView,
                isPublished: config.isPublished || false,
                salesPageSections: config.addedSections,
                isInitialized: true,
              });
            } else if (config.themeId === 'start-from-scratch') {
              useStartFromScratchStore.setState({
              addedSections: config.addedSections,
              sectionData: config.sectionData,
              selectedPageType: config.selectedPageType,
              isMobileView: config.isMobileView,
              isPublished: config.isPublished || false,
                salesPageSections: config.addedSections,
              isInitialized: true,
              });
            }
            
            set({ selectedTheme: config.themeId }, false, 'loadWebsiteConfiguration');
            return true;
          }
          return false;
        } catch (error) {
          return false;
        }
      },
      
      // Publish website
      publishWebsite: async () => {
        
        const currentState = get();
        
        // Set publishing state on the appropriate theme store
        if (currentState.selectedTheme === 'professional-coach') {
          useTheme1Store.setState({ isPublishing: true });
        } else if (currentState.selectedTheme === 'fitness-trainer') {
          useFitnessTrainerStore.setState({ isPublishing: true });
        } else {
          useStartFromScratchStore.setState({ isPublishing: true });
        }
        
        set({ isPublishing: true }, false, 'setIsPublishing');
        try {
          const currentState = get();
          const theme1Store = useTheme1Store.getState();
          const startFromScratchStore = useStartFromScratchStore.getState();
          const fitnessTrainerStore = useFitnessTrainerStore.getState();
          
          // Get data from appropriate store
          let storeState;
          if (currentState.selectedTheme === 'professional-coach') {
            storeState = theme1Store;
          } else if (currentState.selectedTheme === 'fitness-trainer') {
            storeState = fitnessTrainerStore;
          } else {
            storeState = startFromScratchStore;
          }
          
          // [Publish DEBUG] log removed.
          const config: WebsiteConfiguration = {
            themeId: currentState.selectedTheme,
            addedSections: storeState.addedSections,
            sectionData: storeState.sectionData,
            selectedPageType: storeState.selectedPageType,
            isMobileView: storeState.isMobileView,
            isPublished: true,
          };
          
          
          const result = await websiteService.saveWebsiteConfiguration(config);
          if (result.success) {
            // Update the theme-specific store
            if (currentState.selectedTheme === 'professional-coach') {
              useTheme1Store.setState({ isPublished: true, isPublishing: false });
            } else if (currentState.selectedTheme === 'fitness-trainer') {
              useFitnessTrainerStore.setState({ isPublished: true, isPublishing: false });
            } else {
              useStartFromScratchStore.setState({ isPublished: true, isPublishing: false });
            }
            
            set({ isPublishing: false }, false, 'publishWebsite');
            
            return true;
          }
          
          // Reset publishing state on failure
          if (currentState.selectedTheme === 'professional-coach') {
            useTheme1Store.setState({ isPublishing: false });
          } else if (currentState.selectedTheme === 'fitness-trainer') {
            useFitnessTrainerStore.setState({ isPublishing: false });
          } else {
            useStartFromScratchStore.setState({ isPublishing: false });
          }
          
          set({ isPublishing: false }, false, 'setIsPublishing');
          
          return false;
        } catch (error) {
          
          
          // Reset publishing state on error
          const currentState = get();
          if (currentState.selectedTheme === 'professional-coach') {
            useTheme1Store.setState({ isPublishing: false });
          } else if (currentState.selectedTheme === 'fitness-trainer') {
            useFitnessTrainerStore.setState({ isPublishing: false });
          } else {
            useStartFromScratchStore.setState({ isPublishing: false });
          }
          
          set({ isPublishing: false }, false, 'setIsPublishing');
          return false;
        }
      },

      unpublishWebsite: async () => {
        console.log('[pageBuilderStore] Starting unpublish...');
        const currentState = get();
        console.log('[pageBuilderStore] Current theme:', currentState.selectedTheme);
        
        // Set publishing state (reuse isPublishing for unpublishing)
        if (currentState.selectedTheme === 'professional-coach') {
          useTheme1Store.setState({ isPublishing: true });
        } else if (currentState.selectedTheme === 'fitness-trainer') {
          useFitnessTrainerStore.setState({ isPublishing: true });
        } else {
          useStartFromScratchStore.setState({ isPublishing: true });
        }
        
        set({ isPublishing: true }, false, 'setIsPublishing');
        try {
          const theme1Store = useTheme1Store.getState();
          const startFromScratchStore = useStartFromScratchStore.getState();
          const fitnessTrainerStore = useFitnessTrainerStore.getState();
          
          // Get data from appropriate store
          let storeState;
          if (currentState.selectedTheme === 'professional-coach') {
            storeState = theme1Store;
          } else if (currentState.selectedTheme === 'fitness-trainer') {
            storeState = fitnessTrainerStore;
          } else {
            storeState = startFromScratchStore;
          }
          
          // Save configuration with isPublished = false
          const config: WebsiteConfiguration = {
            themeId: currentState.selectedTheme,
            addedSections: storeState.addedSections,
            sectionData: storeState.sectionData,
            selectedPageType: storeState.selectedPageType,
            isMobileView: storeState.isMobileView,
            isPublished: false, // Set to false to unpublish
          };
          
          console.log('[pageBuilderStore] Sending unpublish config:', config);
          const result = await websiteService.saveWebsiteConfiguration(config);
          console.log('[pageBuilderStore] Unpublish API result:', result);
          if (result.success) {
            console.log('[pageBuilderStore] Unpublish successful, updating store...');
            // Update the theme-specific store
            if (currentState.selectedTheme === 'professional-coach') {
              useTheme1Store.setState({ isPublished: false, isPublishing: false });
            } else if (currentState.selectedTheme === 'fitness-trainer') {
              useFitnessTrainerStore.setState({ isPublished: false, isPublishing: false });
            } else {
              useStartFromScratchStore.setState({ isPublished: false, isPublishing: false });
            }
            
            set({ isPublishing: false }, false, 'unpublishWebsite');
            console.log('[pageBuilderStore] Store updated, unpublish complete');
            
            return true;
          }
          
          console.error('[pageBuilderStore] Unpublish failed, result:', result);
          
          // Reset publishing state on failure
          if (currentState.selectedTheme === 'professional-coach') {
            useTheme1Store.setState({ isPublishing: false });
          } else if (currentState.selectedTheme === 'fitness-trainer') {
            useFitnessTrainerStore.setState({ isPublishing: false });
          } else {
            useStartFromScratchStore.setState({ isPublishing: false });
          }
          
          set({ isPublishing: false }, false, 'setIsPublishing');
          
          return false;
        } catch (error) {
          console.error('[pageBuilderStore] Unpublish error:', error);
          // Reset publishing state on error
          const currentState = get();
          if (currentState.selectedTheme === 'professional-coach') {
            useTheme1Store.setState({ isPublishing: false });
          } else if (currentState.selectedTheme === 'fitness-trainer') {
            useFitnessTrainerStore.setState({ isPublishing: false });
          } else {
            useStartFromScratchStore.setState({ isPublishing: false });
          }
          
          set({ isPublishing: false }, false, 'setIsPublishing');
          return false;
        }
      },
    }),
    {
      name: 'page-builder-store',
    }
  )
);

// Re-export theme-specific stores
export { useTheme1Store } from './theme1Store';
export { useStartFromScratchStore } from './startFromScratchStore';
export { useFitnessTrainerStore } from './fitnessTrainerStore';

// Re-export theme-specific actions
export const useUpdateSectionData = () => {
  const selectedTheme = usePageBuilderStore((state) => state.selectedTheme);
  const theme1Store = useTheme1Store();
  const startFromScratchStore = useStartFromScratchStore();
  const fitnessTrainerStore = useFitnessTrainerStore();
  
  if (selectedTheme === 'professional-coach') {
    return theme1Store.updateSectionData;
  } else if (selectedTheme === 'fitness-trainer') {
    return fitnessTrainerStore.updateSectionData;
  } else {
    return startFromScratchStore.updateSectionData;
  }
};

export const useAddSection = () => {
  const selectedTheme = usePageBuilderStore((state) => state.selectedTheme);
  const theme1Store = useTheme1Store();
  const startFromScratchStore = useStartFromScratchStore();
  const fitnessTrainerStore = useFitnessTrainerStore();
  
  if (selectedTheme === 'professional-coach') {
    return theme1Store.addSection;
  } else if (selectedTheme === 'fitness-trainer') {
    return fitnessTrainerStore.addSection;
  } else {
    return startFromScratchStore.addSection;
  }
};

export const useRemoveSection = () => {
  const selectedTheme = usePageBuilderStore((state) => state.selectedTheme);
  const theme1Store = useTheme1Store();
  const startFromScratchStore = useStartFromScratchStore();
  const fitnessTrainerStore = useFitnessTrainerStore();
  
  if (selectedTheme === 'professional-coach') {
    return theme1Store.removeSection;
  } else if (selectedTheme === 'fitness-trainer') {
    return fitnessTrainerStore.removeSection;
  } else {
    return startFromScratchStore.removeSection;
  }
};

export const useSetSelectedSection = () => {
  const selectedTheme = usePageBuilderStore((state) => state.selectedTheme);
  const theme1Store = useTheme1Store();
  const startFromScratchStore = useStartFromScratchStore();
  const fitnessTrainerStore = useFitnessTrainerStore();
  
  if (selectedTheme === 'professional-coach') {
    return theme1Store.setSelectedSection;
  } else if (selectedTheme === 'fitness-trainer') {
    return fitnessTrainerStore.setSelectedSection;
  } else {
    return startFromScratchStore.setSelectedSection;
  }
};

export const useSetSelectedPageType = () => {
  const selectedTheme = usePageBuilderStore((state) => state.selectedTheme);
  const theme1Store = useTheme1Store();
  const startFromScratchStore = useStartFromScratchStore();
  const fitnessTrainerStore = useFitnessTrainerStore();
  
  if (selectedTheme === 'professional-coach') {
    return theme1Store.setSelectedPageType;
  } else if (selectedTheme === 'fitness-trainer') {
    return fitnessTrainerStore.setSelectedPageType;
  } else {
    return startFromScratchStore.setSelectedPageType;
  }
};

export const useSetIsMobileView = () => {
  const selectedTheme = usePageBuilderStore((state) => state.selectedTheme);
  const theme1Store = useTheme1Store();
  const startFromScratchStore = useStartFromScratchStore();
  const fitnessTrainerStore = useFitnessTrainerStore();
  
  if (selectedTheme === 'professional-coach') {
    return theme1Store.setIsMobileView;
  } else if (selectedTheme === 'fitness-trainer') {
    return fitnessTrainerStore.setIsMobileView;
  } else {
    return startFromScratchStore.setIsMobileView;
  }
};

export const useReorderSections = () => {
  const selectedTheme = usePageBuilderStore((state) => state.selectedTheme);
  const theme1Store = useTheme1Store();
  const startFromScratchStore = useStartFromScratchStore();
  const fitnessTrainerStore = useFitnessTrainerStore();
  
  if (selectedTheme === 'professional-coach') {
    return theme1Store.reorderSections;
  } else if (selectedTheme === 'fitness-trainer') {
    return fitnessTrainerStore.reorderSections;
  } else {
    return startFromScratchStore.reorderSections;
  }
};

export const useResetBuilder = () => {
  const selectedTheme = usePageBuilderStore((state) => state.selectedTheme);
  const theme1Store = useTheme1Store();
  const startFromScratchStore = useStartFromScratchStore();
  const fitnessTrainerStore = useFitnessTrainerStore();
  
  if (selectedTheme === 'professional-coach') {
    return theme1Store.resetBuilder;
  } else if (selectedTheme === 'fitness-trainer') {
    return fitnessTrainerStore.resetBuilder;
  } else {
    return startFromScratchStore.resetBuilder;
  }
};

export const useLoadTemplate = () => {
  const selectedTheme = usePageBuilderStore((state) => state.selectedTheme);
  const theme1Store = useTheme1Store();
  const startFromScratchStore = useStartFromScratchStore();
  const fitnessTrainerStore = useFitnessTrainerStore();
  
  if (selectedTheme === 'professional-coach') {
    return theme1Store.loadTemplate;
  } else if (selectedTheme === 'fitness-trainer') {
    return fitnessTrainerStore.loadTemplate;
  } else {
    return startFromScratchStore.loadTemplate;
  }
};

export const useInitializeTheme1 = () => useTheme1Store((state) => state.initializeTheme1);
export const useInitializeStartFromScratch = () => useStartFromScratchStore((state) => state.initializeStartFromScratch);
export const useInitializeFitnessTrainer = () => useFitnessTrainerStore((state) => state.initializeFitnessTrainer);

// Wrapper hook for components that need access to current store state
export const usePageBuilderStoreState = () => {
  const selectedTheme = usePageBuilderStore((state) => state.selectedTheme);
  const theme1Store = useTheme1Store();
  const startFromScratchStore = useStartFromScratchStore();
  const fitnessTrainerStore = useFitnessTrainerStore();
  
  let currentStore;
  if (selectedTheme === 'professional-coach') {
    currentStore = theme1Store;
  } else if (selectedTheme === 'fitness-trainer') {
    currentStore = fitnessTrainerStore;
  } else {
    currentStore = startFromScratchStore;
  }
  
  return {
    ...currentStore,
    selectedTheme,
  };
};

// Re-export main store actions
export const useSetSelectedTheme = () => usePageBuilderStore((state) => state.setSelectedTheme);
export const useSaveWebsiteConfiguration = () => usePageBuilderStore((state) => state.saveWebsiteConfiguration);
export const useLoadWebsiteConfiguration = () => usePageBuilderStore((state) => state.loadWebsiteConfiguration);
export const usePublishWebsite = () => usePageBuilderStore((state) => state.publishWebsite);
export const useUnpublishWebsite = () => usePageBuilderStore((state) => state.unpublishWebsite);
export const useIsSaving = () => usePageBuilderStore((state) => state.isSaving);
export const useIsPublishing = () => usePageBuilderStore((state) => state.isPublishing);
export const useSelectedTheme = () => usePageBuilderStore((state) => state.selectedTheme);
