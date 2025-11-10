import React, { useMemo } from 'react';
import { Award, CheckCircle } from 'lucide-react';
import { useDesignColors } from '../../../hooks/useDesignColors';

interface TrainerAboutProps {
  trainerName?: string;
  trainerTitle?: string;
  trainerBio?: string;
  trainerImage?: string;
  credentials?: string[];
  showCredentials?: boolean;
  layout?: 'split-left' | 'split-right';
  isSelected?: boolean;
  isEditable?: boolean;
  onClick?: () => void;
  allSectionData?: any;
}

export const TrainerAbout: React.FC<TrainerAboutProps> = ({
  trainerName = 'Your Name',
  trainerTitle = 'Certified Fitness Trainer',
  trainerBio = 'With over 10 years of experience in fitness and nutrition, I help people achieve their fitness goals through personalized training programs.',
  trainerImage = '',
  credentials = [],
  showCredentials = true,
  layout = 'split-left',
  isSelected = false,
  isEditable = false,
  onClick,
  allSectionData = {}
}) => {
  const { primaryColor, darkMode } = useDesignColors({ allSectionData });
  const isLeftLayout = layout === 'split-left';
  
  // Safely normalize credentials to array of strings
  const normalizedCredentials = useMemo(() => {
    if (!credentials || !Array.isArray(credentials)) {
      return [];
    }
    return credentials.map((cred: any) => {
      if (typeof cred === 'string') {
        return cred;
      }
      return cred?.name || cred?.text || cred?.title || String(cred) || '';
    }).filter((cred: string) => cred && cred.trim() !== '');
  }, [credentials]);

  return (
    <div
      className={`py-12 md:py-16 ${isSelected && isEditable ? 'ring-4' : ''}`}
      style={isSelected && isEditable ? { 
        outline: `4px solid ${primaryColor}`,
        outlineOffset: '-4px'
      } : undefined}
      onClick={isEditable ? onClick : undefined}
      role={isEditable ? 'button' : undefined}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-5 md:px-6 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 sm:p-6 md:p-8 lg:p-12`}>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center ${
          !isLeftLayout ? 'md:flex-row-reverse' : ''
        }`}>
          {/* Image Side */}
          <div className={`${!isLeftLayout ? 'md:order-2' : ''}`}>
            {trainerImage ? (
              <div className="relative">
                <img 
                  src={trainerImage} 
                  alt={trainerName}
                  className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover rounded-xl sm:rounded-2xl shadow-2xl"
                />
                <div 
                  className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 md:-bottom-4 md:-right-4 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-xl"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Award className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                </div>
              </div>
            ) : (
              <div 
                className="w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-xl sm:rounded-2xl flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%)`
                }}
              >
                {isEditable && (
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Upload trainer photo</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Content Side */}
          <div className={`${!isLeftLayout ? 'md:order-1' : ''}`}>
            {trainerTitle && (
              <div className="mb-4">
                <span 
                  className="inline-block px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wide"
                  style={{ 
                    backgroundColor: `${primaryColor}20`,
                    color: primaryColor
                  }}
                >
                  {trainerTitle}
                </span>
              </div>
            )}
            
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-5 md:mb-6 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {trainerName}
            </h2>
            
            {trainerBio && (
              <p className={`text-base sm:text-lg md:text-xl mb-6 sm:mb-7 md:mb-8 leading-relaxed ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {trainerBio}
              </p>
            )}
            
            {/* Credentials */}
            {showCredentials && normalizedCredentials.length > 0 && (
              <div className="space-y-3">
                <h3 className={`text-lg font-bold mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Certifications & Credentials
                </h3>
                {normalizedCredentials.map((credentialText: string, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle 
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: primaryColor }}
                    />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {credentialText}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
