import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Save, Eye, Globe, Loader2, CheckCircle, Copy, ExternalLink, X, Monitor, Smartphone } from 'lucide-react';
import { BuilderSidebar } from './BuilderSidebar';
import { BuilderPreview } from './BuilderPreview';
import { EditorFactory } from '../factories/EditorFactory';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Theme } from '../types';
import { usePageBuilderStoreState, useSetIsMobileView, useInitializeTheme1, useInitializeStartFromScratch, useInitializeFitnessTrainer, useSaveWebsiteConfiguration, useLoadWebsiteConfiguration, usePublishWebsite, useSetSelectedTheme, useSelectedTheme } from '../stores/pageBuilderStore';
import { useAuth } from '../../../../contexts/AuthContext';
import { Theme1Preview } from '../themes/theme1/Theme1Preview';
import { useDesignColors } from '../hooks/useDesignColors';

interface BuilderInterfaceProps {
  selectedTheme: Theme;
  onBackToSelection: () => void;
}

export const BuilderInterface: React.FC<BuilderInterfaceProps> = ({
  selectedTheme,
  onBackToSelection
}) => {
  const { isDarkMode } = useTheme();
  
  // Local state for preview modal
  const [showPreview, setShowPreview] = useState(false);
  const [previewMobileView, setPreviewMobileView] = useState(false);
  
  // Zustand store state
  const {
    isMobileView,
    isSaving,
    isPublishing,
    selectedSection,
    isPublished,
    addedSections,
    sectionData,
  } = usePageBuilderStoreState();
  
  const designColors = useDesignColors({ allSectionData: sectionData });
  React.useEffect(() => {
    // Remove builder debug logging for primaryColor/design
  }, [designColors.primaryColor, sectionData?.design]);
  
  // Get user data for website URL construction
  const { user } = useAuth();
  
  // Zustand actions
  const setIsMobileView = useSetIsMobileView();
  const initializeTheme1 = useInitializeTheme1();
  const initializeStartFromScratch = useInitializeStartFromScratch();
  const initializeFitnessTrainer = useInitializeFitnessTrainer();
  const loadWebsiteConfiguration = useLoadWebsiteConfiguration();
  const publishWebsite = usePublishWebsite();
  
  // Update Zustand store's selectedTheme and initialize when theme changes
  const setSelectedTheme = useSetSelectedTheme();
  const currentSelectedTheme = useSelectedTheme();
  
  useEffect(() => {
    // Get theme from current state
    const currentStoreTheme = currentSelectedTheme;
    
    // If the theme has changed, reset and reinitialize
    if (currentStoreTheme !== selectedTheme.id) {
      // Update the store's selectedTheme (this will reset isInitialized and clear data)
      setSelectedTheme(selectedTheme.id);
    }
    
    // Initialize based on theme type (either theme changed or not yet initialized)
    const initializeBuilder = async () => {
      // First try to load saved configuration
      const hasSavedConfig = await loadWebsiteConfiguration();
      
      // If no saved configuration found, initialize with defaults
      if (selectedTheme.id === 'professional-coach' && !hasSavedConfig) {
        initializeTheme1();
      } else if (selectedTheme.id === 'start-from-scratch' && !hasSavedConfig) {
        initializeStartFromScratch();
      } else if (selectedTheme.id === 'fitness-trainer' && !hasSavedConfig) {
        initializeFitnessTrainer();
      }
    };
    
    initializeBuilder();
  }, [selectedTheme.id, initializeTheme1, initializeStartFromScratch, initializeFitnessTrainer, loadWebsiteConfiguration, setSelectedTheme, currentSelectedTheme]);

  const handleCloseEditor = useCallback(() => {
    // This will be handled by Zustand store
  }, []);

  const saveWebsiteConfiguration = useSaveWebsiteConfiguration();
  
  const handleSave = useCallback(async () => {
    // Don't manually set isSaving - let the store handle it
    try {
      const success = await saveWebsiteConfiguration();
      if (success) {
        // Show success message or notification
      } else {
        // Show error message
      }
    } catch (error) {
    }
  }, [saveWebsiteConfiguration]);

  const handlePublish = useCallback(async () => {
    // Don't manually set isSaving or isPublishing - let the store handle it
    try {
      const success = await publishWebsite();
      if (success) {
      } else {
      }
    } catch (error) {
    }
  }, [publishWebsite]);

  // Helper function to get website URL with user data
  const getWebsiteUrl = useCallback(() => {
    if (user?.instructor?.subdomain) {
      const subdomain = user.instructor.subdomain;
      
      // Check if we're in local development environment
      const isLocalDev = window.location.hostname === 'localhost' || 
                        window.location.hostname.includes('.lvh.me') ||
                        window.location.hostname === '127.0.0.1';
      
      if (isLocalDev) {
        // Use lvh.me for local development
        const baseDomain = 'lvh.me:3000';
        return `http://${subdomain}.${baseDomain}`;
      } else {
        // Use production domain
        const baseDomain = 'usecoachly.com';
        return `https://${subdomain}.${baseDomain}`;
      }
    }
    return window.location.origin;
  }, [user]);

  // Helper function to copy website URL
  const handleCopyUrl = useCallback(async () => {
    const url = getWebsiteUrl();
    
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
        } catch (err) {
          throw new Error('Copy failed');
        }
        
        document.body.removeChild(textArea);
      }
      
      // Show success notification
      const notification = document.createElement('div');
      notification.textContent = 'Website URL copied to clipboard!';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    } catch (error) {
      
      // Show a more helpful error with the URL
      const errorNotification = document.createElement('div');
      errorNotification.innerHTML = `
        <div style="margin-bottom: 8px; font-weight: bold;">Copy failed. Please copy manually:</div>
        <div style="background: #f3f4f6; padding: 8px; border-radius: 4px; font-family: monospace; font-size: 12px; word-break: break-all;">${url}</div>
        <button onclick="this.parentElement.remove()" style="margin-top: 8px; padding: 4px 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
      `;
      errorNotification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fef3c7;
        color: #92400e;
        padding: 16px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 300px;
        border: 1px solid #f59e0b;
      `;
      document.body.appendChild(errorNotification);
    }
  }, [getWebsiteUrl]);

  // Helper function to open website URL
  const handleOpenUrl = useCallback(() => {
    const url = getWebsiteUrl();
    window.open(url, '_blank');
  }, [getWebsiteUrl]);

  // Preview modal handlers
  const handleOpenPreview = useCallback(() => {
    setShowPreview(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setShowPreview(false);
  }, []);

  const handleTogglePreviewView = useCallback(() => {
    setPreviewMobileView(!previewMobileView);
  }, [previewMobileView]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToSelection}
              className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className={`h-6 w-px ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
            <div>
              <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {selectedTheme.name}
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Website Builder
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Published Status - before Preview */}
            {isPublished && (
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-green-900/20 border border-green-700' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <Globe className={`w-4 h-4 ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-green-300' : 'text-green-900'
                  }`}>
                    Your Website is Live!
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 font-mono text-xs rounded ${
                    isDarkMode 
                      ? 'bg-gray-800 border border-green-700 text-green-300' 
                      : 'bg-white border border-green-200 text-green-800'
                  }`}>
                    {getWebsiteUrl()}
                  </div>
                  <button
                    onClick={handleCopyUrl}
                    className={`p-1.5 rounded transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    title="Copy URL"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleOpenUrl}
                    className={`p-1.5 rounded transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
            
            <button 
              onClick={handleOpenPreview}
              className={`flex items-center space-x-2 px-4 py-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} rounded-lg transition-colors`}
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving || isPublishing}
              className={`flex items-center space-x-2 px-4 py-2 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded-lg transition-colors disabled:opacity-50`}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handlePublish}
              disabled={isSaving || isPublishing}
              className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isPublishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPublished ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              <span>{isPublishing ? 'Publishing...' : isPublished ? 'Published' : 'Publish'}</span>
            </button>
          </div>
        </div>
      </div>


      {/* Main Builder Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Sections */}
        <BuilderSidebar
          onSave={handleSave}
          saving={isSaving}
        />

        {/* Center - Preview */}
        <BuilderPreview
          selectedTheme={selectedTheme}
          onToggleView={() => setIsMobileView(!isMobileView)}
        />

        {/* Right Side - Section Editor */}
        {selectedSection && (
          <EditorFactory
            themeId={selectedTheme.id}
            sectionId={selectedSection}
            onClose={handleCloseEditor}
          />
        )}
      </div>

      {/* Full-Screen Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
            {/* Preview Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Website Preview
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center bg-gray-200 rounded-lg p-1">
                    <button
                      onClick={handleTogglePreviewView}
                      className={`
                        p-2 rounded-md transition-colors
                        ${!previewMobileView 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-500'
                        }
                      `}
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleTogglePreviewView}
                      className={`
                        p-2 rounded-md transition-colors
                        ${previewMobileView 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-500'
                        }
                      `}
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleOpenUrl}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Live Site</span>
                </button>
                <button
                  onClick={handleClosePreview}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-hidden bg-gray-100 p-6">
              <div className="h-full flex justify-center">
                <div className={`
                  bg-white rounded-lg shadow-lg overflow-hidden
                  ${previewMobileView ? 'max-w-sm w-full' : 'max-w-6xl w-full'}
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
                        {getWebsiteUrl()}
                      </div>
                    </div>
                  </div>

                  {/* Website Content */}
                  <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    {selectedTheme?.id === 'professional-coach' ? (
                      <Theme1Preview 
                        sectionData={sectionData}
                        addedSections={addedSections}
                        selectedSection={undefined}
                        onSelectSection={() => {}}
                        onHeightChange={() => {}}
                      />
                    ) : (
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">🎨</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Preview Not Available
                        </h3>
                        <p className="text-gray-600">
                          This theme doesn't have a preview component yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
