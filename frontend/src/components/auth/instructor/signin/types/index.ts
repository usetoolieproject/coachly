export interface SignInFormData {
  firstName: string;
  lastName: string;
  email: string;
  businessName: string;
  password: string;
  confirmPassword: string;
  promoCode: string;
  rememberMe: boolean;
  agreeToTerms: boolean;
  selectedPlan: string | null;
}

export interface SignInErrors {
  [key: string]: string;
}

export type AuthMode = "login" | "signup";

