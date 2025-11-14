import { promoCodesRepo } from '../repositories/promoCodesRepo.js';
import { getSupabaseClient } from '../repositories/supabaseClient.js';

const ALLOWED_PERCENTS = [10, 20, 25, 50, 75, 100];

const generateRandomCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part = '';
  for (let i = 0; i < 8; i++) part += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `PROMO-${part}`;
};

const normalizeCreateInput = (body) => {
  const input = {
    type: body.type, // 'discount' | 'duration'
    discountPercent: body.discount_percent ?? body.discountPercent ?? null,
    freeMonths: body.free_months ?? body.freeMonths ?? null,
    planId: body.plan_id ?? body.planId ?? null,
    customCode: body.custom_code ?? body.customCode ?? null,
    maxUses: body.max_uses ?? body.maxUses ?? null,
    expiresAt: body.expires_at ?? body.expiresAt ?? null,
  };
  return input;
};

export const listPromoCodes = async (req, res) => {
  try {
    const { activeOnly, planId } = req.query;
    const codes = await promoCodesRepo.listCodes({
      activeOnly: String(activeOnly).toLowerCase() === 'true',
      planId: planId === 'null' ? null : planId || undefined,
    });
    res.json(codes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list promo codes' });
  }
};

export const generatePromoCodes = async (req, res) => {
  try {
    const input = normalizeCreateInput(req.body);

    if (!['discount', 'duration'].includes(input.type)) {
      return res.status(400).json({ error: 'Invalid promo type' });
    }
    if (input.type === 'discount') {
      if (!ALLOWED_PERCENTS.includes(Number(input.discountPercent))) {
        return res.status(400).json({ error: 'Invalid discount percent' });
      }
    } else {
      if (!input.freeMonths || Number(input.freeMonths) < 1) {
        return res.status(400).json({ error: 'freeMonths must be >= 1' });
      }
    }
    const baseRow = {
      type: input.type,
      discount_percent: input.type === 'discount' ? Number(input.discountPercent) : null,
      free_months: input.type === 'duration' ? Number(input.freeMonths) : null,
      plan_id: input.planId || null,
      max_uses: input.maxUses != null && input.maxUses !== '' ? Number(input.maxUses) : null,
      expires_at: input.expiresAt || null,
      is_active: true,
      created_by_admin_id: req.user?.id || null,
    };

    const row = { ...baseRow, code: input.customCode ? String(input.customCode).trim().toUpperCase() : generateRandomCode() };
    const created = await promoCodesRepo.createCodes([row]);
    res.status(201).json(created);
  } catch (err) {
    // Likely unique violation on code
    res.status(400).json({ error: err.message || 'Failed to generate promo codes' });
  }
};

export const deactivatePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await promoCodesRepo.deactivateCode(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to deactivate promo code' });
  }
};

export const togglePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, isActive } = req.body;
    const updated = await promoCodesRepo.toggleActive(id, is_active ?? isActive);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle promo code' });
  }
};

export const updatePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    if (req.body.type) updates.type = req.body.type;
    if (req.body.discount_percent != null || req.body.discountPercent != null) updates.discount_percent = req.body.discount_percent ?? req.body.discountPercent;
    if (req.body.free_months != null || req.body.freeMonths != null) updates.free_months = req.body.free_months ?? req.body.freeMonths;
    if (req.body.plan_id !== undefined || req.body.planId !== undefined) updates.plan_id = req.body.plan_id ?? req.body.planId;
    if (req.body.max_uses !== undefined || req.body.maxUses !== undefined) updates.max_uses = req.body.max_uses ?? req.body.maxUses;
    if (req.body.expires_at !== undefined || req.body.expiresAt !== undefined) updates.expires_at = req.body.expires_at ?? req.body.expiresAt;
    if (req.body.code) updates.code = String(req.body.code).toUpperCase();
    const updated = await promoCodesRepo.updateCode(id, updates);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update promo code' });
  }
};

export const deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    await promoCodesRepo.deleteCode(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete promo code' });
  }
};

// Instructor-side endpoints (for later wiring)
export const validatePromoCode = async (req, res) => {
  try {
    const { code, planId } = req.body;
    const pc = await promoCodesRepo.getByCode(String(code).trim().toUpperCase());
    if (!pc || !pc.is_active) return res.status(404).json({ valid: false, reason: 'invalid' });
    if (pc.expires_at && new Date(pc.expires_at) < new Date()) {
      return res.status(400).json({ valid: false, reason: 'expired' });
    }
    if (pc.max_uses != null && pc.used_count >= pc.max_uses) {
      return res.status(400).json({ valid: false, reason: 'exhausted' });
    }
    if (pc.plan_id && planId && pc.plan_id !== planId) {
      return res.status(400).json({ valid: false, reason: 'plan_mismatch' });
    }
    res.json({ valid: true, promo: pc });
  } catch (err) {
    res.status(500).json({ error: 'Failed to validate promo code' });
  }
};

