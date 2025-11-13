import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSignInForm } from "./hooks/useSignInForm";
import { useSignupPlans } from "./hooks/useSignupPlans";
import { SignInForm } from "./components/SignInForm";
import { SignInPage } from "./components/SignInPage";
import { FeaturesSection } from "./components/FeaturesSection";

export default function CleanInstructorLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { plans, loading: plansLoading } = useSignupPlans();
  
  // Check if we're on signup route
  const isSignupRoute = location.pathname === '/signup' || location.pathname === '/signup/instructor';
  const initialMode = isSignupRoute ? 'signup' : 'login';
  
  // Get planId from sessionStorage (preferred) or URL query params (fallback/backward compatibility)
  const planIdFromStorage = typeof window !== 'undefined' ? sessionStorage.getItem('selectedPlanId') : null;
  const planIdFromUrl = searchParams.get('planId');
  
  // Use sessionStorage first, then URL query param as fallback
  const selectedPlanId = planIdFromStorage || planIdFromUrl;
  
  // Store URL planId to sessionStorage and clean up URL if present (for backward compatibility)
  useEffect(() => {
    if (planIdFromUrl && isSignupRoute && !planIdFromStorage) {
      sessionStorage.setItem('selectedPlanId', planIdFromUrl);
      // Clean up URL by removing query param
      navigate('/signup', { replace: true });
    }
  }, [planIdFromUrl, planIdFromStorage, isSignupRoute, navigate]);

  const {
    mode,
    setMode: setModeInternal,
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
  } = useSignInForm(initialMode);

  // Wrapper function to update URL when switching modes
  const setMode = (newMode: 'login' | 'signup') => {
    setModeInternal(newMode);
    // Navigate to the appropriate route
    if (newMode === 'signup') {
      navigate('/signup');
    } else {
      navigate('/login');
    }
  };

  // Sync mode with URL path
  useEffect(() => {
    if (isSignupRoute && mode !== 'signup') {
      setModeInternal('signup');
    } else if (!isSignupRoute && mode !== 'login') {
      setModeInternal('login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Force light mode on auth page load
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    try { localStorage.setItem('theme', 'light'); } catch {}
  }, []);

  // Auto-select plan from sessionStorage or URL query param if present
  useEffect(() => {
    if (selectedPlanId && mode === 'signup' && !formData.selectedPlan) {
      setFormData(prev => ({ ...prev, selectedPlan: selectedPlanId }));
    }
  }, [selectedPlanId, mode, formData.selectedPlan, setFormData]);

  // Sign Up Layout
  if (mode === "signup") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 py-4 sm:py-6 -mt-5">
        {/* Container for logo and sign-up grid */}
        <div className="w-full max-w-6xl">
          {/* Logo positioned at top-left */}
          <div className="mb-4 sm:mb-6">
            <a href="/">
              <img
                src="/Coachly official.png"
                alt="Coachly"
                className="h-12 sm:h-14 md:h-16 object-contain"
              />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
          {/* Signup Card */}
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 sm:p-8 hover:shadow-3xl hover:-translate-y-1 transition-all duration-300">
            {!selectedPlanId && (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">One-time payment • Lifetime access</p>
              </>
            )}
            {selectedPlanId && (
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Sign Up</h1>
            )}

            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <SignInForm
                mode={mode}
                formData={formData}
                setFormData={setFormData}
                showPassword={showPassword}
                showConfirmPassword={showConfirmPassword}
                setShowPassword={setShowPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                errors={errors}
                isCheckingSubdirectory={isCheckingSubdirectory}
                subdirectoryChecked={subdirectoryChecked}
                plans={plans}
                plansLoading={plansLoading}
                preSelectedPlanId={selectedPlanId}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2.5 sm:py-3 px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Continue to Payment"}
              </button>

              <p className="mt-4 text-xs sm:text-sm text-gray-600 text-center">
                One-time payment • Lifetime access
              </p>
              
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-purple-600 hover:text-purple-700 font-medium text-xs sm:text-sm"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          </div>

          {/* Features Section */}
          <FeaturesSection />
          </div>
        </div>
      </div>
    );
  }

  // Sign In Layout
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      {/* Container for logo and sign-in card */}
      <div className="w-full max-w-lg relative">
        {/* Logo positioned at top-left of container */}
        <div className="mb-6">
          <a href="/">
            <img
              src="/Coachly official.png"
              alt="Coachly"
              className="h-12 sm:h-14 md:h-16 object-contain"
            />
          </a>
        </div>

        {/* Sign-in card */}
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 sm:p-8 hover:shadow-3xl hover:-translate-y-1 transition-all duration-300">
          <SignInPage
            formData={formData}
            setFormData={setFormData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            errors={errors}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
