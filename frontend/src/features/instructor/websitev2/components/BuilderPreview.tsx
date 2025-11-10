import React from 'react';
import { Monitor, Smartphone, ExternalLink } from 'lucide-react';
import { Theme1Preview } from '../themes/theme1/Theme1Preview';
import { StartFromScratchPreview } from '../themes/start-from-scratch/StartFromScratchPreview';
import { Theme2Preview } from '../themes/theme2/Theme2Preview';
import { usePageBuilderStore } from '../stores/pageBuilderStore';
import { useTheme1Store } from '../stores/theme1Store';
import { useStartFromScratchStore } from '../stores/startFromScratchStore';
import { useFitnessTrainerStore } from '../stores/fitnessTrainerStore';

interface BuilderPreviewProps {
  selectedTheme: any;
  onToggleView: () => void;
}

export const BuilderPreview: React.FC<BuilderPreviewProps> = ({
  selectedTheme,
  onToggleView
}) => {
  // Get current theme
  const selectedThemeId = usePageBuilderStore((state) => state.selectedTheme);
  
  // Get data from appropriate theme store
  const theme1Data = useTheme1Store();
  const startFromScratchData = useStartFromScratchStore();
  const fitnessTrainerData = useFitnessTrainerStore();
  
  // Select appropriate store based on theme
  let storeData;
  if (selectedThemeId === 'professional-coach') {
    storeData = theme1Data;
  } else if (selectedThemeId === 'fitness-trainer') {
    storeData = fitnessTrainerData;
  } else {
    storeData = startFromScratchData;
  }
  
  const { addedSections, selectedSection, sectionData, selectedPageType, isMobileView, updateSectionData, setSelectedSection } = storeData;

  const handleHeightChange = (sectionId: string, height: string) => {
    updateSectionData(sectionId, {
      ...(sectionData[sectionId] || {}),
      bannerHeight: height
    });
  };

  return (
    <div className="flex-1 bg-gray-50 h-full overflow-y-auto">
      {/* Preview Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Preview
            </h2>
            
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Device Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={onToggleView}
                className={`
                  p-2 rounded-md transition-colors
                  ${!isMobileView 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500'
                  }
                `}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={onToggleView}
                className={`
                  p-2 rounded-md transition-colors
                  ${isMobileView 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500'
                  }
                `}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            
            {/* External Link */}
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-6">
        <div className={`
          mx-auto bg-white rounded-lg shadow-lg overflow-hidden
          ${isMobileView ? 'max-w-[375px] mobile-preview-mode' : 'max-w-6xl'}
        `}>
          {/* Browser Header */}
          <div className="flex items-center space-x-2 p-3 bg-gray-100 border-b border-gray-200">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white rounded px-3 py-1 text-sm text-gray-600">
                yourdomain.usecoachly.com
              </div>
            </div>
          </div>

          {/* Website Preview */}
          <div className={`p-3 sm:p-4 md:p-6 ${isMobileView ? 'p-2' : ''}`}>
            {selectedTheme?.isBlank || selectedTheme?.id === 'start-from-scratch' ? (
              <div className="relative">
                {/* Start from Scratch Theme Preview */}
                <StartFromScratchPreview
                  sectionData={sectionData}
                  addedSections={addedSections}
                  selectedSection={selectedSection || undefined}
                  isEditable={true} // Editable in builder
                  onSelectSection={setSelectedSection}
                  onHeightChange={handleHeightChange}
                />
              </div>
            ) : selectedTheme?.id === 'professional-coach' ? (
              <div className="relative">
                {/* Professional Coach Theme Preview - Use Theme1Preview Component */}
                <Theme1Preview 
                  sectionData={sectionData}
                  addedSections={addedSections}
                  selectedSection={selectedSection || undefined}
                  isEditable={true} // Editable in builder
                  onSelectSection={setSelectedSection}
                  onHeightChange={handleHeightChange}
                  pageType={selectedPageType}
                  onPrivacyClick={undefined}
                  onTermsClick={undefined}
                />
              </div>
            ) : selectedTheme?.id === 'fitness-trainer' ? (
              <div className="relative">
                {/* Fitness Trainer Theme Preview - Use Theme2Preview Component */}
                <Theme2Preview 
                  sectionData={sectionData}
                  addedSections={addedSections}
                  selectedSection={selectedSection || undefined}
                  isEditable={true} // Editable in builder
                  onSelectSection={setSelectedSection}
                  onHeightChange={handleHeightChange}
                  pageType={selectedPageType}
                  onPrivacyClick={undefined}
                  onTermsClick={undefined}
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Hero Section */}
                <div 
                  className={`bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-8 text-white cursor-pointer transition-all ${
                    selectedSection === 'hero' ? 'ring-2 ring-purple-400 ring-offset-2' : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedSection('hero')}
                >
                  <h1 className="text-3xl font-bold mb-4">
                    {selectedTheme?.name || 'Your Website Title'}
                  </h1>
                  <p className="text-lg mb-6">
                    Welcome to your professional website
                  </p>
                  <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Get Started
                  </button>
                </div>

                {/* Added Sections Preview */}
                {addedSections.map((sectionId) => (
                  <div 
                    key={sectionId} 
                    className={`bg-gray-50 rounded-lg p-6 cursor-pointer transition-all ${
                      selectedSection === sectionId ? 'ring-2 ring-purple-400 ring-offset-2' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedSection(sectionId)}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                      {sectionId} Section
                    </h3>
                    <p className="text-gray-600">
                      This is a preview of your {sectionId} section. Content will be customizable.
                    </p>
                  </div>
                ))}

                {addedSections.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Add sections from the sidebar to build your website
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Notice */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Live preview updates as you build
          </p>
        </div>
      </div>
    </div>
  );
};
