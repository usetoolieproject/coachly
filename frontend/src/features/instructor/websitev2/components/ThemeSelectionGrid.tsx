import React, { useEffect } from 'react';
import { ThemeCard } from './ThemeCard';
import { SearchInput } from '../../../../components/shared';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Theme } from '../types';
import { websiteService } from '../../../../services/websiteService';
import { useTheme1Store } from '../stores/theme1Store';
import { useStartFromScratchStore } from '../stores/startFromScratchStore';
import { useFitnessTrainerStore } from '../stores/fitnessTrainerStore';

interface ThemeSelectionGridProps {
  themes: Theme[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onThemeSelect: (theme: Theme) => void;
  onThemePreview: (theme: Theme) => void;
  isLoading?: boolean;
}

export const ThemeSelectionGrid: React.FC<ThemeSelectionGridProps> = ({
  themes,
  searchQuery,
  setSearchQuery,
  onThemeSelect,
  onThemePreview,
  isLoading = false
}) => {
  const { isDarkMode } = useTheme();
  
  // Load published states for all themes on mount
  useEffect(() => {
    const loadAllPublishedStates = async () => {
      try {
        // Load configurations for all three themes
        const [theme1Config, theme2Config, startFromScratchConfig] = await Promise.all([
          websiteService.loadWebsiteConfiguration('professional-coach').catch(() => null),
          websiteService.loadWebsiteConfiguration('fitness-trainer').catch(() => null),
          websiteService.loadWebsiteConfiguration('start-from-scratch').catch(() => null),
        ]);
        
        // Update stores with published states
        if (theme1Config) {
          useTheme1Store.setState({ 
            isPublished: theme1Config.isPublished || false 
          });
        }
        
        if (theme2Config) {
          useFitnessTrainerStore.setState({ 
            isPublished: theme2Config.isPublished || false 
          });
        }
        
        if (startFromScratchConfig) {
          useStartFromScratchStore.setState({ 
            isPublished: startFromScratchConfig.isPublished || false 
          });
        }
      } catch (error) {
      }
    };
    
    loadAllPublishedStates();
  }, []);
  
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header Section - Consistent with other modules */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        {/* Desktop Layout */}
        <div className="hidden lg:flex lg:flex-row lg:justify-between lg:items-center">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Choose Your Perfect Theme
            </h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              Create stunning websites with professionally designed themes
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-64">
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search themes..." />
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden">
          {/* Row 1: Title and Description */}
          <div className="mb-4 sm:mb-6">
            <h1 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Choose Your Perfect Theme
            </h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 sm:mt-2 text-sm sm:text-base`}>
              Create stunning websites with professionally designed themes
            </p>
          </div>

          {/* Row 2: Search input (full width) */}
          <div className="w-full">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search themes..." />
          </div>
        </div>
      </div>

      {/* Themes Section */}
      <div>
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(6)].map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : ''
                }`}
              >
                {/* Skeleton Thumbnail */}
                <div className={`aspect-video bg-gradient-to-br ${
                  isDarkMode ? 'from-gray-700 to-gray-800' : 'from-gray-200 to-gray-300'
                } animate-pulse`} />
                
                {/* Skeleton Content */}
                <div className="p-4">
                  <div className={`h-5 w-3/4 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  } rounded mb-2 animate-pulse`} />
                  <div className={`h-4 w-1/2 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  } rounded mb-3 animate-pulse`} />
                  <div className={`h-3 w-full ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  } rounded mb-1 animate-pulse`} />
                  <div className={`h-3 w-5/6 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  } rounded mb-4 animate-pulse`} />
                  <div className="flex space-x-2">
                    <div className={`flex-1 h-9 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    } rounded-lg animate-pulse`} />
                    <div className={`flex-1 h-9 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    } rounded-lg animate-pulse`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!isLoading && themes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {themes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                onSelect={onThemeSelect}
                onPreview={onThemePreview}
              />
            ))}
          </div>
        )}
        
        {!isLoading && themes.length === 0 && (
          <div className="text-center py-16">
            <div className={`w-20 h-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <div className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
              No themes found
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg`}>
              Try adjusting your search terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
