import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { FormField } from './FormField';
import { PasswordField } from './PasswordField';
import { PlanSelector } from './PlanSelector';
import { SignInFormData } from '../types';

interface SignInFormProps {
  mode: "login" | "signup";
  formData: SignInFormData;
  setFormData: (data: SignInFormData | ((prev: SignInFormData) => SignInFormData)) => void;
  showPassword: boolean;
  showConfirmPassword: boolean;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  errors: Record<string, string>;
  isCheckingSubdirectory?: boolean;
  subdirectoryChecked?: boolean;
  plans?: any[];
  plansLoading?: boolean;
  preSelectedPlanId?: string | null;
  promoCodeInfo?: {
    valid: boolean;
    discountPercent: number;
    discountAmount: number;
    message: string;
  } | null;
  isCheckingPromo?: boolean;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  mode,
  formData,
  setFormData,
  showPassword,
  showConfirmPassword,
  setShowPassword,
  setShowConfirmPassword,
  errors,
  isCheckingSubdirectory,
  subdirectoryChecked,
  plans = [],
  plansLoading = false,
  preSelectedPlanId,
  promoCodeInfo,
  isCheckingPromo,
}) => {
  // Get plan info from sessionStorage for instant display, fallback to plans array when loaded
  const planFromStorage = preSelectedPlanId && typeof window !== 'undefined'
    ? {
        id: preSelectedPlanId,
        name: sessionStorage.getItem('selectedPlanName') || '',
        price: Number(sessionStorage.getItem('selectedPlanPrice') || 0)
      }
    : null;
  
  const planFromApi = preSelectedPlanId && plans.length > 0 
    ? plans.find(p => p.id === preSelectedPlanId)
    : null;
  
  // Use API data when available (more accurate), otherwise use sessionStorage (instant)
  const selectedPlanInfo = planFromApi || planFromStorage;
  return (
    <>
    <div className="mb-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        {mode === "login" ? "Sign in to your account" : ""}
      </h2>
    </div>

    {mode === "signup" && (
      <>
        {preSelectedPlanId ? (
          selectedPlanInfo ? (
            <div className="mb-5 flex items-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200/60 rounded-full">
                <svg className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-semibold text-purple-700">{selectedPlanInfo.name}</span>
                <span className="text-xs text-purple-500 font-medium">•</span>
                <span className="text-xs text-purple-600 font-semibold">${selectedPlanInfo.price}</span>
                <span className="text-xs text-purple-500 font-medium">one-time</span>
              </div>
            </div>
          ) : (
            <div className="mb-5 flex items-center">
              <div className="h-7 w-36 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          )
        ) : (
          <>
            {/* Plan Selection */}
            {plans && plans.length > 0 ? (
              <PlanSelector
                selectedPlan={formData.selectedPlan}
                onPlanSelect={(planId) => setFormData(prev => ({ ...prev, selectedPlan: planId }))}
                plans={plans}
                isLoading={plansLoading}
              />
            ) : (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-700 mb-2 font-medium">Loading plans...</p>
              </div>
            )}
            {errors.selectedPlan && (
              <p className="text-red-500 text-xs mt-1 mb-4">{errors.selectedPlan}</p>
            )}
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            placeholder="John"
            error={errors.firstName}
            showIcon={false}
          />
          <FormField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            placeholder="Doe"
            error={errors.lastName}
            showIcon={false}
          />
        </div>

        <FormField
          label="Business/Company Name"
          name="businessName"
          value={formData.businessName}
          onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
          placeholder="Company Name"
          error={errors.businessName}
          showIcon={false}
        />

        {isCheckingSubdirectory && (
          <p className="text-sm text-gray-500 mt-1">Checking availability...</p>
        )}
        {formData.businessName.trim() && !errors.businessName && !isCheckingSubdirectory && subdirectoryChecked && (
          <p className="text-green-600 text-xs mt-1">✓ Business name is available</p>
        )}

        <FormField
          label="Email address"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="you@company.com"
          icon={Mail}
          error={errors.email}
        />

        <div className="grid grid-cols-2 gap-4">
          <PasswordField
            label="Create password"
            name="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            error={errors.password}
            showToggle={false}
          />
          <PasswordField
            label="Confirm password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirmPassword}
            showToggle={false}
          />
        </div>

        <div>
          <FormField
            label="Promo Code (optional)"
            name="promoCode"
            value={formData.promoCode}
            onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
            placeholder="Promo Code"
            showIcon={false}
          />
          {isCheckingPromo && (
            <p className="text-xs text-gray-500 mt-1">Checking promo code...</p>
          )}
          {promoCodeInfo && !isCheckingPromo && (
            <div className={`mt-2 p-3 rounded-lg flex items-start gap-2 ${
              promoCodeInfo.valid 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {promoCodeInfo.valid ? (
                <>
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800">
                      {promoCodeInfo.discountPercent === 100 ? '🎉 100% Discount - Free!' : `${promoCodeInfo.discountPercent}% Discount Applied!`}
                    </p>
                    {promoCodeInfo.discountAmount > 0 && (
                      <p className="text-xs text-green-700 mt-0.5">
                        You save ${promoCodeInfo.discountAmount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{promoCodeInfo.message}</p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            checked={formData.agreeToTerms}
            onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
            className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
            I agree to the{' '}
            <Link to="/terms" className="text-purple-600 hover:text-purple-700 underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-purple-600 hover:text-purple-700 underline">
              Privacy Policy
            </Link>
            .
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-red-500 text-xs mt-1">{errors.agreeToTerms}</p>
        )}
      </>
    )}

    {mode === "login" && (
      <>
        <FormField
          label="Email address"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="you@company.com"
          icon={Mail}
          error={errors.email}
        />

        <PasswordField
          label="Password"
          name="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          error={errors.password}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember-me"
              checked={formData.rememberMe}
              onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
              Remember me
            </label>
          </div>
          <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700">
            Forgot password?
          </Link>
        </div>
      </>
    )}
    </>
  );
};

