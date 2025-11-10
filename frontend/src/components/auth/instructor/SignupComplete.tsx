import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

const SignupComplete = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const completeSignup = async () => {
      if (!sessionId) {
        setStatus('error');
        setErrorMessage('No session ID found');
        return;
      }

      try {
        // Check if we already completed signup (prevent double-processing)
        const completed = sessionStorage.getItem('signup_completed');
        if (completed) {
          // Already processed, just redirect
          const subdomain = JSON.parse(completed).subdomain;
          if (subdomain) {
            const currentHost = window.location.hostname.toLowerCase();
            const parts = currentHost.split('.');
            if (parts[0] === 'www') parts.shift();
            const apex = parts.slice(-2).join('.');
            const targetUrl = `https://${subdomain}.${apex}/coach/dashboard`;
            window.location.replace(targetUrl);
          }
          return;
        }

        // Call backend to complete signup - it will get data from Stripe session
        const response = await apiFetch('/auth/complete-signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId
          }),
        });

        if (response.success) {
          // Clear pending signup data
          localStorage.removeItem('pendingInstructorSignup');
          sessionStorage.removeItem('pendingInstructorSignup');
          
          // Store token (cookie is set by backend)
          if (response.token) {
            localStorage.setItem('token', response.token);
          }

          // Get subdomain from response
          const subdomain = response.user?.instructor?.subdomain;
          
          if (subdomain) {
            // Mark as completed
            sessionStorage.setItem('signup_completed', JSON.stringify({ subdomain }));
            
            // Redirect to instructor subdomain
            const currentHost = window.location.hostname.toLowerCase();
            const parts = currentHost.split('.');
            if (parts[0] === 'www') parts.shift();
            const apex = parts.slice(-2).join('.');
            
            const targetUrl = `https://${subdomain}.${apex}/coach/dashboard`;
            window.location.replace(targetUrl);
          } else {
            // Fallback: redirect to login
            window.location.replace('/login');
          }
        } else {
          throw new Error(response.error || 'Failed to complete signup');
        }
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.message || 'Failed to complete signup');
      }
    };

    completeSignup();
  }, [sessionId, login]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing your signup...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Signup Error</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => navigate('/signup')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-green-600 mb-4">✓</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Signup Complete!</h1>
        <p className="text-gray-600">Redirecting you to your dashboard...</p>
      </div>
    </div>
  );
};

export default SignupComplete;

