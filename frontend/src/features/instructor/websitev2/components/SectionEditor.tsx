import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface SectionEditorProps {
  selectedSection: string | null;
  onClose: () => void;
  onUpdate?: (sectionId: string, data: any) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({ selectedSection, onClose, onUpdate }) => {
  const { isDarkMode } = useTheme();
  
  // State for section data
  const [sectionData, setSectionData] = useState<any>({});

  if (!selectedSection) return null;

  // Initialize section data
  useEffect(() => {
    const initialData = getSectionData();
    setSectionData(initialData);
  }, [selectedSection]);

  // Update preview when data changes
  useEffect(() => {
    if (onUpdate && selectedSection) {
      onUpdate(selectedSection, sectionData);
    }
  }, [sectionData, selectedSection, onUpdate]);

  const getSectionData = () => {
    switch (selectedSection) {
      case 'hero':
        return {
          title: 'Professional Coach',
          subtitle: 'Welcome to your professional website',
          buttonText: 'Get Started',
          alignment: 'center',
          width: 'full',
          height: 'auto',
          backgroundColor: '#8B5CF6',
          textColor: '#FFFFFF'
        };
      case 'about':
        return {
          title: 'About',
          description: 'Welcome to my learning community! Join a thriving community of learners and get access to exclusive content, direct support, and connect with fellow students on the same learning journey.',
          alignment: 'left',
          width: 'full',
          height: 'auto',
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
          bannerUrl: ''
        };
      case 'video':
        return {
          title: 'Video',
          videoUrl: '',
          alignment: 'center',
          width: 'full',
          height: '400px',
          backgroundColor: '#F3F4F6'
        };
      case 'offer-box':
        return {
          title: 'Special Offer',
          subtitle: 'Join now for just $29/month',
          buttonText: 'Get Started',
          alignment: 'center',
          width: 'full',
          height: 'auto',
          backgroundColor: '#10B981',
          textColor: '#FFFFFF'
        };
      case 'whats-included':
        return {
          title: "What's Included",
          alignment: 'center',
          width: 'full',
          height: 'auto',
          backgroundColor: '#FFFFFF'
        };
      case 'testimonials':
        return {
          title: 'What Our Students Say',
          alignment: 'center',
          width: 'full',
          height: 'auto',
          backgroundColor: '#FFFFFF'
        };
      case 'design':
        return {
          title: 'Design',
          content: 'Customize your website design and branding options.',
          alignment: 'left',
          width: 'full',
          height: 'auto',
          backgroundColor: '#FFFFFF'
        };
      case 'domain':
        return {
          title: 'Domain',
          content: 'Configure your domain and hosting settings.',
          alignment: 'left',
          width: 'full',
          height: 'auto',
          backgroundColor: '#FFFFFF'
        };
      case 'add-new':
        return {
          title: 'Custom Section',
          content: 'Your custom content section.',
          alignment: 'left',
          width: 'full',
          height: 'auto',
          backgroundColor: '#F3F4F6'
        };
      default:
        return {
          title: 'Section Title',
          content: 'Section content...',
          alignment: 'left',
          width: 'full',
          height: 'auto',
          backgroundColor: '#FFFFFF',
          textColor: '#000000'
        };
    }
  };

  return (
    <div className={`w-80 border-l ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} flex flex-col h-full`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Edit Section
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            ✕
          </button>
        </div>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)} Section
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Text Content */}
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Title
            </label>
            <input
              type="text"
              defaultValue={sectionData.title}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="Enter title..."
            />
          </div>

          {selectedSection === 'hero' && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Subtitle
              </label>
              <input
                type="text"
                defaultValue={sectionData.subtitle}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder="Enter subtitle..."
              />
            </div>
          )}

          {(selectedSection === 'about-join-combined' || selectedSection === 'features') && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Content
              </label>
              <textarea
                rows={4}
                defaultValue={sectionData.content}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder="Enter content..."
              />
            </div>
          )}

          {selectedSection === 'hero' && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Button Text
              </label>
              <input
                type="text"
                defaultValue={sectionData.buttonText}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder="Enter button text..."
              />
            </div>
          )}
        </div>

        {/* Alignment */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Text Alignment
          </label>
          <div className="flex space-x-2">
            <button className={`p-2 rounded-lg border ${
              sectionData.alignment === 'left' 
                ? 'border-purple-500 bg-purple-50 text-purple-700' 
                : isDarkMode 
                  ? 'border-gray-600 hover:border-gray-500 text-gray-400' 
                  : 'border-gray-300 hover:border-gray-400 text-gray-600'
            }`}>
              <AlignLeft className="w-4 h-4" />
            </button>
            <button className={`p-2 rounded-lg border ${
              sectionData.alignment === 'center' 
                ? 'border-purple-500 bg-purple-50 text-purple-700' 
                : isDarkMode 
                  ? 'border-gray-600 hover:border-gray-500 text-gray-400' 
                  : 'border-gray-300 hover:border-gray-400 text-gray-600'
            }`}>
              <AlignCenter className="w-4 h-4" />
            </button>
            <button className={`p-2 rounded-lg border ${
              sectionData.alignment === 'right' 
                ? 'border-purple-500 bg-purple-50 text-purple-700' 
                : isDarkMode 
                  ? 'border-gray-600 hover:border-gray-500 text-gray-400' 
                  : 'border-gray-300 hover:border-gray-400 text-gray-600'
            }`}>
              <AlignRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Width */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Width
          </label>
          <select className={`w-full px-3 py-2 rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-gray-100' 
              : 'bg-white border-gray-300 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-purple-500`}>
            <option value="full">Full Width</option>
            <option value="container">Container</option>
            <option value="narrow">Narrow</option>
          </select>
        </div>

        {/* Height */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Height
          </label>
          <input
            type="text"
            defaultValue={sectionData.height}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            placeholder="e.g., 400px, auto, 50vh"
          />
        </div>

        {/* Background Color */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Background Color
          </label>
          <div className="flex space-x-2">
            <input
              type="color"
              defaultValue={sectionData.backgroundColor}
              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              defaultValue={sectionData.backgroundColor}
              className={`flex-1 px-3 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Text Color
          </label>
          <div className="flex space-x-2">
            <input
              type="color"
              defaultValue={sectionData.textColor || '#000000'}
              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              defaultValue={sectionData.textColor || '#000000'}
              className={`flex-1 px-3 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Spacing */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Padding
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Top</label>
              <input
                type="number"
                defaultValue="4"
                className={`w-full px-2 py-1 text-sm rounded border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bottom</label>
              <input
                type="number"
                defaultValue="4"
                className={`w-full px-2 py-1 text-sm rounded border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Left</label>
              <input
                type="number"
                defaultValue="4"
                className={`w-full px-2 py-1 text-sm rounded border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Right</label>
              <input
                type="number"
                defaultValue="4"
                className={`w-full px-2 py-1 text-sm rounded border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Video URL (for video section) */}
        {selectedSection === 'video' && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Video URL
            </label>
            <input
              type="url"
              value={sectionData.videoUrl || ''}
              onChange={(e) => setSectionData({...sectionData, videoUrl: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        )}

        {/* About Section Specific Fields */}
        {selectedSection === 'about-join-combined' && (
          <>
            {/* Banner Upload */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Upload Banner
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setSectionData({...sectionData, bannerUrl: e.target?.result as string});
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              {sectionData.bannerUrl && (
                <div className="text-xs text-green-600 mt-1">✓ Banner uploaded</div>
              )}
            </div>

            {/* Welcome Description */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Welcome Description
              </label>
              <textarea
                value={sectionData.description || ''}
                onChange={(e) => setSectionData({...sectionData, description: e.target.value})}
                rows={3}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none`}
                placeholder="Enter your welcome description..."
              />
            </div>

          </>
        )}
      </div>

      {/* Footer */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex space-x-2">
          <button className={`flex-1 px-4 py-2 rounded-lg border ${
            isDarkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}>
            Reset
          </button>
          <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
