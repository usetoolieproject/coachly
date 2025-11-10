export interface StripeConnectStatus {
  stripeAccountId?: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  needsVerification: boolean;
  requirementsCurrentlyDue: string[];
}

export interface OnboardResponse {
  url: string;
}


