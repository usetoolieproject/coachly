import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface SectionData {
  [key: string]: any;
}

export interface StartFromScratchState {
  // Core state
  addedSections: string[];
  selectedSection: string | null;
  sectionData: SectionData;
  selectedPageType: string;
  salesPageSections: string[];
  
  // UI state
  isMobileView: boolean;
  isInitialized: boolean;
  isPublished: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  
  // Actions
  addSection: (sectionId: string) => void;
  removeSection: (sectionId: string) => void;
  setSelectedSection: (sectionId: string | null) => void;
  updateSectionData: (sectionId: string, data: any) => void;
  setSelectedPageType: (pageType: string) => void;
  setIsMobileView: (isMobile: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setIsPublishing: (publishing: boolean) => void;
  reorderSections: (startIndex: number, endIndex: number) => void;
  resetBuilder: () => void;
  loadTemplate: (template: { sections: string[]; data: SectionData }) => void;
  initializeStartFromScratch: () => void;
}

// Start from Scratch default configuration - EMPTY (user adds sections manually)
const startFromScratchDefaultSections: string[] = [];
const startFromScratchDefaultData = {
  design: {
    primaryColor: '#8b5cf6',
    secondaryColor: '#3b82f6',
    darkMode: false
  },
  domain: {
    customDomain: '',
    subdomain: 'your-community'
  }
};

const initialState = {
  addedSections: [],
  selectedSection: null,
  sectionData: {},
  selectedPageType: 'sales-page',
  salesPageSections: [],
  isMobileView: false,
  isInitialized: false,
  isPublished: false,
  isSaving: false,
  isPublishing: false,
};

export const useStartFromScratchStore = create<StartFromScratchState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      addSection: (sectionId: string) => {
        set((state) => {
          if (!state.addedSections.includes(sectionId)) {
            const newAddedSections = [...state.addedSections, sectionId];
            
            const updates: any = {
              addedSections: newAddedSections,
              selectedSection: sectionId,
            };
            
            if (state.selectedPageType === 'sales-page') {
              updates.salesPageSections = newAddedSections;
            }
            
            return updates;
          }
          return state;
        }, false, 'start-from-scratch:addSection');
      },
      
      removeSection: (sectionId: string) => {
        set((state) => {
          const newSections = state.addedSections.filter(id => id !== sectionId);
          const newSectionData = { ...state.sectionData };
          delete newSectionData[sectionId];
          
          const updates: any = {
            addedSections: newSections,
            sectionData: newSectionData,
            selectedSection: state.selectedSection === sectionId ? null : state.selectedSection,
          };
          
          if (state.selectedPageType === 'sales-page') {
            updates.salesPageSections = newSections;
          }
          
          return updates;
        }, false, 'start-from-scratch:removeSection');
      },
      
      setSelectedSection: (sectionId: string | null) => {
        set({ selectedSection: sectionId }, false, 'start-from-scratch:setSelectedSection');
      },
      
      updateSectionData: (sectionId: string, data: any) => {
        if (!sectionId) {
          console.warn('updateSectionData: sectionId is required');
          return;
        }
        if (!data || typeof data !== 'object') {
          console.warn('updateSectionData: data must be an object');
          return;
        }
        
        set((state) => ({
          sectionData: {
            ...state.sectionData,
            [sectionId]: {
              ...state.sectionData[sectionId],
              ...data,
            },
          },
        }), false, 'start-from-scratch:updateSectionData');
      },
      
      setSelectedPageType: (pageType: string) => {
        set((state) => {
          let newAddedSections = state.addedSections;
          let newSelectedSection = state.selectedSection;
          
          if (state.selectedPageType === 'sales-page') {
            newAddedSections = state.addedSections;
          }
          
          if (pageType === 'privacy-policy') {
            newAddedSections = ['privacy-section'];
            newSelectedSection = 'privacy-section';
          } else if (pageType === 'terms-of-service') {
            newAddedSections = ['terms-section'];
            newSelectedSection = 'terms-section';
          } else if (pageType === 'sales-page') {
            newAddedSections = state.salesPageSections.length > 0 ? state.salesPageSections : state.addedSections;
            newSelectedSection = newAddedSections[0] || null;
          }
          
          const updates: any = {
            selectedPageType: pageType,
            addedSections: newAddedSections,
            selectedSection: newSelectedSection
          };
          
          if (state.selectedPageType === 'sales-page' && pageType !== 'sales-page') {
            updates.salesPageSections = state.addedSections;
          }
          
          return updates;
        }, false, 'start-from-scratch:setSelectedPageType');
      },
      
      setIsMobileView: (isMobile: boolean) => {
        set({ isMobileView: isMobile }, false, 'start-from-scratch:setIsMobileView');
      },
      
      setIsSaving: (saving: boolean) => {
        set({ isSaving: saving }, false, 'start-from-scratch:setIsSaving');
      },
      
      setIsPublishing: (publishing: boolean) => {
        set({ isPublishing: publishing }, false, 'start-from-scratch:setIsPublishing');
      },
      
      reorderSections: (startIndex: number, endIndex: number) => {
        set((state) => {
          const newSections = [...state.addedSections];
          const [removed] = newSections.splice(startIndex, 1);
          newSections.splice(endIndex, 0, removed);
          
          const updates: any = {
            addedSections: newSections,
          };
          
          if (state.selectedPageType === 'sales-page') {
            updates.salesPageSections = newSections;
          }
          
          return updates;
        }, false, 'start-from-scratch:reorderSections');
      },
      
      resetBuilder: () => {
        set({ ...initialState, isInitialized: false }, false, 'start-from-scratch:resetBuilder');
      },
      
      loadTemplate: (template: { sections: string[]; data: SectionData }) => {
        set({
          addedSections: template.sections,
          sectionData: template.data,
          selectedSection: template.sections[0] || null,
        }, false, 'start-from-scratch:loadTemplate');
      },
      
      initializeStartFromScratch: () => {
        set((state) => {
          if (state.isInitialized) {
            return state;
          }
          return {
            addedSections: startFromScratchDefaultSections,
            sectionData: startFromScratchDefaultData,
            selectedSection: null,
            salesPageSections: startFromScratchDefaultSections,
            isInitialized: true,
          };
        }, false, 'start-from-scratch:initializeStartFromScratch');
      },
    }),
    {
      name: 'start-from-scratch-store',
    }
  )
);

// Selectors for better performance
export const useStartFromScratchSectionData = (sectionId: string) => 
  useStartFromScratchStore((state) => state.sectionData[sectionId] || {});

export const useIsStartFromScratchSectionSelected = (sectionId: string) =>
  useStartFromScratchStore((state) => state.selectedSection === sectionId);