export const redeemPromoCode = async (req, res) => {
  try {
    console.log('🎟️ Redeem promo code request:', { user: req.user?.email, body: req.body });
    const instructorId = req.user?.instructors?.[0]?.id;
    if (!instructorId) {
      console.log('❌ No instructor ID found');
      return res.status(403).json({ error: 'Instructor required' });
    }
    const { code, planId } = req.body;
    console.log('🔍 Looking up promo code:', code);
    const pc = await promoCodesRepo.getByCode(String(code).trim().toUpperCase());
    console.log('📋 Promo code found:', pc ? { id: pc.id, code: pc.code, isActive: pc.is_active } : 'NOT FOUND');
    if (!pc || !pc.is_active) return res.status(404).json({ error: 'Invalid code' });
    if (pc.expires_at && new Date(pc.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Promo code expired' });
    }
    if (pc.max_uses != null && pc.used_count >= pc.max_uses) {
      return res.status(400).json({ error: 'Promo code usage limit reached' });
    }
    if (pc.plan_id && planId && pc.plan_id !== planId) {
      return res.status(400).json({ error: 'Promo code not applicable to this plan' });
    }
    // If instructor already redeemed a different code, allow replacement automatically
    const existing = await promoCodesRepo.getRedemptionForInstructor(instructorId);
    if (existing && existing.promo_code_id && existing.promo_code_id !== pc.id) {
      // Remove old redemption without decrementing usage
      await promoCodesRepo.deleteRedemptionForInstructor(instructorId);
    } else if (existing && existing.promo_code_id === pc.id) {
      return res.status(409).json({ error: 'You have already used this promo code' });
    }
    await promoCodesRepo.redeemCode({ codeId: pc.id, instructorId, planId: planId || null });

    // Auto-activate free-duration promos by creating a free subscription row
    if (pc.type === 'duration') {
      const supabase = getSupabaseClient();
      // If instructor already has an active subscription that is NOT cancelling, do not create another
      const { data: existing, error: existErr } = await supabase
        .from('subscriptions')
        .select('id, cancel_at_period_end')
        .eq('instructor_id', instructorId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);
      const existingActive = Array.isArray(existing) ? existing[0] : null;
      if (!existErr && (!existingActive || existingActive.cancel_at_period_end)) {
        const months = Number(pc.free_months || 0);
        const now = new Date();
        const end = new Date(now.getTime());
        end.setMonth(end.getMonth() + (months > 0 ? months : 1));
        const fakeStripeId = `FREE-${pc.id}-${Date.now()}`;
        await supabase
          .from('subscriptions')
          .insert({
            instructor_id: instructorId,
            stripe_subscription_id: fakeStripeId,
            stripe_customer_id: null,
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: end.toISOString(),
            cancel_at_period_end: false,
            plan_id: planId || null,
            original_price_cents: 0,
            has_promo: true,
            promo_end_date: end.toISOString(),
          });
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to redeem promo code' });
  }
};

export const getMyPromo = async (req, res) => {
  try {
    const instructorId = req.user?.instructors?.[0]?.id;
    if (!instructorId) return res.status(403).json({ error: 'Instructor required' });
    const redemption = await promoCodesRepo.getRedemptionForInstructor(instructorId);
    res.json(redemption);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch instructor promo' });
  }
};

export const removeMyPromo = async (req, res) => {
  try {
    const instructorId = req.user?.instructors?.[0]?.id;
    if (!instructorId) return res.status(403).json({ error: 'Instructor required' });
    const supabase = getSupabaseClient();
    // Remove any free-subscription created by a duration promo (identified by FREE- prefix)
    const { data: freeSubs } = await supabase
      .from('subscriptions')
      .select('id, stripe_subscription_id')
      .eq('instructor_id', instructorId)
      .eq('status', 'active');
    if (Array.isArray(freeSubs)) {
      for (const s of freeSubs) {
        if (String(s.stripe_subscription_id || '').startsWith('FREE-')) {
          await supabase
            .from('subscriptions')
            .update({ status: 'canceled', cancel_at_period_end: true, updated_at: new Date().toISOString() })
            .eq('id', s.id);
        }
      }
    }
    await promoCodesRepo.deleteRedemptionForInstructor(instructorId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove promo' });
  }
};


