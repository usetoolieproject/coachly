import React, { useState, useEffect } from 'react';
import { ArrowRight, User, Mail, Lock, Eye, EyeOff, Loader, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../services/api';

export default function CleanStudentSignup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    agreeToTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [pendingCommunity, setPendingCommunity] = useState<any>(null);
  const [hasCheckedPending, setHasCheckedPending] = useState(false);

  // Force light mode on auth page load
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    try { localStorage.setItem('theme', 'light'); } catch {}
  }, []);

  // CHECK FOR PENDING COMMUNITY - REDIRECT IF NONE
  useEffect(() => {
    const checkPendingCommunity = () => {
      const pending = localStorage.getItem('pendingCommunityJoin');
      
      if (pending) {
        try {
          const communityInfo = JSON.parse(pending);
          
          // Check if it's expired (30 minutes)
          const now = Date.now();
          const joinTime = communityInfo.timestamp || 0;
          const THIRTY_MINUTES = 30 * 60 * 1000;
          
          if (now - joinTime > THIRTY_MINUTES) {
            localStorage.removeItem('pendingCommunityJoin');
            navigate('/');
            setHasCheckedPending(true);
            return;
          }
          
          setPendingCommunity(communityInfo);
          setHasCheckedPending(true);
        } catch (error) {
          localStorage.removeItem('pendingCommunityJoin');
          navigate('/');
          setHasCheckedPending(true);
        }
      } else {
        // If we returned from payment success but lost pending state, try to restore it
        try {
          const url = new URL(window.location.href);
          const isPaymentSuccess = url.searchParams.get('payment_success') === 'true';
          
          if (isPaymentSuccess) {
            // Try to restore pending community from subdomain in current URL
            const subdirectory = window.location.hostname.split('.')[0];
            
            if (subdirectory && subdirectory !== 'www' && !subdirectory.includes('localhost')) {
              // Restore pending community join from subdomain (extracted from current hostname)
              const restoredPending = {
                subdirectory: subdirectory,
                communityName: 'this community',
                instructorName: 'Instructor',
                timestamp: Date.now(),
              };
              localStorage.setItem('pendingCommunityJoin', JSON.stringify(restoredPending));
              setPendingCommunity(restoredPending);
              setHasCheckedPending(true);
              return;
            }
            
            // If we can't extract subdomain but have payment_success, create a minimal pending community
            // to allow signup to proceed (They'll need to manually join community after signup if needed)
            const minimalPending = {
              subdirectory: subdirectory || 'default',
              communityName: 'this community',
              instructorName: 'Instructor',
              timestamp: Date.now(),
            };
            localStorage.setItem('pendingCommunityJoin', JSON.stringify(minimalPending));
            setPendingCommunity(minimalPending);
            setHasCheckedPending(true);
            return;
          }
        } catch (error) {
          // Silent error handling
        }
        setHasCheckedPending(true);
        navigate('/');
      }
    };

    checkPendingCommunity();
  }, [navigate]);

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const data = await apiFetch('/auth/signup/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          instructorSubdomain: effectivePendingCommunity?.subdirectory, // Pass instructor subdomain for auto-assignment
        }),
      });

      // Store the token
      localStorage.setItem('token', data.token);
      
      // Set a flag to prevent AuthContext from auto-redirecting
      // We'll handle the redirect ourselves to go to /student/community
      sessionStorage.setItem('skipLoginRedirect', 'true');
      
      // Login through auth context (this will authenticate but we'll handle redirect)
      await login(formData.email, formData.password, 'student');
      
      // Clear the skip flag
      sessionStorage.removeItem('skipLoginRedirect');
      
      // Clear pending community join from localStorage (no longer needed)
      localStorage.removeItem('pendingCommunityJoin');
      
      // If student was auto-assigned to instructor, redirect to their subdomain's community page
      if (effectivePendingCommunity && effectivePendingCommunity.subdirectory) {
        const currentHost = window.location.hostname.toLowerCase();
        const isProductionDomain = /usecoachly\.com$/.test(currentHost);
        
        let apex;
        if (isProductionDomain) {
          const parts = currentHost.split('.');
          if (parts[0] === 'www') parts.shift();
          apex = parts.slice(-2).join('.');
        } else {
          apex = 'usecoachly.com';
        }
        
        const redirectUrl = `https://${effectivePendingCommunity.subdirectory}.${apex}/student/community`;
        window.location.replace(redirectUrl);
      } else {
        // Redirect to student dashboard on current domain
        window.location.replace('/student/dashboard');
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'Signup failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login/student');
  };

  // Show loading until we check for pending community
  if (!hasCheckedPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If we've checked but no pending community and no payment_success, redirect should have happened
  // But if we're still here with payment_success, show a basic signup form
  const effectivePendingCommunity = pendingCommunity || {
    subdirectory: window.location.hostname.split('.')[0] || 'default',
    communityName: 'this community',
    instructorName: 'Instructor',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Community Info */}
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-6 sm:p-8 lg:p-12 flex items-center justify-center text-white">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl">🎓</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Join {effectivePendingCommunity.communityName}</h1>
            <h2 className="text-lg sm:text-xl text-purple-100 mb-4 sm:mb-6">by {effectivePendingCommunity.instructorName}</h2>
            <p className="text-sm sm:text-base text-purple-100 leading-relaxed mb-6 sm:mb-8">
              You're about to join an amazing learning community! Create your account to get instant access to all courses, community discussions, and exclusive content.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold">Instant</div>
                <div className="text-purple-100 text-xs sm:text-sm">Course Access</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold">24/7</div>
                <div className="text-purple-100 text-xs sm:text-sm">Community</div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">What you'll get:</h3>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-300 flex-shrink-0" />
                <span className="text-sm sm:text-base text-purple-100">Access to all courses in this community</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-300 flex-shrink-0" />
                <span className="text-sm sm:text-base text-purple-100">Direct interaction with your instructor</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-300 flex-shrink-0" />
                <span className="text-sm sm:text-base text-purple-100">Connect with fellow students</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-300 flex-shrink-0" />
                <span className="text-sm sm:text-base text-purple-100">Certificates of completion</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8">
              {/* Back Button */}
              <button
                onClick={handleBackToLogin}
                className="mb-3 sm:mb-4 text-gray-600 hover:text-gray-900 flex items-center text-xs sm:text-sm"
              >
                ← Back to Login
              </button>

              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-white font-bold text-xl sm:text-2xl">T</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Create Your Account</h1>
                <p className="text-sm sm:text-base text-gray-600">Join {pendingCommunity.instructorName}'s community</p>
              </div>

              {/* Show pending community info - MANDATORY */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="text-center">
                  <p className="text-green-800 text-xs sm:text-sm font-bold mb-2">
                    🎯 Creating Account for {pendingCommunity.communityName}!
                  </p>
                  <p className="text-green-700 text-xs">
                    You'll automatically join <strong>{pendingCommunity.instructorName}'s</strong> community after creating your account.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.firstName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="John"
                      />
                    </div>
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.lastName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Doe"
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className={`w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                    className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="terms" className="text-xs sm:text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-purple-600 hover:text-purple-700 underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-purple-600 hover:text-purple-700 underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.agreeToTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeToTerms}</p>}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold text-sm sm:text-base hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                      <span className="text-xs sm:text-sm">Creating Account & Joining Community...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs sm:text-sm sm:text-base">Create Account & Join Community</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                    </>
                  )}
                </button>

                {errors.submit && (
                  <div className="text-red-500 text-xs sm:text-sm text-center">{errors.submit}</div>
                )}
                <div className="mt-4 sm:mt-6 text-center">
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Already have a student account?{' '}
                    <button
                      onClick={() => navigate('/login/student')}
                      className="text-purple-600 hover:text-purple-700 font-medium underline"
                    >
                      Login instead
                    </button>
                  </p>
                </div>
              </form>

              {/* Community Benefits */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-purple-800 text-xs sm:text-sm font-medium mb-2">
                  ✨ Why {pendingCommunity.instructorName}'s community?
                </p>
                <ul className="text-xs text-purple-700 space-y-1">
                  <li>• Free access to all courses</li>
                  <li>• Direct instructor support</li>
                  <li>• Lifetime community access</li>
                  <li>• No hidden fees or subscriptions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}