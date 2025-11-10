import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface SectionData {
  [key: string]: any;
}

export interface Theme1State {
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
  initializeTheme1: () => void;
}

// Theme 1 default sections - pre-added like Theme2
const theme1DefaultSections: string[] = [
  'banner',
  'offer-box',
  'about-join-combined',
  'video',
  'whats-included',
  'testimonials'
];
const theme1DefaultData = {
  design: {
    primaryColor: '#8b5cf6',
    secondaryColor: '#3b82f6',
    darkMode: false,
    showStickyCta: true,
    showSocialProof: true
  },
  domain: {
    customDomain: '',
    subdomain: 'your-community'
  },
  banner: {
    title: 'Welcome to Our Platform',
    subtitle: 'Discover amazing content and connect with our community',
    bannerUrl: '',
    bannerHeight: '250px',
    alignment: 'center'
  },
  'offer-box': {
    title: 'Join Our Community',
    linkText: 'Already have an account? Sign in',
    communityType: 'free',
    monthlyPrice: 0
  },
  'about-join-combined': {
    aboutTitle: 'About',
    aboutDescription: 'Welcome to my learning community! Join a thriving community of learners and get access to exclusive content, direct support, and connect with fellow students on the same learning journey.',
    aboutFeatures: [
      'Comprehensive courses with lifetime access',
      'Active community with 24/7 peer support',
      'Regular live Q&A sessions and coaching calls',
      'Exclusive resources and member-only content'
    ],
    joinTitle: "Instructor's Learning Community",
    joinMembers: 1000,
    joinSupport: '24/7',
    joinCourses: 8,
    joinPrice: 0,
    joinButtonText: 'JOIN COMMUNITY',
    joinAlignment: 'left'
  },
  video: {
    title: 'Watch Our Introduction',
    videoUrl: '',
    posterUrl: '',
    height: '510px',
    layout: 'container',
    alignment: 'center'
  },
  'whats-included': {
    title: "What's Included",
    items: [
      {
        id: 'courses',
        title: 'Courses',
        description: '8 comprehensive courses',
        icon: 'courses'
      },
      {
        id: 'community',
        title: 'Community',
        description: '24/7 peer support & networking',
        icon: 'community'
      },
      {
        id: 'sessions',
        title: 'Live Sessions',
        description: 'Regular Q&A and coaching',
        icon: 'sessions'
      }
    ],
    alignment: 'left',
    showCourses: true,
    showCommunity: true,
    showSessions: true
  },
  testimonials: {
    title: 'What Our Students Say',
    testimonials: [
      {
        id: '1',
        studentName: 'Sarah M.',
        quote: 'This platform has transformed my learning journey. The support and resources are incredible!'
      },
      {
        id: '2',
        studentName: 'Mike T.',
        quote: 'Best investment I\'ve made in my education. The courses are top-notch and the community is amazing.'
      },
      {
        id: '3',
        studentName: 'Emma L.',
        quote: 'I\'ve learned more here in 3 months than I did in years of self-study. Highly recommended!'
      }
    ],
    alignment: 'center'
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

export const useTheme1Store = create<Theme1State>()(
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
        }, false, 'theme1:addSection');
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
        }, false, 'theme1:removeSection');
      },
      
      setSelectedSection: (sectionId: string | null) => {
        set({ selectedSection: sectionId }, false, 'theme1:setSelectedSection');
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
        }), false, 'theme1:updateSectionData');
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
        }, false, 'theme1:setSelectedPageType');
      },
      
      setIsMobileView: (isMobile: boolean) => {
        set({ isMobileView: isMobile }, false, 'theme1:setIsMobileView');
      },
      
      setIsSaving: (saving: boolean) => {
        set({ isSaving: saving }, false, 'theme1:setIsSaving');
      },
      
      setIsPublishing: (publishing: boolean) => {
        set({ isPublishing: publishing }, false, 'theme1:setIsPublishing');
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
        }, false, 'theme1:reorderSections');
      },
      
      resetBuilder: () => {
        set({ ...initialState, isInitialized: false }, false, 'theme1:resetBuilder');
      },
      
      loadTemplate: (template: { sections: string[]; data: SectionData }) => {
        set({
          addedSections: template.sections,
          sectionData: template.data,
          selectedSection: template.sections[0] || null,
        }, false, 'theme1:loadTemplate');
      },
      
      initializeTheme1: () => {
        set((state) => {
          if (state.isInitialized) {
            return state;
          }
          return {
            addedSections: theme1DefaultSections,
            sectionData: theme1DefaultData,
            selectedSection: theme1DefaultSections[0] || null,
            salesPageSections: theme1DefaultSections,
            isInitialized: true,
          };
        }, false, 'theme1:initializeTheme1');
      },
    }),
    {
      name: 'theme1-store',
    }
  )
);

// Selectors for better performance
export const useTheme1SectionData = (sectionId: string) => 
  useTheme1Store((state) => state.sectionData[sectionId] || {});

export const useIsTheme1SectionSelected = (sectionId: string) =>
  useTheme1Store((state) => state.selectedSection === sectionId);
