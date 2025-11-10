import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  Users,
  Award,
} from "lucide-react";
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { studentCourseService } from '../../../features/student/studentCourses/services';

export default function CleanStudentLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingCommunity, setPendingCommunity] = useState<any>(null);

  // Force light mode on auth page load
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    try { localStorage.setItem('theme', 'light'); } catch {}
  }, []);

  // CHECK FOR PENDING COMMUNITY JOIN WITH SMART CLEANUP
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
            return;
          }
          
          // Check if user came from community page or manually navigated
          const referrer = document.referrer;
          const cameFromCommunity = referrer.includes('/about/') || location.state?.fromCommunity;
          
          if (!cameFromCommunity && !communityInfo.timestamp) {
            // If no timestamp and didn't come from community, it's probably stale
            localStorage.removeItem('pendingCommunityJoin');
            return;
          }
          
          setPendingCommunity(communityInfo);
        } catch (error) {
          localStorage.removeItem('pendingCommunityJoin');
        }
      }
    };

    checkPendingCommunity();

    // Clear pending join when tab/window is closed
    const handleBeforeUnload = () => {
      // Only clear if user is leaving the site, not just refreshing
      if (performance.navigation?.type === 1) { // TYPE_RELOAD
        return; // Don't clear on refresh
      }
      localStorage.removeItem('pendingCommunityJoin');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [location]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePendingCommunityJoin = async () => {
    if (!pendingCommunity) return;

    try {
      await studentCourseService.joinCommunity(pendingCommunity.subdirectory);
      
      localStorage.removeItem('pendingCommunityJoin');
      alert(`Successfully joined ${pendingCommunity.communityName}!`);
      navigate('/student/community');
      
    } catch (error: any) {
      alert(`Welcome! You can join ${pendingCommunity.communityName} from your communities page.`);
      localStorage.removeItem('pendingCommunityJoin');
      navigate('/student/community');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await login(formData.email, formData.password, 'student');
      
      if (pendingCommunity) {
        await handlePendingCommunityJoin();
      } else {
        navigate('/student');
      }
    } catch (error: any) {
      setErrors({
        submit: error.message || 'Login failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-teal-500 to-green-500">
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 text-white">
          <div className="max-w-md">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <User className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold">Trainr</span>
            </div>

            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Learn. Grow.
              <br />
              <span className="text-blue-200">Achieve More.</span>
            </h1>

            <p className="text-xl text-blue-100 mb-12 leading-relaxed">
              Access world-class courses, connect with fellow learners, and
              accelerate your personal and professional growth.
            </p>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Interactive Learning</h3>
                  <p className="text-blue-200 text-sm">
                    Hands-on courses with real-world projects
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Multiple Communities</h3>
                  <p className="text-blue-200 text-sm">
                    Join learning communities from different instructors
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Earn Certificates</h3>
                  <p className="text-blue-200 text-sm">
                    Showcase your achievements
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Trainr for Students
                </h1>
              </div>

              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Continue your learning journey
                </p>
              </div>

              {/* PENDING COMMUNITY JOIN INFO - NO CANCEL BUTTON */}
              {pendingCommunity && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="text-center">
                    <p className="text-green-800 text-xs sm:text-sm font-bold mb-2">
                      🎯 Joining {pendingCommunity.communityName}!
                    </p>
                    <p className="text-green-700 text-xs mb-2">
                      You're about to join <strong>{pendingCommunity.instructorName}'s</strong> learning community.
                    </p>
                    <p className="text-green-600 text-xs">
                      Sign in to get instant access to all courses and community features.
                    </p>
                  </div>
                </div>
              )}

              {errors.submit && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-xs sm:text-sm">{errors.submit}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors text-sm sm:text-base ${
                        errors.email ? "border-red-300" : ""
                      }`}
                      placeholder="student@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors text-sm sm:text-base ${
                        errors.password ? "border-red-300" : ""
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={formData.rememberMe}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          rememberMe: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 text-xs sm:text-sm text-gray-600"
                    >
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base sm:text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 sm:mr-3"></div>
                      <span className="text-sm sm:text-base">Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm sm:text-base">{pendingCommunity ? `Sign in & Join` : "Access My Courses"}</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    </>
                  )}
                </button>
              </form>

              {/* NO SIGNUP OPTION - ONLY INFO */}
              <div className="mt-4 sm:mt-6 text-center">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                  <p className="text-blue-800 text-xs sm:text-sm font-medium mb-2">
                    🎓 Don't have a student account?
                  </p>
                  <p className="text-blue-700 text-xs">
                    Students can only create accounts through their instructor's community page. Ask your instructor for their community link!
                  </p>
                </div>
                
                {/* Back to Home */}
                <button
                  onClick={() => {
                    localStorage.removeItem('pendingCommunityJoin');
                    window.location.href = "/";
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm font-medium"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}