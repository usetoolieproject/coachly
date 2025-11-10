import { getApiBase, getAuthHeaders, apiFetch } from '../../../../services/api';
import type { StripeConnectStatus, OnboardResponse } from '../types';

export const connectService = {
  async getStatus(): Promise<StripeConnectStatus> {
    return await apiFetch(`/connect/status`, { headers: getAuthHeaders() });
  },

  async startOnboarding(): Promise<OnboardResponse> {
    return await apiFetch(`/connect/onboard`, { method: 'POST', headers: getAuthHeaders() });
  },

  async resumeOnboarding(): Promise<OnboardResponse> {
    return await apiFetch(`/connect/relink`, { method: 'POST', headers: getAuthHeaders() });
  },

  async disconnect(): Promise<{ success: boolean }> {
    return await apiFetch(`/connect/disconnect`, { method: 'POST', headers: getAuthHeaders() });
  },
};


