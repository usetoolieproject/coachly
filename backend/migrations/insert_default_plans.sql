-- Insert default subscription plans (Basic and Pro)

-- Delete existing plans first (optional, uncomment if needed)
-- DELETE FROM subscription_plans;

-- Insert Basic Plan
INSERT INTO subscription_plans (
  id,
  name,
  description,
  base_price_cents,
  billing_interval,
  billing_interval_count,
  stripe_price_id,
  features,
  is_active,
  is_visible,
  display_order,
  promo_enabled,
  promo_discount_percent,
  promo_label,
  promo_description,
  created_at,
  updated_at
) VALUES (
  '3425044c-2a58-423f-a498-6bf5309c366c',
  'Basic',
  'Essential features for getting started',
  4900, -- $49.00
  'month',
  1,
  NULL, -- Add your Stripe Price ID here after creating it in Stripe
  ARRAY[
    'Professional Coach theme',
    'Up to 50 students',
    'Basic course management',
    'Email support',
    'Community features',
    'Basic analytics'
  ]::text[],
  true,
  true,
  1,
  false,
  0,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  base_price_cents = EXCLUDED.base_price_cents,
  billing_interval = EXCLUDED.billing_interval,
  billing_interval_count = EXCLUDED.billing_interval_count,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  is_visible = EXCLUDED.is_visible,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Insert Pro Plan
INSERT INTO subscription_plans (
  id,
  name,
  description,
  base_price_cents,
  billing_interval,
  billing_interval_count,
  stripe_price_id,
  features,
  is_active,
  is_visible,
  display_order,
  promo_enabled,
  promo_discount_percent,
  promo_label,
  promo_description,
  created_at,
  updated_at
) VALUES (
  '6e20a522-992f-449a-a6da-102ed32a552d',
  'Pro',
  'Advanced features for professional coaches',
  9900, -- $99.00
  'month',
  1,
  NULL, -- Add your Stripe Price ID here after creating it in Stripe
  ARRAY[
    'All Basic features',
    'All premium themes',
    'Unlimited students',
    'Advanced analytics',
    'Priority support',
    'Custom domain',
    'Video hosting',
    'Zoom integration',
    'White-label branding'
  ]::text[],
  true,
  true,
  2,
  false,
  0,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  base_price_cents = EXCLUDED.base_price_cents,
  billing_interval = EXCLUDED.billing_interval,
  billing_interval_count = EXCLUDED.billing_interval_count,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  is_visible = EXCLUDED.is_visible,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();
