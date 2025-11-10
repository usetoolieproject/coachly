export { dashboardService } from '../../../../services/dashboardService';
import { apiFetch } from '../../../../services/api';

export const connectBalanceService = {
  async getBalance() {
    try {
      return await apiFetch('/connect/balance');
    } catch (error: any) {
      // If instructor is not connected to Stripe, return null instead of throwing
      if (error.message?.includes('not connected to Stripe')) {
        return null;
      }
      throw error;
    }
  }
};

export const connectRevenueService = {
  async getTimeseries(days: number) {
    try {
      return await apiFetch(`/connect/revenue-timeseries?days=${days}`);
    } catch (error: any) {
      // If instructor is not connected to Stripe, return null instead of throwing
      if (error.message?.includes('not connected to Stripe')) {
        return null;
      }
      throw error;
    }
  }
};


