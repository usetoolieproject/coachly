import React from 'react';
import { Theme } from '../types';
import { Eye, ArrowRight, Plus, Star } from 'lucide-react';
import { ProfessionalCoachThumbnail } from '../themes/theme1/ProfessionalCoachThumbnail';
import { FitnessTrainerThumbnail } from '../themes/theme2/FitnessTrainerThumbnail';
import { useTheme1Store } from '../stores/theme1Store';
import { useStartFromScratchStore } from '../stores/startFromScratchStore';
import { useFitnessTrainerStore } from '../stores/fitnessTrainerStore';

interface ThemeCardProps {
  theme: Theme;
  onSelect: (theme: Theme) => void;
  onPreview: (theme: Theme) => void;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({ theme, onSelect, onPreview }) => {
  const isComingSoon = theme.comingSoon === true;
  
  // Get published state from appropriate store
  const theme1IsPublished = useTheme1Store((state) => state.isPublished);
  const startFromScratchIsPublished = useStartFromScratchStore((state) => state.isPublished);
  const fitnessTrainerIsPublished = useFitnessTrainerStore((state) => state.isPublished);
  
  // Determine if this theme is published
  const isPublished = 
    (theme.id === 'professional-coach' && theme1IsPublished) ||
    (theme.id === 'start-from-scratch' && startFromScratchIsPublished) ||
    (theme.id === 'fitness-trainer' && fitnessTrainerIsPublished);
  
  return (
    <div className={`group relative bg-white rounded-xl shadow-sm transition-all duration-200 border border-gray-100 overflow-hidden ${
      isComingSoon ? 'opacity-75' : 'hover:shadow-lg'
    }`}>
      {/* Thumbnail */}
      <div 
        className={`aspect-video bg-gray-50 rounded-t-xl overflow-hidden relative ${
          isComingSoon ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
        onClick={() => !isComingSoon && onPreview(theme)}
      >
        {theme.isBlank ? (
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 relative">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-400 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Blank Canvas</p>
            </div>
            
            {/* Published Badge - Top Left (Red Sticker Style) */}
            {isPublished && (
              <div className="absolute top-2 left-2 z-30">
                <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-md shadow-lg transform rotate-[-3deg] border-2 border-red-700">
                  PUBLISHED
                </span>
              </div>
            )}

            {/* NEW Badge - Only show if not published */}
            {theme.isNew && !isPublished && (
              <div className="absolute top-2 left-2 z-30">
                <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                  NEW
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
            {theme.id === 'professional-coach' ? (
              // Show Professional Coach thumbnail
              <ProfessionalCoachThumbnail />
            ) : theme.id === 'fitness-trainer' ? (
              // Show Fitness Trainer thumbnail
              <FitnessTrainerThumbnail />
            ) : theme.thumbnail && theme.thumbnail !== '/themes/professional-coach-thumb.jpg' ? (
              // Show actual thumbnail image if available
              <img 
                src={theme.thumbnail} 
                alt={theme.name}
                className="w-full h-full object-cover"
              />
            ) : (
              // Show theme preview mockup for other themes
              <div className="w-24 h-16 bg-white rounded shadow-sm transform rotate-1">
                <div className="h-2 bg-gray-300 rounded-t"></div>
                <div className="p-2">
                  <div className="h-1 bg-gray-200 rounded mb-1"></div>
                  <div className="h-1 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            )}
            
            {/* Overlay on hover */}
            {!isComingSoon && (
              <div 
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
                onClick={() => onPreview(theme)}
              >
                <div className="text-center text-white">
                  <Eye className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs font-medium">Preview</p>
                </div>
              </div>
            )}
            
            {/* Coming Soon Overlay */}
            {isComingSoon && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                <div className="text-center">
                  <div className="bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-lg mb-2">
                    Coming Soon
                  </div>
                  <p className="text-white text-xs opacity-90">Available in a future update</p>
                </div>
              </div>
            )}
            
            {/* Published Badge - Top Left (Red Sticker Style) */}
            {isPublished && (
              <div className="absolute top-2 left-2 z-30">
                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-md shadow-lg transform rotate-[-3deg] ">
                  PUBLISHED
                </span>
              </div>
            )}

            {/* NEW Badge - Only show if not published */}
            {theme.isNew && !isPublished && (
              <div className="absolute top-2 left-2 z-30">
                <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                  NEW
                </span>
              </div>
            )}

            {/* Category Badge */}
            <div className="absolute top-2 right-2 z-30">
              <span className="bg-white/90 text-gray-600 text-xs font-medium px-2 py-1 rounded">
                {theme.category}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-base mb-1">{theme.name}</h3>
            <div className="flex items-center space-x-1 mb-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <span className="text-xs text-gray-500">(4.9)</span>
            </div>
          </div>
         
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {theme.description}
        </p>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => !isComingSoon && onPreview(theme)}
            disabled={isComingSoon}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
              isComingSoon 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
          <button
            onClick={() => !isComingSoon && onSelect(theme)}
            disabled={isComingSoon}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm font-semibold ${
              isComingSoon 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            <span>Select</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
