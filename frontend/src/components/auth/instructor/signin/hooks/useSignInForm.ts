import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../../../contexts/AuthContext";
import { apiFetch } from "../../../../../services/api";
import { setCookie } from "../../../../../utils/cookieUtils";
import { SignInFormData, SignInErrors, AuthMode } from "../types";

export const useSignInForm = (initialMode: AuthMode = "login") => {
  const { login } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [formData, setFormData] = useState<SignInFormData>({
    firstName: "",
    lastName: "",
    email: "",
    businessName: "",
    password: "",
    confirmPassword: "",
    promoCode: "",
    rememberMe: false,
    agreeToTerms: false,
    selectedPlan: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<SignInErrors>({});
  const [isCheckingSubdirectory, setIsCheckingSubdirectory] = useState(false);
  const [subdirectoryChecked, setSubdirectoryChecked] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const checkSubdirectoryAvailability = async (subdirectory: string) => {
    if (!subdirectory.trim()) return true;
    
    try {
      const data = await apiFetch(`/auth/check-subdomain/${subdirectory}`);
      return data.available;
    } catch (error) {
      return false;
    }
  };

  // Debounced subdirectory check
  useEffect(() => {
    if (mode !== 'signup' || !formData.businessName.trim()) {
      setSubdirectoryChecked(false);
      return;
    }

    const subdirectory = formData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsCheckingSubdirectory(true);
      const isAvailable = await checkSubdirectoryAvailability(subdirectory);
      setIsCheckingSubdirectory(false);
      setSubdirectoryChecked(true);
      
      if (!isAvailable) {
        setErrors(prev => ({
          ...prev,
          businessName: "This business name is already taken. Please choose a different one."
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.businessName;
          return newErrors;
        });
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [formData.businessName, mode]);

  const validateForm = () => {
    const newErrors: SignInErrors = {};

    if (mode === "signup") {
      if (!formData.firstName.trim())
        newErrors.firstName = "First name is required";
      if (!formData.lastName.trim())
        newErrors.lastName = "Last name is required";
      if (!formData.businessName.trim())
        newErrors.businessName = "Business name is required";
      // Only require plan selection if not pre-selected (though it should always be set)
      if (!formData.selectedPlan)
        newErrors.selectedPlan = "Please select a plan";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
      if (!formData.agreeToTerms)
        newErrors.agreeToTerms = "You must agree to the terms";
    }

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Please enter a valid email";

    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (mode === "signup" && formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (mode === 'signup') {
        // Check if plan is selected
        if (!formData.selectedPlan) {
          setErrors({ submit: 'Please select a plan' });
          return;
        }

        // INSTRUCTOR SIGNUP - Create account directly (payment temporarily disabled)
        const signupResponse = await apiFetch('/auth/signup/instructor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            businessName: formData.businessName,
            subdomain: formData.businessName.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 20)
          }),
        });

        console.log('✅ Instructor account created:', signupResponse);

        // Auto-login after signup
        await login(formData.email, formData.password, 'instructor');
        
        // Navigate to instructor dashboard
        window.location.href = '/coach/dashboard';
        return;

        // PAYMENT FLOW DISABLED TEMPORARILY
        // Uncomment below when payment is needed:
        /*
        // Store complete signup data in localStorage for after payment
        const pendingSignupData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          businessName: formData.businessName,
          subdomain: signupResponse.signupData.subdomain,
          planId: formData.selectedPlan
        };
        localStorage.setItem('pendingInstructorSignup', JSON.stringify(pendingSignupData));

        // Store promo code in cookie to be redeemed after payment
        if (formData.promoCode && formData.promoCode.trim()) {
          const promoCode = formData.promoCode.trim().toUpperCase();
          setCookie('pendingPromoCode', promoCode, 1); // 1 day expiry
        }

        // Create checkout session for selected plan (public endpoint for non-authenticated users)
        const { url } = await apiFetch('/subscriptions/checkout/public', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            planId: formData.selectedPlan,
            email: formData.email,
            signupData: JSON.stringify(pendingSignupData)
          }),
        });

        // Redirect to Stripe checkout immediately
        if (url) {
          window.location.href = url;
        }
        */
      } else {
        // INSTRUCTOR LOGIN - Use AuthContext
        await login(formData.email, formData.password, 'instructor');
      }
    } catch (error: any) {
      setErrors({
        submit: error.message || `${mode === 'signup' ? 'Signup' : 'Login'} failed. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mode,
    setMode,
    formData,
    setFormData,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isLoading,
    errors,
    isCheckingSubdirectory,
    subdirectoryChecked,
    handleSubmit,
  };
};

