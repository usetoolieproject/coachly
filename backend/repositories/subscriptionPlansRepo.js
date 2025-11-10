import { getSupabaseClient } from './supabaseClient.js';

const supabase = getSupabaseClient();

export const subscriptionPlansRepo = {
  async createPlan(planData) {
    const { data, error } = await supabase
      .from('subscription_plans')
      .insert(planData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getAllPlans() {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getActivePlans() {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .eq('is_visible', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  async updatePlan(id, planData) {
    const { data, error } = await supabase
      .from('subscription_plans')
      .update(planData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deactivatePlan(id) {
    const { data, error } = await supabase
      .from('subscription_plans')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async togglePromo(id, promoEnabled) {
    const { data, error } = await supabase
      .from('subscription_plans')
      .update({ promo_enabled: promoEnabled, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async toggleVisibility(id, isVisible) {
    const { data, error } = await supabase
      .from('subscription_plans')
      .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async findByCondition(condition) {
    let query = supabase.from('subscription_plans').select('*');
    for (const [key, value] of Object.entries(condition)) {
      query = query.eq(key, value);
    }
    const { data, error } = await query.single();
    if (error) throw error;
    return { data };
  }
};
