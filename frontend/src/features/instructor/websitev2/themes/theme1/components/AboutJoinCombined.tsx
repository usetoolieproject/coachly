import React, { useEffect } from 'react';
import { Check } from 'lucide-react';
import { useInstructorName, useCommunityStats, useDesignColors } from '../../../hooks';
import { useUpdateSectionData } from '../../../stores/pageBuilderStore';
import { usePayment } from '../../../hooks/usePayment';
import { PaymentData } from '../../../services/paymentService';

interface AboutJoinCombinedProps {
  // About section props
  aboutTitle?: string;
  aboutDescription?: string;
  aboutFeatures?: string[];
  
  // Join Community props
  joinTitle?: string;
  joinPrice?: number;
  joinButtonText?: string;
  joinAlignment?: string;
  
  // Layout props
  position?: 'about-left' | 'join-left';
  isSelected?: boolean;
  onClick?: () => void;
  sectionId?: string;
  
  // Common layout props
  alignment?: 'left' | 'center' | 'right';
  width?: 'narrow' | 'medium' | 'full' | 'container';
  height?: string;
  
  // Click handlers for different sections
  onAboutClick?: () => void;
  onJoinClick?: () => void;
  
  // All section data for cross-section references
  allSectionData?: any;
  
  // Whether in editable mode (preview/builder)
  isEditable?: boolean;
  
  // Public view data (for payment components)
  publicViewData?: {
    instructorId?: string;
    communityId?: string;
    subdomain?: string;
  };
}

