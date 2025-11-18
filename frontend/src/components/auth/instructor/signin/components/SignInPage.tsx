import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FormField } from './FormField';
import { PasswordField } from './PasswordField';

interface SignInPageProps {
  formData: {
    email: string;
    password: string;
    rememberMe: boolean;
  };
  setFormData: (data: any) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  errors: Record<string, string>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  errors,
  onSubmit,
  isLoading,
}) => {
  return (
    <div className="p-0 sm:p-4">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8">
        Sign in to your account
      </h2>

      {errors.submit && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-xs sm:text-sm">{errors.submit}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
        <FormField
          label="Email address"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="you@company.com"
          icon={Mail}
          error={errors.email}
        />

        <PasswordField
          label="Password"
          name="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          error={errors.password}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember-me"
              checked={formData.rememberMe}
              onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="remember-me" className="ml-2 text-xs sm:text-sm text-gray-600">
              Remember me
            </label>
          </div>
          <Link to="/forgot-password" className="text-xs sm:text-sm text-purple-600 hover:text-purple-700">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gray-900 text-white py-2.5 sm:py-3 px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* Divider */}
      <div className="mt-4 sm:mt-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs sm:text-sm">
          <span className="px-4 bg-white text-gray-500">
            or continue with
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="mt-4 sm:mt-6">
        <button
          type="button"
          onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`}
          className="w-full flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="hidden sm:inline">Continue with Google</span>
          <span className="sm:hidden">Google</span>
        </button>
      </div>

      {/* Footer */}
      <p className="mt-4 sm:mt-6 text-xs text-gray-500 text-center">
        By continuing, you agree to our{' '}
        <Link to="/terms" className="text-purple-600 hover:text-purple-700 underline">
          Terms
        </Link>{' '}
        and{' '}
        <Link to="/privacy" className="text-purple-600 hover:text-purple-700 underline">
          Privacy Policy
        </Link>
        .
      </p>

      {/* Back to Home */}
      <div className="mt-3 sm:mt-4 flex justify-center">
        <a
          href="/"
          className="inline-flex items-center space-x-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Back to Home</span>
        </a>
      </div>
    </div>
  );
};

