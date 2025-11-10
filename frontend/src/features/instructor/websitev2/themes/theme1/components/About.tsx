import React from 'react';
import { Check } from 'lucide-react';
import { useDesignColors } from '../../../hooks/useDesignColors';

interface AboutProps {
  title?: string;
  description: string;
  features: string[];
  bannerUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  padding?: number;
}

export const About: React.FC<AboutProps> = React.memo(({ 
  title = "About",
  description = "Welcome to my learning community! Join a thriving community of learners and get access to exclusive content, direct support, and connect with fellow students on the same learning journey.",
  features = [
    "Comprehensive courses with lifetime access",
    "Active community with 24/7 peer support",
    "Regular live Q&A sessions and coaching calls",
    "Exclusive resources and member-only content"
  ],
  bannerUrl,
  backgroundColor = '#FFFFFF',
  textColor = '#000000',
  padding = 4
}) => {
  const { darkMode } = useDesignColors();
  
  return (
    <div 
      className={`rounded-xl shadow-sm border ${
        darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
      }`}
      style={{ 
        backgroundColor: darkMode ? '#374151' : backgroundColor,
        color: darkMode ? '#FFFFFF' : textColor,
        padding: `${padding * 0.25}rem`
      }}
    >
      {/* Banner Section */}
      {bannerUrl && (
        <div 
          className="h-32 w-full bg-cover bg-center rounded-lg mb-4"
          style={{ backgroundImage: `url(${bannerUrl})` }}
        />
      )}
      
      <h2 className={`text-2xl font-bold mb-4 ${
        darkMode ? 'text-white' : 'text-gray-800'
      }`}>{title}</h2>
      
      <p className={`mb-6 leading-relaxed text-base ${
        darkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {description}
      </p>
      
      <div className="space-y-3">
        {features && Array.isArray(features) && features.length > 0 && features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3">
            <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
              darkMode ? 'text-green-400' : 'text-gray-600'
            }`} />
            <span className={`text-base ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
