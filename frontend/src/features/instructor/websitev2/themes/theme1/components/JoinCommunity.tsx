import React from 'react';
import { usePayment } from '../../../hooks/usePayment';
import { PaymentData } from '../../../services/paymentService';
import { useDesignColors } from '../../../hooks/useDesignColors';

interface JoinCommunityProps {
  title?: string;
  members?: number;
  support?: string;
  courses?: number;
  price?: number;
  buttonText?: string;
  trialText?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  priceColor?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export const JoinCommunity: React.FC<JoinCommunityProps> = ({
  title = "Ins Tructor's Learning Community",
  members = 0,
  support = '24/7',
  courses = 8,
  price = 2,
  buttonText = 'JOIN COMMUNITY',
  backgroundColor = '#FFFFFF',
  textColor = '#000000',
  isSelected = false,
  onClick
}) => {
  const { paymentStatus, handleCommunityPayment } = usePayment();
  const { primaryColor, secondaryColor } = useDesignColors();
  
  return (
    <div 
      className={`p-6 rounded-xl shadow-sm border border-gray-100 bg-white transition-all cursor-pointer ${
        isSelected 
          ? 'border-purple-500 ring-2 ring-purple-200' 
          : 'border-gray-200 hover:border-purple-300'
      }`}
      style={{ backgroundColor }}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3 mb-4">
        {/* Avatar */}
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          I
        </div>
        <div>
          <h3 
            className="font-semibold text-lg text-gray-800"
            style={{ color: textColor }}
          >
            {title}
          </h3>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center bg-gray-50 border border-gray-200 rounded-lg p-2">
          <div 
            className="text-xl font-bold text-gray-800"
            style={{ color: textColor }}
          >
            {members}k
          </div>
          <div 
            className="text-xs text-gray-600"
            style={{ color: textColor }}
          >
            Members
          </div>
        </div>
        <div className="text-center bg-gray-50 border border-gray-200 rounded-lg p-2">
          <div 
            className="text-xl font-bold text-gray-800"
            style={{ color: textColor }}
          >
            {support}
          </div>
          <div 
            className="text-xs text-gray-600"
            style={{ color: textColor }}
          >
            Support
          </div>
        </div>
        <div className="text-center bg-gray-50 border border-gray-200 rounded-lg p-2">
          <div 
            className="text-xl font-bold text-gray-800"
            style={{ color: textColor }}
          >
            {courses}
          </div>
          <div 
            className="text-xs text-gray-600"
            style={{ color: textColor }}
          >
            Courses
          </div>
        </div>
      </div>

      {/* Price */}
      <div 
        className="text-center mb-4 px-4 py-3 rounded-lg"
        style={{ backgroundColor: secondaryColor }}
      >
        <span className="text-white font-bold text-lg">
          ${price}/month
        </span>
      </div>

      {/* Join Button */}
      <button 
        className="w-full py-3 rounded-lg font-bold text-white mb-2 transition-colors hover:opacity-90"
        style={{ backgroundColor: primaryColor }}
        disabled={paymentStatus.isProcessing}
        onClick={async (e) => {
          e.stopPropagation();
          onClick?.();
          
          if (price === 0) {
            // For free communities, redirect to signup
            try {
              const pending = {
                subdirectory: window.location.hostname.split('.')[0],
                communityName: title,
                instructorName: 'Instructor',
                timestamp: Date.now(),
              };
              localStorage.setItem('pendingCommunityJoin', JSON.stringify(pending));
            } catch (error) {
              console.error('Error storing pending join:', error);
            }
            window.location.href = '/signup/student';
          } else {
            // For paid communities, handle payment
            try {
              const paymentData: PaymentData = {
                communityId: 'community-id', // This should come from props
                instructorId: 'instructor-id', // This should come from props
                amount: price,
                currency: 'usd',
                description: `Join ${title} - Monthly Subscription`,
              };
              await handleCommunityPayment(paymentData);
            } catch (error) {
              console.error('Payment error:', error);
            }
          }
        }}
      >
        {paymentStatus.isProcessing 
          ? 'PROCESSING...' 
          : price === 0 
            ? 'JOIN FOR FREE' 
            : buttonText}
      </button>

      {/* Trial Text - Only show for free communities */}
      {price === 0 && (
        <p 
          className="text-xs text-center text-gray-500"
          style={{ color: textColor }}
        >
          Free to join • No credit card required
        </p>
      )}
    </div>
  );
};
