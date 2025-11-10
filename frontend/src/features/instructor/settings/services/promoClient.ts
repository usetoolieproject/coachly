import { apiFetch, getAuthHeaders } from '../../../../services/api';

export const instructorPromoClient = {
  async getMyPromo() {
    return await apiFetch('/promo-codes/me', { headers: getAuthHeaders() });
  },
  async validate(code: string, planId?: string | null) {
    return await apiFetch('/promo-codes/validate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code, planId: planId || null }),
    });
  },
  async redeem(code: string, planId?: string | null) {
    return await apiFetch('/promo-codes/redeem', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code, planId: planId || null }),
    });
  },
  async removeMyPromo() {
    return await apiFetch('/promo-codes/me', {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },
};


