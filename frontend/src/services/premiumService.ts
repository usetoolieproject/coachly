import { apiFetch } from './api';

export interface PremiumStatus {
  premium_starts?: string;
  premium_ends?: string;
  isActive: boolean;
  isTrial?: boolean;
  isCancelled?: boolean;
}

export class PremiumService {
  static async getInstructorPremiumStatus(instructorId: string): Promise<PremiumStatus> {
    try {
      return await apiFetch('/instructor/premium-status');
    } catch (error) {
      console.error('Error fetching instructor premium status:', error);
      return { isActive: false };
    }
  }

  static async checkMyPremiumStatus(): Promise<PremiumStatus> {
    try {
      return await apiFetch('/instructor/premium-status');
    } catch (error) {
      console.error('Error fetching premium status:', error);
      return { isActive: false };
    }
  }

  static calculateDaysRemaining(premiumEnds?: string): number {
    if (!premiumEnds) return 0;
    
    const now = new Date();
    const endDate = new Date(premiumEnds);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  static isPremiumExpired(premiumEnds?: string): boolean {
    if (!premiumEnds) return false;
    return new Date() > new Date(premiumEnds);
  }
}
