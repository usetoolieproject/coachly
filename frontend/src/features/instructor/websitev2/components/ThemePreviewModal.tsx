import React, { useState } from 'react';
import { X, ArrowRight, Check, Star, Monitor, Smartphone } from 'lucide-react';
import { Theme } from '../types';
import { useStartFromScratchStore } from '../stores/startFromScratchStore';
import { useFitnessTrainerStore } from '../stores/fitnessTrainerStore';
import { SectionFactory } from '../factories/SectionFactory';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Theme1Preview } from '../themes/theme1/Theme1Preview';
import { Theme2Preview } from '../themes/theme2/Theme2Preview';
import { StartFromScratchPreview } from '../themes/start-from-scratch/StartFromScratchPreview';

// Component mapper for string references
const componentMap: { [key: string]: React.ComponentType<any> } = {
  'Theme1Preview': Theme1Preview,
  'Theme2Preview': Theme2Preview,
  'StartFromScratchPreview': StartFromScratchPreview,
};

interface ThemePreviewModalProps {
  theme: Theme | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (theme: Theme) => void;
}

export const ThemePreviewModal: React.FC<ThemePreviewModalProps> = ({
  theme,
  isOpen,
  onClose,
  onSelect
}) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const { isDarkMode } = useTheme();
  
  if (!isOpen || !theme) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className={`relative rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-8 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">{theme.name.charAt(0)}</span>
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {theme.name}
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>(4.9 rating)</span>
                </div>
              </div>
            </div>

            {/* Responsive View Toggle */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center rounded-lg p-1 ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'desktop' 
                      ? `${isDarkMode ? 'bg-gray-700 shadow-sm text-white' : 'bg-white shadow-sm text-gray-900'}` 
                      : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                  }`}
                >
                  <Monitor className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'mobile' 
                      ? `${isDarkMode ? 'bg-gray-700 shadow-sm text-white' : 'bg-white shadow-sm text-gray-900'}` 
                      : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={onClose}
                className={`p-3 rounded-2xl transition-colors ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <X className={`w-6 h-6 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="p-0 -mb-2">
            {theme.isBlank ? (
              <div className="p-8 text-center py-16">
                <div className={`w-32 h-32 rounded-3xl flex items-center justify-center mx-auto mb-8 ${
                  isDarkMode ? 'bg-gradient-to-br from-purple-900 to-blue-900' : 'bg-gradient-to-br from-purple-100 to-blue-100'
                }`}>
                  <span className="text-6xl">🎨</span>
                </div>
                <h3 className={`text-3xl font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Start from Scratch
                </h3>
                <p className={`text-lg mb-8 max-w-2xl mx-auto ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Begin with a blank canvas and build your custom website using our drag-and-drop builder. 
                  You'll have full control over every element and design choice.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className={`p-6 rounded-2xl ${
                    isDarkMode ? 'bg-gradient-to-br from-green-900 to-emerald-900' : 'bg-gradient-to-br from-green-50 to-emerald-50'
                  }`}>
                    <Check className="w-8 h-8 text-green-500 mx-auto mb-3" />
                    <h4 className={`font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Full Customization</h4>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Complete control over every design element</p>
                  </div>
                  <div className={`p-6 rounded-2xl ${
                    isDarkMode ? 'bg-gradient-to-br from-blue-900 to-cyan-900' : 'bg-gradient-to-br from-blue-50 to-cyan-50'
                  }`}>
                    <Check className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                    <h4 className={`font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Drag & Drop Builder</h4>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Intuitive visual editor</p>
                  </div>
                  <div className={`p-6 rounded-2xl ${
                    isDarkMode ? 'bg-gradient-to-br from-purple-900 to-pink-900' : 'bg-gradient-to-br from-purple-50 to-pink-50'
                  }`}>
                    <Check className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                    <h4 className={`font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>No Limitations</h4>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Build exactly what you envision</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`max-h-[70vh] overflow-y-auto ${
                viewMode === 'mobile' ? 'p-2 pb-4' : 'p-6 pb-4'
              }`}>
                {theme.previewComponent ? (
                  <div className={`transition-all duration-300 ${
                    viewMode === 'mobile' 
                      ? 'max-w-[375px] mx-auto mobile-preview-mode' 
                      : 'w-full'
                  }`}>
                    {theme.id === 'start-from-scratch' ? (
                      <DynamicStartFromScratchPreview />
                    ) : theme.id === 'professional-coach' ? (
                      <DynamicProfessionalCoachPreview />
                    ) : theme.id === 'fitness-trainer' ? (
                      <DynamicFitnessTrainerPreview />
                    ) : theme.previewComponent ? (
                      (() => {
                        const PreviewComponent = componentMap[theme.previewComponent!];
                        return PreviewComponent ? <PreviewComponent /> : null;
                      })()
                    ) : null}
                  </div>
                ) : (
                  <div className="p-8 text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-3xl">{theme.name.charAt(0)}</span>
                    </div>
                    <p className={`font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Preview not available</p>
                    <p className={`text-sm mt-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>This theme doesn't have a preview component yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-between px-8 pt-6 pb-6 border-t ${
            isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50/50'
          }`}>
            <button
              onClick={onClose}
              className={`px-8 py-3 rounded-xl transition-all duration-200 font-medium border border-transparent hover:border-gray-200 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={() => onSelect(theme)}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <span>Select Theme</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dynamic preview component for Start from Scratch
const DynamicStartFromScratchPreview: React.FC = () => {
  const { addedSections, sectionData } = useStartFromScratchStore();
  const { isDarkMode } = useTheme();
  
  // Default sections - empty for start from scratch
  const defaultSections: string[] = [];
  const defaultSectionData = {
    design: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#3b82f6',
      darkMode: isDarkMode // Use global dark mode theme
    }
  };
  
  // Use store data if available, otherwise use defaults
  const sectionsToRender = addedSections.length > 0 ? addedSections : defaultSections;
  const dataToRender = sectionData && Object.keys(sectionData).length > 0 ? sectionData : defaultSectionData;
  
  
  
  // Show empty state when no sections
  if (sectionsToRender.length === 0) {
    return (
      <div className={`min-h-[60vh] ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center rounded-lg border-2 border-dashed ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
        <div className="text-center max-w-md px-4">
          <div className={`w-16 h-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            <svg className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
            Start Building
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Add sections from the sidebar to start creating your custom website.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-[60vh] ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Render sections based on user's configuration or defaults */}
        {sectionsToRender.map((sectionId) => {
          const data = (dataToRender as any)[sectionId] || {};
          return (
            <div key={sectionId} className="mb-6">
              <SectionFactory 
                themeId="start-from-scratch"
                sectionId={sectionId} 
                sectionData={data}
                allSectionData={dataToRender}
                isSelected={false}
                isEditable={false}
              />
            </div>
          );
        })}
        
        {/* Footer */}
        <footer className={`text-center py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-center space-x-4">
            <a href="#" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>Privacy Policy</a>
            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>•</span>
            <a href="#" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>Terms & Conditions</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

// Dynamic preview component for Fitness Trainer
const DynamicFitnessTrainerPreview: React.FC = () => {
  const { addedSections, sectionData } = useFitnessTrainerStore();
  const { isDarkMode } = useTheme();
  
  // Default sections for fitness-trainer theme preview - ALL SECTIONS (like theme1)
  const defaultSections = ['hero', 'banner', 'trainer-about', 'workout-plans', 'video', 'transformation-gallery', 'testimonials', 'whats-included'];
  const defaultSectionData = {
    design: {
      primaryColor: '#FF6B35',
      secondaryColor: '#1A1A1A',
      darkMode: isDarkMode
    }
  };
  
  // Use store data if available, otherwise use defaults
  const sectionsToRender = addedSections.length > 0 ? addedSections : defaultSections;
  const dataToRender = sectionData && Object.keys(sectionData).length > 0 ? sectionData : defaultSectionData;
  
  return (
    <div className={`min-h-[60vh] ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-orange-50'}`}>
      <Theme2Preview
        sectionData={dataToRender}
        addedSections={sectionsToRender}
        isEditable={false}
        pageType="sales-page"
      />
    </div>
  );
};

// Dynamic preview component that uses actual user configuration
const DynamicProfessionalCoachPreview: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  // Default sections for professional-coach theme preview
  const defaultSections = ['banner', 'offer-box', 'about-join-combined', 'video', 'whats-included', 'testimonials'];
  const defaultSectionData = {
    design: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#3b82f6',
      isDarkMode: isDarkMode // Use global dark mode theme
    },
    banner: {
      title: "Welcome to Our Platform",
      subtitle: "Discover amazing content and connect with our community",
      bannerUrl: '',
      bannerHeight: '250px',
      alignment: 'center'
    },
    'offer-box': {
      title: "Join Our Community",
      linkText: "Already have an account? Sign in",
      communityType: 'free',
      monthlyPrice: 0
    },
    'about-join-combined': {
      aboutTitle: "About",
      aboutDescription: "Welcome to my learning community! Join a thriving community of learners and get access to exclusive content, direct support, and connect with fellow students on the same learning journey.",
      aboutFeatures: [
        "Comprehensive courses with lifetime access",
        "Active community with 24/7 peer support",
        "Regular live Q&A sessions and coaching calls",
        "Exclusive resources and member-only content"
      ],
      joinTitle: "Instructor's Learning Community",
      joinMembers: 1000,
      joinSupport: '24/7',
      joinCourses: 8,
      joinPrice: 0,
      joinButtonText: 'JOIN COMMUNITY',
      joinAlignment: 'left',
    },
    video: {
      title: 'Watch Our Introduction',
      videoUrl: '',
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
  
  // Always show default sections in preview modal for professional-coach
  const sectionsToRender = defaultSections;
  const dataToRender = defaultSectionData;
  
  
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Render sections based on user's configuration or defaults */}
        {sectionsToRender.map((sectionId) => {
          const data = (dataToRender as any)[sectionId] || {};
          return (
            <div key={sectionId} className="mb-6">
              <SectionFactory 
                themeId="professional-coach"
                sectionId={sectionId} 
                sectionData={data}
                allSectionData={dataToRender}
                isSelected={false}
                isEditable={false}
              />
            </div>
          );
        })}
        
        {/* Footer */}
        <footer className={`text-center py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-center space-x-4">
            <a href="#" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>Privacy Policy</a>
            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>•</span>
            <a href="#" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>Terms & Conditions</a>
          </div>
        </footer>
      </div>
    </div>
  );
};
