import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { InstructorAuthService, InstructorLoginData, InstructorSignupData } from '../services/authService';

export const useInstructorAuth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingSubdirectory, setIsCheckingSubdirectory] = useState(false);
  const [subdirectoryChecked, setSubdirectoryChecked] = useState(false);
  const [subdirectoryAvailable, setSubdirectoryAvailable] = useState(true);
  const debounceRef = useRef<number | null>(null);

  // Debounced subdirectory check
  const checkSubdirectoryAvailability = async (subdirectory: string) => {
    if (!subdirectory.trim()) {
      setSubdirectoryAvailable(true);
      setSubdirectoryChecked(false);
      return;
    }

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setIsCheckingSubdirectory(true);
    setSubdirectoryChecked(false);

    // Debounce the check
    debounceRef.current = window.setTimeout(async () => {
      try {
        const available = await InstructorAuthService.checkSubdirectoryAvailability(subdirectory);
        setSubdirectoryAvailable(available);
        setSubdirectoryChecked(true);
      } catch (error) {
        setSubdirectoryAvailable(false);
        setSubdirectoryChecked(true);
      } finally {
        setIsCheckingSubdirectory(false);
      }
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Instructor login
  const handleLogin = async (formData: InstructorLoginData) => {
    const validationErrors = InstructorAuthService.validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await login(formData.email, formData.password, 'instructor');
      navigate('/coach');
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

  // Instructor signup
  const handleSignup = async (formData: InstructorSignupData) => {
    const validationErrors = InstructorAuthService.validateSignupForm(formData);
    
    // Check subdirectory validation
    if (formData.subdirectory) {
      const subdirectoryErrors = InstructorAuthService.validateSubdirectory(formData.subdirectory);
      Object.assign(validationErrors, subdirectoryErrors);
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }

    // Check if subdirectory is available
    if (formData.subdirectory && !subdirectoryAvailable) {
      setErrors({ subdirectory: 'This subdirectory is not available' });
      return false;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // This would typically call a signup API
      // For now, we'll simulate the signup process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // After successful signup, redirect to login or auto-login
      navigate('/login');
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

  // Generate subdirectory from business name
  const generateSubdirectory = (businessName: string) => {
    return InstructorAuthService.generateSubdirectory(businessName);
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
    isCheckingSubdirectory,
    subdirectoryChecked,
    subdirectoryAvailable,
    handleLogin,
    handleSignup,
    checkSubdirectoryAvailability,
    generateSubdirectory,
    clearErrors,
    clearError,
  };
};
