import React, { useEffect } from 'react';
import { useInstructorName, useDesignColors } from '../../../hooks';
import { useUpdateSectionData } from '../../../stores/pageBuilderStore';
import { usePayment } from '../../../hooks/usePayment';
import { PaymentData } from '../../../services/paymentService';

interface OfferBoxProps {
  title?: string;
  buttonText?: string;
  linkText?: string;
  padding?: number;
  isEditable?: boolean;
  onOfferClick?: () => void;
  communityType?: 'free' | 'paid';
  monthlyPrice?: number;
  sectionId?: string;
  width?: 'narrow' | 'medium' | 'full' | 'container';
  allSectionData?: any;
  publicViewData?: {
    instructorId?: string;
    communityId?: string;
    subdomain?: string;
  };
}

export const OfferBox: React.FC<OfferBoxProps> = ({
  title,
  buttonText,
  linkText = "Already have an account? Sign in",
  padding = 4,
  isEditable = false,
  onOfferClick,
  communityType = 'paid',
  monthlyPrice,
  sectionId = 'offer-box',
  width = 'container',
  allSectionData,
  publicViewData
}) => {
  const instructorName = useInstructorName();
  const updateSectionData = useUpdateSectionData();
  const { primaryColor, darkMode } = useDesignColors({ allSectionData });
  const displayTitle = title || `${instructorName}'s Learning Hub`;
  const { handleCommunityPayment, handleFreeSignup } = usePayment();
  
  
  // Update store with generated title if no title is provided
  useEffect(() => {
    if (!title && instructorName) {
      const generatedTitle = `${instructorName}'s Learning Hub`;
      updateSectionData(sectionId, { title: generatedTitle });
    }
  }, [title, instructorName, sectionId, updateSectionData]);
  
  // Generate button text based on community type and monthly price
  const getButtonText = () => {
    if (buttonText) return buttonText; // Use custom button text if provided
    if (communityType === 'free') return 'Join for Free';
    return `Join for $${monthlyPrice || 0}/month`;
  };

  // Parse linkText to make "Sign in" clickable and blue (only in public view)
  const renderLinkText = () => {
    if (!linkText) return null;
    
    // Only make it clickable if NOT in preview (i.e., isEditable is false)
    if (!isEditable && linkText.includes('Sign in')) {
      const parts = linkText.split('Sign in');
      const beforeText = parts[0];
      const afterText = parts[1];
      
      const signInUrl = `/login`;
      
      return (
        <span className="text-base hover:opacity-100 transition-opacity text-center" style={{ color: darkMode ? '#FFFFFF' : '#000000', opacity: 0.7 }}>
          {beforeText}
          <a 
            href={signInUrl}
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = signInUrl;
            }}
            className="text-blue-600 hover:text-blue-700 underline cursor-pointer font-medium"
          >
            Sign in
          </a>
          {afterText}
        </span>
      );
    }
    
    // In preview mode, just render as plain text
    return (
      <p className="text-base hover:opacity-100 transition-opacity cursor-pointer text-center" style={{ color: darkMode ? '#FFFFFF' : '#000000', opacity: 0.7 }}>
        {linkText}
      </p>
    );
  };

  return (
    <div 
      id={sectionId === 'offer-box' ? 'offer-box' : undefined}
      className={`w-full text-center cursor-pointer group relative ${
        width === 'container' ? 'max-w-6xl mx-auto' : 
        width === 'narrow' ? 'max-w-2xl mx-auto' :
        width === 'medium' ? 'max-w-4xl mx-auto' : 'w-full'
      }`}
      style={{ 
        color: darkMode ? '#FFFFFF' : '#000000',
        padding: `${padding * 0.25}rem`
      }}
      onClick={onOfferClick}
    >
      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-3.5 md:mb-4 px-4 sm:px-6 md:px-0" style={{ color: darkMode ? '#FFFFFF' : '#000000' }}>{displayTitle}</h2>
      
      <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
        <div className="flex justify-center">
          <button 
            className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg font-bold text-sm sm:text-base md:text-lg transition-colors"
            style={{ 
              backgroundColor: primaryColor,
              color: '#FFFFFF',
              width: 'auto',
              opacity: isEditable ? 0.6 : 1,
              cursor: isEditable ? 'not-allowed' : 'pointer'
            }}
            disabled={isEditable}
            onClick={async (e) => {
              // Only handle click if not in preview/editable mode
              if (isEditable) {
                e.stopPropagation();
                return;
              }
              
              e.stopPropagation();
              onOfferClick?.();
              
              // Check if free or paid community
              if (communityType === 'free' || monthlyPrice === 0) {
                // For free communities, use free signup handler
                handleFreeSignup(publicViewData?.communityId);
              } else {
                // For paid communities, create payment
                if (publicViewData?.instructorId && publicViewData?.communityId && monthlyPrice) {
                  try {
                    const paymentData: PaymentData = {
                      communityId: publicViewData.communityId,
                      instructorId: publicViewData.instructorId,
                      amount: monthlyPrice,
                      currency: 'usd',
                      description: `Join ${displayTitle} - Monthly Subscription`,
                      subdomain: publicViewData.subdomain,
                    };
                    await handleCommunityPayment(paymentData);
                  } catch (error) {
                  }
                } else {
                  
                }
              }
            }}
          >
            {getButtonText()}
          </button>
        </div>
        
        <p className="text-xs sm:text-sm md:text-base text-center flex items-center justify-center px-4 sm:px-6 md:px-0" style={{ color: darkMode ? '#FFFFFF' : '#000000', opacity: 0.7 }}>
          🔒 7-day free trial • Cancel anytime
        </p>
        
        {linkText && (
          <div className="px-4 sm:px-6 md:px-0">
            {renderLinkText()}
          </div>
        )}
      </div>
    </div>
  );
};
