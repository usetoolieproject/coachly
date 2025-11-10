import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface SectionData {
  [key: string]: any;
}

export interface FitnessTrainerState {
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
  initializeFitnessTrainer: () => void;
}

// Fitness Trainer default configuration - ALL SECTIONS ADDED (like theme1)
const fitnessTrainerDefaultSections: string[] = [
  'hero',
  'banner',
  'trainer-about',
  'workout-plans',
  'video',
  'transformation-gallery',
  'testimonials',
  'whats-included'
];

const fitnessTrainerDefaultData = {
  design: {
    primaryColor: '#FF6B35', // Energetic orange/red
    secondaryColor: '#1A1A1A', // Dark gray/black
    darkMode: false
  },
  domain: {
    customDomain: '',
    subdomain: 'your-community'
  },
  hero: {
    headline: 'Transform Your Body',
    tagline: 'START YOUR JOURNEY',
    description: 'Join thousands who have transformed their lives with our proven fitness programs',
    ctaText: 'Get Started Today',
    secondaryCtaText: 'Watch Video',
    alignment: 'left',
    backgroundImage: '',
    showStats: true
  },
  banner: {
    bannerUrl: '',
    bannerHeight: '400px',
    overlayText: 'Your Transformation Awaits',
    overlayTextColor: '#FFFFFF',
    showOverlay: true
  },
  'trainer-about': {
    trainerName: 'Your Name',
    trainerTitle: 'Certified Fitness Trainer',
    trainerBio: 'With over 10 years of experience in fitness and nutrition, I help people achieve their fitness goals through personalized training programs.',
    trainerImage: '',
    credentials: ['NASM Certified', 'CPR Certified', 'Nutrition Specialist'],
    showCredentials: true,
    layout: 'split-left'
  },
  'workout-plans': {
    title: 'Choose Your Program',
    subtitle: 'Select the perfect training plan for your goals',
    plans: [
      {
        id: '1',
        name: 'Beginner',
        description: 'Perfect for those just starting out',
        price: 49,
        features: ['4 week program', 'Basic nutrition guide', 'Email support']
      },
      {
        id: '2',
        name: 'Intermediate',
        description: 'For those ready to level up',
        price: 79,
        features: ['8 week program', 'Advanced nutrition', 'Weekly check-ins']
      },
      {
        id: '3',
        name: 'Advanced',
        description: 'Maximum results in minimum time',
        price: 119,
        features: ['12 week program', 'Personalized nutrition', '24/7 support']
      }
    ]
  },
  video: {
    title: 'Watch Our Training',
    videoUrl: '',
    height: '600px',
    layout: 'full',
    alignment: 'center',
    showOverlay: true
  },
  'transformation-gallery': {
    title: 'Real Results',
    subtitle: 'See the transformations of our clients',
    transformations: [],
    layout: 'grid'
  },
  testimonials: {
    title: 'What Our Clients Say',
    testimonials: [
      {
        id: '1',
        clientName: 'Sarah M.',
        clientImage: '',
        quote: 'I lost 30 pounds in 3 months! The program was exactly what I needed.',
        results: 'Lost 30 lbs'
      },
      {
        id: '2',
        clientName: 'Mike T.',
        clientImage: '',
        quote: 'Best fitness program I\'ve ever tried. Highly recommend!',
        results: 'Gained 20 lbs muscle'
      }
    ],
    alignment: 'center'
  },
  'whats-included': {
    title: "What's Included",
    items: [
      {
        id: 'workouts',
        title: 'Workout Plans',
        description: 'Customized training programs',
        icon: 'workouts'
      },
      {
        id: 'nutrition',
        title: 'Nutrition Guide',
        description: 'Meal plans and recipes',
        icon: 'nutrition'
      },
      {
        id: 'support',
        title: '24/7 Support',
        description: 'Get help whenever you need it',
        icon: 'support'
      }
    ],
    alignment: 'left'
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

export const useFitnessTrainerStore = create<FitnessTrainerState>()(
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
        }, false, 'fitness-trainer:addSection');
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
        }, false, 'fitness-trainer:removeSection');
      },
      
      setSelectedSection: (sectionId: string | null) => {
        set({ selectedSection: sectionId }, false, 'fitness-trainer:setSelectedSection');
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
        }), false, 'fitness-trainer:updateSectionData');
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
        }, false, 'fitness-trainer:setSelectedPageType');
      },
      
      setIsMobileView: (isMobile: boolean) => {
        set({ isMobileView: isMobile }, false, 'fitness-trainer:setIsMobileView');
      },
      
      setIsSaving: (saving: boolean) => {
        set({ isSaving: saving }, false, 'fitness-trainer:setIsSaving');
      },
      
      setIsPublishing: (publishing: boolean) => {
        set({ isPublishing: publishing }, false, 'fitness-trainer:setIsPublishing');
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
        }, false, 'fitness-trainer:reorderSections');
      },
      
      resetBuilder: () => {
        set({ ...initialState, isInitialized: false }, false, 'fitness-trainer:resetBuilder');
      },
      
      loadTemplate: (template: { sections: string[]; data: SectionData }) => {
        set({
          addedSections: template.sections,
          sectionData: template.data,
          selectedSection: template.sections[0] || null,
        }, false, 'fitness-trainer:loadTemplate');
      },
      
      initializeFitnessTrainer: () => {
        set((state) => {
          if (state.isInitialized) {
            return state;
          }
          return {
            addedSections: fitnessTrainerDefaultSections,
            sectionData: fitnessTrainerDefaultData,
            selectedSection: null,
            salesPageSections: fitnessTrainerDefaultSections,
            isInitialized: true,
          };
        }, false, 'fitness-trainer:initializeFitnessTrainer');
      },
    }),
    {
      name: 'fitness-trainer-store',
    }
  )
);

// Selectors for better performance
export const useFitnessTrainerSectionData = (sectionId: string) => 
  useFitnessTrainerStore((state) => state.sectionData[sectionId] || {});

export const useIsFitnessTrainerSectionSelected = (sectionId: string) =>
  useFitnessTrainerStore((state) => state.selectedSection === sectionId);