export const AboutJoinCombined: React.FC<AboutJoinCombinedProps> = ({
  aboutTitle = "About",
  aboutDescription = "Welcome to my learning community! Join a thriving community of learners and get access to exclusive content, direct support, and connect with fellow students on the same learning journey.",
  aboutFeatures = [
    "Comprehensive courses with lifetime access",
    "Active community with 24/7 peer support",
    "Regular live Q&A sessions and coaching calls",
    "Exclusive resources and member-only content"
  ],
  
  joinTitle = "Ins Tructor's Learning Community",
  joinPrice,
  joinButtonText = 'JOIN COMMUNITY',
  joinAlignment = 'left',
  
  position = 'about-left',
  isSelected = false,
  
  // Common layout props
  alignment = 'left',
  width = 'full',
  height = 'auto',
  
  onAboutClick,
  onJoinClick,
  sectionId = 'about-join-combined',
  allSectionData,
  publicViewData
}) => {
  const instructorName = useInstructorName();
  const updateSectionData = useUpdateSectionData();
  const { stats: communityStats, isLoading: statsLoading } = useCommunityStats();
  const { primaryColor, secondaryColor, darkMode } = useDesignColors({ allSectionData });
  const { paymentStatus, handleCommunityPayment } = usePayment();
  
  // Use allSectionData prop if available (for public view), otherwise use empty object
  const effectiveSectionData = allSectionData || {};
  
  // Get the price and community type from OfferBox section data, fallback to props
  const offerBoxData = effectiveSectionData['offer-box'] || {};
  const actualPrice = offerBoxData.monthlyPrice !== undefined ? offerBoxData.monthlyPrice : (joinPrice || 0);
  // Treat $0 as free community by default
  const actualCommunityType = offerBoxData.communityType || (actualPrice === 0 ? 'free' : 'paid');
  
  // Get the offerbox title and transform it to join community title
  const offerBoxTitle = offerBoxData.title || `${instructorName}'s Learning Hub`;
  // Transform "Learning Hub" to "Learning Community"
  const actualJoinTitle = offerBoxTitle.replace("Learning Hub", "Learning Community");
  
  
  
  // Sync the joinTitle with the offerbox title
  useEffect(() => {
    const newJoinTitle = offerBoxTitle.replace("Learning Hub", "Learning Community");
    if (newJoinTitle !== joinTitle && offerBoxTitle) {
      updateSectionData(sectionId, { joinTitle: newJoinTitle });
    }
  }, [offerBoxTitle, joinTitle, sectionId, updateSectionData]);

  return (
    <div 
      className={`rounded-xl sm:rounded-2xl md:rounded-3xl border transition-all shadow-sm ${
        darkMode ? 'border-gray-700' : 'border-gray-100'
      } ${
        isSelected 
          ? 'border-purple-500 ring-2 ring-purple-200' 
          : darkMode ? 'hover:border-purple-400' : 'border-gray-200 hover:border-purple-300'
      } ${
        width === 'container' ? 'max-w-6xl mx-auto' : 
        width === 'narrow' ? 'max-w-2xl mx-auto' :
        width === 'medium' ? 'max-w-4xl mx-auto' : 'w-full'
      } ${
        alignment === 'center' ? 'text-center' :
        alignment === 'right' ? 'text-right' : 'text-left'
      }`}
      style={{
        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
        color: darkMode ? '#FFFFFF' : '#000000',
        height: height === 'auto' ? 'auto' : height,
        borderRadius: '24px',
        boxShadow: darkMode 
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
          : '0 10px 25px -5px rgba(0, 0, 0, 0.15)'
      }}
    >
      <div className="flex flex-col md:flex-row gap-0 md:gap-0">
        {/* Left Section - About or Join based on position */}
        <div 
          className="p-3 md:p-4 cursor-pointer hover:bg-opacity-90 transition-all rounded-t-xl md:rounded-l-xl md:rounded-t-none m-1 md:m-0 w-full md:w-[65%]"
          style={{ 
            margin: '0.5rem',
            backgroundColor: position === 'about-left' 
              ? (darkMode ? '#1F2937' : '#FFFFFF') 
              : (darkMode ? '#374151' : '#F8F9FA'),
            color: position === 'about-left' 
              ? (darkMode ? '#FFFFFF' : '#000000') 
              : (darkMode ? '#FFFFFF' : '#374151'),
            borderRadius: position === 'about-left' ? '12px' : '12px'
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (position === 'about-left') {
              onAboutClick?.();
            } else {
              onJoinClick?.();
            }
          }}
        >
          {position === 'about-left' ? (
            // About content
            <>
              <h2 
                className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4"
                style={{ color: darkMode ? '#FFFFFF' : '#000000' }}
              >
                {aboutTitle}
              </h2>
              <p 
                className="mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm md:text-base leading-relaxed"
                style={{ color: darkMode ? '#FFFFFF' : '#000000' }}
              >
                {aboutDescription}
              </p>
              
              <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                {aboutFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start sm:items-center space-x-2 sm:space-x-2.5 md:space-x-3">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="text-xs sm:text-sm md:text-base leading-snug sm:leading-normal" style={{ color: darkMode ? '#FFFFFF' : '#000000' }}>{feature}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            // Join Community content
            <>
              <div 
                className="flex items-center space-x-3 mb-4"
                style={{ textAlign: joinAlignment as any }}
              >
                {/* Avatar */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  I
                </div>
                <div className="min-w-0 flex-1">
                  <h3 
                    className="font-semibold text-xs sm:text-xs md:text-sm truncate"
                    style={{ color: darkMode ? '#FFFFFF' : '#374151' }}
                  >
                    {actualJoinTitle}
                  </h3>
                </div>
              </div>

              {/* Stats */}
              <div 
                className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 mb-3 md:mb-4"
                style={{ textAlign: joinAlignment as any }}
              >
                <div 
                  className={`rounded-lg p-1.5 sm:p-2 md:p-3 text-center ${
                    darkMode ? 'bg-gray-600' : 'bg-gray-100'
                  }`}
                  style={{ backgroundColor: darkMode ? '#4B5563' : '#F3F4F6' }}
                >
                  <div 
                    className="text-sm sm:text-base md:text-lg font-bold"
                    style={{ color: darkMode ? '#FFFFFF' : '#374151' }}
                  >
                    {statsLoading ? '...' : (() => {
                      const members = communityStats.totalMembers;
                      if (isNaN(members) || members === null || members === undefined) {
                        return '0k';
                      }
                      return `${Math.floor(members / 1000)}k`;
                    })()}
                  </div>
                  <div 
                    className="text-[10px] sm:text-xs md:text-xs"
                    style={{ color: darkMode ? '#FFFFFF' : '#374151' }}
                  >
                    Members
                  </div>
                </div>
                <div 
                  className={`rounded-lg p-2 md:p-3 text-center ${
                    darkMode ? 'bg-gray-600' : 'bg-gray-100'
                  }`}
                  style={{ backgroundColor: darkMode ? '#4B5563' : '#F3F4F6' }}
                >
                  <div 
                    className="text-base md:text-lg font-bold"
                    style={{ color: darkMode ? '#FFFFFF' : '#374151' }}
                  >
                    {statsLoading ? '...' : (() => {
                      const support = communityStats.supportLevel;
                      if (!support || support === 'undefined' || support === 'null') {
                        return '24/7';
                      }
                      return support;
                    })()}
                  </div>
                  <div 
                    className="text-[10px] sm:text-xs md:text-xs"
                    style={{ color: darkMode ? '#FFFFFF' : '#374151' }}
                  >
                    Support
                  </div>
                </div>
                <div 
                  className={`rounded-lg p-2 md:p-3 text-center ${
                    darkMode ? 'bg-gray-600' : 'bg-gray-100'
                  }`}
                  style={{ backgroundColor: darkMode ? '#4B5563' : '#F3F4F6' }}
                >
                  <div 
                    className="text-base md:text-lg font-bold"
                    style={{ color: darkMode ? '#FFFFFF' : '#374151' }}
                  >
                    {statsLoading ? '...' : (() => {
                      const courses = communityStats.totalCourses;
                      if (isNaN(courses) || courses === null || courses === undefined) {
                        return '0';
                      }
                      return courses.toString();
                    })()}
                  </div>
                  <div 
                    className="text-[10px] sm:text-xs md:text-xs"
                    style={{ color: darkMode ? '#FFFFFF' : '#374151' }}
                  >
                    Courses
                  </div>
                </div>
              </div>

              {/* Price Display */}
              <div 
                className="w-full py-3 rounded-t-lg text-white text-sm font-bold mb-0"
                style={{ backgroundColor: secondaryColor }}
              >
                <div className="text-center">
                  {(actualCommunityType === 'free' || actualPrice === 0) ? 'Free' : `$${actualPrice}/month`}
                </div>
              </div>

              {/* Join Button */}
              <button 
                className="w-full py-3 rounded-b-lg text-white text-sm font-bold mb-3 transition-all hover:opacity-90 shadow-md"
                style={{ backgroundColor: '#5C3E8C' }}
                disabled={paymentStatus.isProcessing}
                onClick={async (e) => {
                  e.stopPropagation();
                  
                  onJoinClick?.();
                  
                  if (actualCommunityType === 'free') {
                    // For free communities, redirect to signup
                    try {
                      const pending = {
                        subdirectory: window.location.hostname.split('.')[0],
                        communityName: 'this community',
                        instructorName: 'Instructor',
                        timestamp: Date.now(),
                      };
                      localStorage.setItem('pendingCommunityJoin', JSON.stringify(pending));
                    } catch (error) {
                    }
                    window.location.href = '/signup/student';
                  } else {
                    // For paid communities, handle payment
                    if (publicViewData?.instructorId && publicViewData?.communityId && actualPrice) {
                      try {
                        const paymentData: PaymentData = {
                          communityId: publicViewData.communityId,
                          instructorId: publicViewData.instructorId,
                          amount: Number(actualPrice),
                          currency: 'usd',
                          description: `Join ${actualJoinTitle} - Monthly Subscription`,
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
                {paymentStatus.isProcessing 
                  ? 'PROCESSING...' 
                  : actualCommunityType === 'free' 
                    ? 'JOIN FOR FREE' 
                    : joinButtonText}
              </button>

              {/* Trial Text - Only show for free communities */}
              {actualCommunityType === 'free' && (
                <p 
                  className="text-xs text-center"
                  style={{ color: darkMode ? '#FFFFFF' : '#374151' }}
                >
                  Free to join • No credit card required
                </p>
              )}
            </>
          )}
        </div>

        {/* Right Section - Join or About based on position */}
        <div 
          className="p-3 md:p-4 cursor-pointer hover:bg-opacity-90 transition-all rounded-b-xl md:rounded-r-xl md:rounded-b-none m-1 md:m-0 w-full md:w-[35%]"
          style={{
            backgroundColor: position === 'about-left' 
              ? (darkMode ? '#374151' : '#F8F9FA') 
              : (darkMode ? '#1F2937' : '#FFFFFF'),
            color: position === 'about-left' 
              ? (darkMode ? '#FFFFFF' : '#374151') 
              : (darkMode ? '#FFFFFF' : '#000000'),
            borderRadius: position === 'about-left' ? '12px' : '12px'
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (position === 'about-left') {
              onJoinClick?.();
            } else {
              onAboutClick?.();
            }
          }}
        >
          {position === 'about-left' ? (
            // Join Community content
            <>
              <div 
                className="flex items-center space-x-3 mb-4"
                style={{ textAlign: joinAlignment as any }}
              >
                {/* Avatar */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  I
                </div>
                <div className="min-w-0 flex-1">
                  <h3 
                    className="font-semibold text-xs sm:text-xs md:text-sm truncate"
                    style={{ color: darkMode ? '#FFFFFF' : '#374151' }}
                  >
                    {actualJoinTitle}
                  </h3>
                </div>
              </div>

              {/* Stats */}
              <div 
                className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 mb-3 md:mb-4"
                style={{ textAlign: joinAlignment as any }}
              >
                <div 
                  className={`rounded-lg p-1.5 sm:p-2 md:p-3 text-center ${
                    darkMode ? 'bg-gray-600' : 'bg-gray-100'
                  }`}
                  style={{ backgroundColor: darkMode ? '#4B5563' : '#F3F4F6' }}
                >
                  <div 
                    className="text-sm sm:text-base md:text-lg font-bold"
                    style={{ color: darkMode ? '#FFFFFF' : '#374151' }}
                  >
                    {statsLoading ? '...' : (() => {
                      const members = communityStats.totalMembers;
                      if (isNaN(members) || members === null || members === undefined) {
                        return '0k';
                      }
                      return `${Math.floor(members / 1000)}k`;
                    })()}
                  </div>
                  <div 
                    className="text-[10px] sm:text-xs md:text-xs"
                    style={{ color: darkMode ? '#FFFFFF' : '#374151' }}
                  >
                    Members
                  </div>
                </div>
                <div 
                  className={`rounded-lg p-2 md:p-3 text-center ${
                    darkMode ? 'bg-gray-600' : 'bg-gray-100'
                  }`}
                  style={{ backgroundColor: darkMode ? '#4B5563' : '#F3F4F6' }}
                >
                  <div 
                    className="text-base md:text-lg font-bold"
                    style={{ color: darkMode ? '#FFFFFF' : '#374151' }}
                  >
                    {statsLoading ? '...' : (() => {
                      const support = communityStats.supportLevel;
                      if (!support || support === 'undefined' || support === 'null') {
                        return '24/7';
                      }
                      return support;
                    })()}
                  </div>
                  <div 
                    className="text-[10px] sm:text-xs md:text-xs"
                    style={{ color: darkMode ? '#FFFFFF' : '#374151' }}
                  >
                    Support
                  </div>
                </div>
                <div 
                  className={`rounded-lg p-2 md:p-3 text-center ${
                    darkMode ? 'bg-gray-600' : 'bg-gray-100'
                  }`}
                  style={{ backgroundColor: darkMode ? '#4B5563' : '#F3F4F6' }}
                >
                  <div 
                    className="text-base md:text-lg font-bold"
                    style={{ color: darkMode ? '#FFFFFF' : '#374151' }}
                  >
                    {statsLoading ? '...' : (() => {
                      const courses = communityStats.totalCourses;
                      if (isNaN(courses) || courses === null || courses === undefined) {
                        return '0';
                      }
                      return courses.toString();
                    })()}
                  </div>
                  <div 
                    className="text-[10px] sm:text-xs md:text-xs"
                    style={{ color: darkMode ? '#FFFFFF' : '#374151' }}
                  >
                    Courses
                  </div>
                </div>
              </div>

              {/* Price Display */}
              <div 
                className="w-full py-3 rounded-t-lg text-white text-sm font-bold mb-0"
                style={{ backgroundColor: secondaryColor }}
              >
                <div className="text-center">
                  {(actualCommunityType === 'free' || actualPrice === 0) ? 'Free' : `$${actualPrice}/month`}
                </div>
              </div>

              {/* Join Button */}
              <button 
                className="w-full py-3 rounded-b-lg text-white text-sm font-bold mb-3 transition-all hover:opacity-90 shadow-md"
                style={{ backgroundColor: '#5C3E8C' }}
                disabled={paymentStatus.isProcessing}
                onClick={async (e) => {
                  e.stopPropagation();
                  onJoinClick?.();
                  
                  if (actualCommunityType === 'free') {
                    // For free communities, redirect to signup
                    try {
                      const pending = {
                        subdirectory: window.location.hostname.split('.')[0],
                        communityName: 'this community',
                        instructorName: 'Instructor',
                        timestamp: Date.now(),
                      };
                      localStorage.setItem('pendingCommunityJoin', JSON.stringify(pending));
                    } catch (error) {
                    }
                    window.location.href = '/signup/student';
                  } else {
                    // For paid communities, handle payment
                    if (publicViewData?.instructorId && publicViewData?.communityId && actualPrice) {
                      try {
                        const paymentData: PaymentData = {
                          communityId: publicViewData.communityId,
                          instructorId: publicViewData.instructorId,
                          amount: Number(actualPrice),
                          currency: 'usd',
                          description: `Join ${actualJoinTitle} - Monthly Subscription`,
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
                {paymentStatus.isProcessing 
                  ? 'PROCESSING...' 
                  : actualCommunityType === 'free' 
                    ? 'JOIN FOR FREE' 
                    : joinButtonText}
              </button>

              {/* Trial Text - Only show for free communities */}
              {actualCommunityType === 'free' && (
                <p 
                  className="text-xs text-center"
                  style={{ color: darkMode ? '#FFFFFF' : '#374151' }}
                >
                  Free to join • No credit card required
                </p>
              )}
            </>
          ) : (
            // About content
            <>
              <h2 
                className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4"
                style={{ color: darkMode ? '#FFFFFF' : '#000000' }}
              >
                {aboutTitle}
              </h2>
              <p 
                className="mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm md:text-base leading-relaxed"
                style={{ color: darkMode ? '#FFFFFF' : '#000000' }}
              >
                {aboutDescription}
              </p>
              
              <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                {aboutFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start sm:items-center space-x-2 sm:space-x-2.5 md:space-x-3">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="text-xs sm:text-sm md:text-base leading-snug sm:leading-normal" style={{ color: darkMode ? '#FFFFFF' : '#000000' }}>{feature}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
