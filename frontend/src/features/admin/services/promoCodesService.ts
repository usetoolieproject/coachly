import { apiFetch, getAuthHeaders } from '../../../services/api';
import type { PromoCode } from '../types';

export const promoCodesService = {
  async list(): Promise<PromoCode[]> {
    return await apiFetch<PromoCode[]>('/admin/promo-codes', {
      headers: getAuthHeaders(),
    });
  },

  async generate(payload: any): Promise<PromoCode[]> {
    return await apiFetch<PromoCode[]>('/admin/promo-codes/generate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
  },

  async deactivate(id: string): Promise<PromoCode> {
    return await apiFetch<PromoCode>(`/admin/promo-codes/${id}/deactivate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  async toggle(id: string, isActive: boolean): Promise<PromoCode> {
    return await apiFetch<PromoCode>(`/admin/promo-codes/${id}/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isActive }),
    });
  },

  async update(id: string, payload: Partial<PromoCode> & any): Promise<PromoCode> {
    return await apiFetch<PromoCode>(`/admin/promo-codes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
  },

  async remove(id: string): Promise<void> {
    await apiFetch(`/admin/promo-codes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },
};


