import React from 'react';
import { useDesignColors } from '../../../hooks/useDesignColors';

interface FooterProps {
  links?: { label: string; href: string }[];
  onPrivacyClick?: () => void;
  onTermsClick?: () => void;
  allSectionData?: any;
}

export const Footer: React.FC<FooterProps> = ({ 
  links = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms & Conditions", href: "#" }
  ],
  onPrivacyClick,
  onTermsClick,
  allSectionData
}) => {
  const { darkMode } = useDesignColors({ allSectionData });
  
  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPrivacyClick) {
      onPrivacyClick();
    }
  };

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onTermsClick) {
      onTermsClick();
    }
  };

  return (
    <footer className={`text-center py-2 sm:py-4 md:py-8 px-2 sm:px-4 ${
      darkMode ? 'border-gray-700' : 'border-gray-200'
    } border-t`}>
      <div className="flex flex-col sm:flex-row justify-center space-y-1 sm:space-y-0 sm:space-x-4 md:space-x-6">
        {links.map((link, index) => {
          // Check if this is privacy or terms link
          const isPrivacy = link.label.toLowerCase().includes('privacy');
          const isTerms = link.label.toLowerCase().includes('terms') || link.label.toLowerCase().includes('conditions');
          
          if ((isPrivacy && onPrivacyClick) || (isTerms && onTermsClick)) {
            return (
              <button
                key={index}
                onClick={isPrivacy ? handlePrivacyClick : handleTermsClick}
                className={`text-xs sm:text-xs md:text-sm transition-colors cursor-pointer ${
                  darkMode 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {link.label}
              </button>
            );
          }
          
          return (
            <a
              key={index}
              href={link.href}
              className={`text-xs sm:text-xs md:text-sm transition-colors ${
                darkMode 
                  ? 'text-gray-400 hover:text-gray-300' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {link.label}
            </a>
          );
        })}
      </div>
    </footer>
  );
};
