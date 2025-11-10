import React, { useEffect, useState } from 'react';
import { instructorPromoClient } from '../features/instructor/settings/services/promoClient';
import { getCookie, deleteCookie } from '../utils/cookieUtils';
import { useQueryClient } from '@tanstack/react-query';

export const PromoCodeHandler: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handlePendingPromoCode = async () => {
      const pendingCode = getCookie('pendingPromoCode');
      
      if (pendingCode && !isProcessing) {
        setIsProcessing(true);
        
        try {
          // Add a small delay to ensure authentication is fully established on the subdomain
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          await instructorPromoClient.redeem(pendingCode, null);
          
          // Clear the pending promo code
          deleteCookie('pendingPromoCode');
          
          // Invalidate subscription status query to trigger refetch
          queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
        } catch (e) {
          // Clear the pending promo code even if it failed to avoid retry loops
          deleteCookie('pendingPromoCode');
        } finally {
          setIsProcessing(false);
        }
      }
    };

    handlePendingPromoCode();
  }, [isProcessing]);

  // This component doesn't render anything
  return null;
};
