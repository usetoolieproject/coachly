import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { StudentAuthService, StudentLoginData, StudentSignupData, PendingCommunity } from '../services/authService';
import { studentCourseService } from '../../../../features/student/studentCourses/services';

export const useStudentAuth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingCommunity, setPendingCommunity] = useState<PendingCommunity | null>(null);

  // Check for pending community join on mount
  useEffect(() => {
    const checkPendingCommunity = () => {
      const pending = StudentAuthService.checkPendingCommunity();
      if (pending) {
        setPendingCommunity(pending);
      }
    };

    checkPendingCommunity();
  }, [location]);

  // Handle pending community join
  const handlePendingCommunityJoin = async () => {
    if (!pendingCommunity) return;

    try {
      await StudentAuthService.handlePendingCommunityJoin(pendingCommunity);
      alert(`Successfully joined ${pendingCommunity.communityName}!`);
      navigate('/student/community');
    } catch (error: any) {
      alert(`Welcome! You can join ${pendingCommunity.communityName} from your communities page.`);
      navigate('/student/community');
    }
  };

  // Student login
  const handleLogin = async (formData: StudentLoginData) => {
    const validationErrors = StudentAuthService.validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await login(formData.email, formData.password, 'student');
      
      if (pendingCommunity) {
        await handlePendingCommunityJoin();
      } else {
        navigate('/student');
      }
      return true;
    } catch (error: any) {
      setErrors({
        submit: error.message || 'Login failed. Please try again.',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Student signup
  const handleSignup = async (formData: StudentSignupData) => {
    const validationErrors = StudentAuthService.validateSignupForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // This would typically call a signup API
      // For now, we'll simulate the signup process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // After successful signup, redirect to login or auto-login
      navigate('/login/student');
      return true;
    } catch (error: any) {
      setErrors({
        submit: error.message || 'Signup failed. Please try again.',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear errors
  const clearErrors = () => {
    setErrors({});
  };

  // Clear specific error
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return {
    isLoading,
    errors,
    pendingCommunity,
    handleLogin,
    handleSignup,
    clearErrors,
    clearError,
    handlePendingCommunityJoin,
  };
};
