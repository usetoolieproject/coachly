import { getSupabaseClient } from './supabaseClient.js';

const supabase = getSupabaseClient();

/**
 * Repository for promo codes CRUD and validation.
 * Note: Validation and redemption invariants should also be enforced in controllers.
 */
export const promoCodesRepo = {
  async listCodes({ activeOnly, planId } = {}) {
    let q = supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (activeOnly) q = q.eq('is_active', true);
    if (planId === null) q = q.is('plan_id', null);
    if (planId) q = q.eq('plan_id', planId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async createCodes(rows) {
    const { data, error } = await supabase
      .from('promo_codes')
      .insert(rows)
      .select();
    if (error) throw error;
    return data || [];
  },

  async deactivateCode(id) {
    const { data, error } = await supabase
      .from('promo_codes')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async toggleActive(id, isActive) {
    const { data, error } = await supabase
      .from('promo_codes')
      .update({ is_active: !!isActive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCode(id, updates) {
    const { data, error } = await supabase
      .from('promo_codes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCode(id) {
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getByCode(code) {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code)
      .single();
    if (error) throw error;
    return data;
  },

  async hasInstructorRedeemed(codeId, instructorId) {
    const { data, error } = await supabase
      .from('promo_redemptions')
      .select('id')
      .eq('promo_code_id', codeId)
      .eq('instructor_id', instructorId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },

  async redeemCode({ codeId, instructorId, planId }) {
    // Guard used_count < max_uses (or null for unlimited)
    const { data: guarded, error: guardError } = await supabase
      .from('promo_codes')
      .update({ used_count: supabase.rpc ? undefined : undefined })
      .eq('id', codeId)
      .lt('used_count', supabase.literal ? supabase.literal('coalesce(max_uses, 999999999)') : 2147483647) // best-effort; strict check handled with select below
      .select()
      .single();
    if (guardError && guardError.code !== 'PGRST116') {
      // ignore if conditional update not supported; we'll check again below
    }

    // Fetch current counts and limits to verify
    const { data: code, error } = await supabase
      .from('promo_codes')
      .select('id, max_uses, used_count')
      .eq('id', codeId)
      .single();
    if (error) throw error;
    if (code.max_uses != null && code.used_count >= code.max_uses) {
      throw new Error('Promo code usage limit reached');
    }

    // Insert redemption and increment usage in a best-effort sequence.
    const { error: insertErr } = await supabase
      .from('promo_redemptions')
      .insert({ promo_code_id: codeId, instructor_id: instructorId, plan_id: planId });
    if (insertErr) throw insertErr;

    const { error: incErr } = await supabase
      .from('promo_codes')
      .update({ used_count: (code.used_count || 0) + 1, updated_at: new Date().toISOString() })
      .eq('id', codeId);
    if (incErr) throw incErr;
  },

  async getRedemptionForInstructor(instructorId) {
    const { data, error } = await supabase
      .from('promo_redemptions')
      .select('id, promo_code_id, plan_id, redeemed_at, promo_codes:promo_code_id(*)')
      .eq('instructor_id', instructorId)
      .order('redeemed_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  },

  async deleteRedemptionForInstructor(instructorId) {
    const { data, error } = await supabase
      .from('promo_redemptions')
      .select('id, promo_code_id')
      .eq('instructor_id', instructorId)
      .order('redeemed_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const codeId = data.promo_code_id;
    const { error: delErr } = await supabase
      .from('promo_redemptions')
      .delete()
      .eq('id', data.id);
    if (delErr) throw delErr;
    return true;
  },
};


