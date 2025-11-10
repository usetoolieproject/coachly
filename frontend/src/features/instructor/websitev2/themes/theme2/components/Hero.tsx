import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  tagline?: string;
  headline?: string;
  description?: string;
  ctaText?: string;
  onExploreClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  tagline = "MATTE BLACK",
  headline = "Understated. Aggressive.",
  description = "Clean lines meet stealthy attitude.",
  ctaText = "Explore Fresh",
  onExploreClick
}) => {
  return (
    <div className="relative bg-gray-900 text-white min-h-[500px] flex items-center">
      {/* Background Pattern - Car Wheels */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Wheel Strips Pattern */}
        <div className="absolute inset-0 flex">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-1 bg-gradient-to-b from-gray-700 to-gray-800 border-r border-gray-600">
              <div className="h-full flex items-center justify-center">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-gray-500 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-md">
          <div className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-4">
            {tagline}
          </div>
          
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            {headline}
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            {description}
          </p>
          
          <button 
            onClick={onExploreClick}
            className="inline-flex items-center space-x-2 bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-200"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
