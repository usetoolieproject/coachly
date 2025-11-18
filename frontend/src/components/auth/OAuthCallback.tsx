import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * OAuth callback handler that receives token from backend and sets it as cookie
 */
export const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      console.error('No token in OAuth callback');
      navigate('/sign-in?error=oauth_failed', { replace: true });
      return;
    }

    // Set the session cookie
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    const isSecure = window.location.protocol === 'https:';
    const domain = window.location.hostname.includes('usecoachly.com') ? '.usecoachly.com' : '';
    
    // Build cookie string
    let cookieString = `session=${token}; Path=/; Max-Age=${maxAge}`;
    if (isSecure) cookieString += '; Secure';
    if (domain) cookieString += `; Domain=${domain}; SameSite=None`;
    
    document.cookie = cookieString;
    
    console.log('✅ OAuth token set as cookie');
    
    // Store token in localStorage as well
    localStorage.setItem('token', token);
    
    // Clear logout timestamp if present
    localStorage.removeItem('logoutTimestamp');
    sessionStorage.removeItem('justLoggedOut');
    
    // Redirect to dashboard
    navigate('/coach/dashboard', { replace: true });
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
};
