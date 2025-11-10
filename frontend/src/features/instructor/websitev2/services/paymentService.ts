import { apiFetch } from '../../../../services/api';

export interface PaymentData {
  communityId: string;
  instructorId: string;
  amount: number;
  currency: string;
  description: string;
  subdomain?: string;
}

export interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

export interface PaymentStatus {
  isProcessing: boolean;
  error: string | null;
  success: boolean;
}

export class PaymentService {
  /**
   * Create a Stripe checkout session for community/invite payment
   */
  static async createCommunityCheckoutSession(paymentData: PaymentData): Promise<CheckoutSessionResponse> {
    try {
      return await apiFetch('/billing/community-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Redirect to Stripe checkout
   */
  static redirectToCheckout(checkoutUrl: string): void {
    window.location.href = checkoutUrl;
  }

  /**
   * Handle successful payment redirect
   */
  static handlePaymentSuccess(sessionId: string): void {
    // Store the session ID for verification
    localStorage.setItem('payment_session_id', sessionId);
    
    // Redirect to student signup with success flag
    const signupUrl = `/signup/student?payment_success=true&session_id=${sessionId}`;
    window.location.href = signupUrl;
  }

  /**
   * Handle cancelled payment
   */
  static handlePaymentCancelled(): void {
    // Redirect back to the invite page
    window.location.href = window.location.pathname;
  }

  /**
   * Verify payment session (optional - for additional security)
   */
  static async verifyPaymentSession(sessionId: string): Promise<boolean> {
    try {
      await apiFetch(`/billing/verify-session/${sessionId}`, { method: 'GET' });
      return true;
    } catch (error) {
      return false;
    }
  }
}
