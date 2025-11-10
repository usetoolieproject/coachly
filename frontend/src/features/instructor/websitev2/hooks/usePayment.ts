import { useState } from 'react';
import { PaymentData, PaymentStatus } from '../services/paymentService';
import { PaymentService } from '../services/paymentService';

export const usePayment = () => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    isProcessing: false,
    error: null,
    success: false,
  });

  const handleCommunityPayment = async (paymentData: PaymentData) => {
    try {
      setPaymentStatus({
        isProcessing: true,
        error: null,
        success: false,
      });
      
      const checkoutSession = await PaymentService.createCommunityCheckoutSession(paymentData);
      
      // Store pending community join for signup page
      try {
        const pending = {
          subdirectory: window.location.hostname.split('.')[0],
          communityName: 'this community',
          instructorName: 'Instructor',
          timestamp: Date.now(),
        };
        localStorage.setItem('pendingCommunityJoin', JSON.stringify(pending));
      } catch (error) {
        // removed console.error('Error storing pending join:', error);
      }
      
      // Redirect to Stripe checkout
      PaymentService.redirectToCheckout(checkoutSession.url);
      
    } catch (error) {
      // removed console.error('Payment error:', error);
      setPaymentStatus({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Payment failed',
        success: false,
      });
    }
  };

  const handleFreeSignup = (communityId?: string) => {
    // For free communities, store pending community join before redirecting
    try {
      // Extract subdirectory from hostname (e.g., "instructor" from "instructor.usecoachly.com")
      const subdirectory = window.location.hostname.split('.')[0];
      
      const pending = {
        subdirectory: subdirectory,
        communityName: 'this community', // Will be populated from backend or context
        instructorName: 'Instructor', // Will be populated from backend or context
        timestamp: Date.now(),
      };
      localStorage.setItem('pendingCommunityJoin', JSON.stringify(pending));
    } catch (error) {
      // removed console.error('Error storing pending join:', error);
    }
    
    // Redirect directly to signup
    const signupUrl = `/signup/student?community=${communityId || 'free'}`;
    window.location.href = signupUrl;
  };

  const clearPaymentError = () => {
    setPaymentStatus(prev => ({
      ...prev,
      error: null,
    }));
  };

  const resetPaymentStatus = () => {
    setPaymentStatus({
      isProcessing: false,
      error: null,
      success: false,
    });
  };

  return {
    paymentStatus,
    handleCommunityPayment,
    handleFreeSignup,
    clearPaymentError,
    resetPaymentStatus,
  };
};
