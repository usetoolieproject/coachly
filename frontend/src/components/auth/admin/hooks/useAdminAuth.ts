import { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AdminAuthService, AdminLoginData } from '../services/authService';

export const useAdminAuth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Admin login
  const handleLogin = async (formData: AdminLoginData) => {
    const validationErrors = AdminAuthService.validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await login(formData.email, formData.password, 'admin');
      navigate('/admin');
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
    handleLogin,
    clearErrors,
    clearError,
  };
};
