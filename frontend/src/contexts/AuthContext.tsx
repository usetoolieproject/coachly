import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '../services/api';

interface User {
  id: string;
  email: string;
  role: 'instructor' | 'student' | 'admin';
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  phone?: string;
  location?: string;
  bio?: string;
  instructor?: {
    id: string;
    user_id: string;
    business_name: string;
    subdomain: string;
    created_at: string;
    stripe_account_id?: string;
    premium_starts?: string;
    premium_ends?: string;
  };
  student?: {
    id: string;
    user_id: string;
    instructor_id?: string;
    created_at: string;
    instructor_premium_starts?: string;
    instructor_premium_ends?: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>; // ADDED THIS
  loading: boolean;
  isAuthenticated: boolean;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Using shared apiFetch from services/api.ts which handles API URL configuration

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const authCheckAttempted = React.useRef(false);

  useEffect(() => {
    // Prevent multiple auth checks
    if (authCheckAttempted.current) {
      return;
    }
    authCheckAttempted.current = true;
    
    // Log cookies for debugging
    console.log('🍪 Current cookies:', document.cookie);
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    
    // Check if this is a logout redirect - if so, clear user immediately
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('logout')) {
        
        // Clear any remaining cookies and storage
        sessionStorage.clear();
        localStorage.clear();
        
        // Clear cookies for .usecoachly.com domain
        document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.usecoachly.com;";
        document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=usecoachly.com;";
        
        // Clear specific localStorage items that might cause issues
        try {
          localStorage.removeItem('payment_session_id');
          localStorage.removeItem('theme');
          localStorage.removeItem('tenantSlug');
          localStorage.removeItem('user');
          localStorage.removeItem('auth');
        } catch (e) {
        }
        
        setUser(null);
        setLoading(false);
        return;
      }
    }
    
    // Check if there are any session cookies before making API call
    // Only skip API call if we're on production apex domain and no session cookie
    // Always try API call on localhost/dev environments
    if (typeof window !== 'undefined') {
      const currentHost = window.location.hostname.toLowerCase();
      
      // Don't skip API call on localhost or development environments
      if (!currentHost.includes('localhost') && !currentHost.includes('127.0.0.1')) {
        const parts = currentHost.split('.');
        if (parts[0] === 'www') parts.shift();
        const isApex = parts.length <= 2;
        
        const hasSessionCookie = document.cookie.includes('session=');
        if (isApex && !hasSessionCookie) {
          setUser(null);
          setLoading(false);
          return;
        }
      }
    }
    
    
    try {
      console.log('🔐 Checking auth status...');
      console.log('🍪 Cookies before request:', document.cookie);
      const data = await apiFetch('/auth/me');
      console.log('✅ Auth check response:', data);
      console.log('✅ User from response:', data.user);
      
      // If no user in response, treat as unauthenticated
      if (!data.user) {
        console.warn('⚠️ No user in response, treating as unauthenticated');
        throw new Error('No user data in response');
      }
      
      setUser(data.user);
      
      // Store user in localStorage as backup
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch (e) {
          console.warn('Failed to store user in localStorage:', e);
        }
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      
      // Check if this is an unknown tenant (404 error)
      // Disabled redirect logic to prevent refresh loops on apex domain
      if ((error as any)?.status === 404 && typeof window !== 'undefined') {
        const currentHost = window.location.hostname.toLowerCase();
        const parts = currentHost.split('.');
        if (parts[0] === 'www') parts.shift();
        
        // Only redirect subdomains, not apex domain
        if (parts.length > 2 && !currentHost.includes('usecoachly.com')) {
          const apex = parts.slice(-2).join('.');
          console.log('❌ Unknown subdomain, redirecting to apex:', apex);
          window.location.replace(`https://${apex}`);
          return;
        }
      }
      
      // Try to restore user from localStorage if API call failed
      if (typeof window !== 'undefined') {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            console.log('📦 Restored user from localStorage:', parsedUser.email);
            setUser(parsedUser);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Failed to restore user from localStorage:', e);
        }
      }
      
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, role?: string) => {
    try {
      console.log('🔑 Attempting login...');
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });
      console.log('🔑 Login response:', data);
      console.log('🍪 Cookies after login:', document.cookie);

      // SCENARIO 2: Handle WRONG_TENANT error - redirect to correct subdomain
      if (data?.error === 'WRONG_TENANT' && data?.correctSubdomain) {
        setUser(null);
        if (typeof window !== 'undefined') {
          const correctSubdomain = data.correctSubdomain;
          const currentHost = window.location.hostname.toLowerCase();
          const parts = currentHost.split('.');
          if (parts[0] === 'www') parts.shift();
          const apex = parts.slice(-2).join('.');
          
          
          // Backend will set the cookie for the correct subdomain
          
          const redirectUrl = `https://${correctSubdomain}.${apex}/coach/dashboard`;
          window.location.replace(redirectUrl);
        }
        return;
      }

      setUser(data.user);
      
      // Store user in localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch (e) {
          console.warn('Failed to store user in localStorage:', e);
        }
      }
      
      // Check if payment is in progress - if so, don't redirect yet
      const paymentInProgress = sessionStorage.getItem('paymentInProgress');
      if (paymentInProgress) {
        // Don't redirect, let the payment flow handle navigation
        return;
      }
      
      // Check if signup flow wants to handle its own redirect
      const skipLoginRedirect = sessionStorage.getItem('skipLoginRedirect');
      if (skipLoginRedirect === 'true') {
        // Don't redirect, let the signup component handle navigation
        return;
      }
      
      // Handle post-login redirects
      if (data?.user?.role === 'instructor' && data?.user?.instructor?.subdomain) {
        const subdomain = data.user.instructor.subdomain;
        const currentHost = window.location.hostname.toLowerCase();
        const parts = currentHost.split('.');
        if (parts[0] === 'www') parts.shift();
        const apex = parts.slice(-2).join('.');
        
        // Always redirect to user's correct subdomain
        window.location.replace(`https://${subdomain}.${apex}/coach/dashboard`);
      } else if (data?.user?.role === 'student') {
        
        // Check if backend provided redirectTo
        if (data?.redirectTo) {
          const currentHost = window.location.hostname.toLowerCase();
          const parts = currentHost.split('.');
          if (parts[0] === 'www') parts.shift();
          const apex = parts.slice(-2).join('.');
          const targetSubdomain = data.redirectTo;
          
          // Redirect to correct instructor subdomain
          window.location.replace(`https://${targetSubdomain}.${apex}/student/dashboard`);
          return;
        }
        
        // Already on correct subdomain, just navigate
        window.location.replace('/student/dashboard');
      }
    } catch (error: any) {
      // Handle WRONG_TENANT error from exception
      if (error.message && error.message.includes('WRONG_TENANT')) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.error === 'WRONG_TENANT' && errorData.correctSubdomain) {
            setUser(null);
            if (typeof window !== 'undefined') {
              const correctSubdomain = errorData.correctSubdomain;
              const currentHost = window.location.hostname.toLowerCase();
              const parts = currentHost.split('.');
              if (parts[0] === 'www') parts.shift();
              const apex = parts.slice(-2).join('.');
              
              // Backend will set the cookie for the correct subdomain
              
              const redirectUrl = `https://${correctSubdomain}.${apex}/coach/dashboard`;
              window.location.replace(redirectUrl);
            }
            return;
          }
        } catch (parseError) {
          // If parsing fails, throw the original error
          throw error;
        }
      }
      // Re-throw other errors
      throw error;
    }
  };

  const logout = async () => {
    
    // Store current user role before clearing
    const userRole = user?.role;
    
    // Set logout flag to prevent race conditions
    setIsLoggingOut(true);
    setUser(null);
    
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {}

    if (typeof window !== 'undefined') {
      try {
        // Clear all storage
        sessionStorage.clear();
        localStorage.clear();
        
        // Clear all cookies manually (client-side cleanup)
        const currentHost = window.location.hostname.toLowerCase();
        const parts = currentHost.split('.');
        if (parts[0] === 'www') parts.shift();
        const apex = parts.slice(-2).join('.');
        
        // Clear cookies for current domain and parent domain
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Clear cookies for .usecoachly.com domain
        document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.usecoachly.com;";
        document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=usecoachly.com;";
        
        // Clear any other potential cookies
        const cookieNames = ['session', 'auth', 'token', 'user', 'tenant', 'payment_session_id'];
        cookieNames.forEach(name => {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.usecoachly.com;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=usecoachly.com;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
        
        // Clear specific localStorage items that might cause issues
        try {
          localStorage.removeItem('payment_session_id');
          localStorage.removeItem('theme');
          localStorage.removeItem('tenantSlug');
          localStorage.removeItem('user');
          localStorage.removeItem('auth');
        } catch (e) {
        }
        
        // Clear any cached data that might cause redirects
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name);
            });
          });
        }
        
        // SCENARIO 3: Instructor logout - redirect to apex
        if (userRole === 'instructor') {
          const cacheBuster = Date.now();
          window.location.replace(`https://${apex}/?logout=${cacheBuster}`);
        }
        // SCENARIO 2: Student logout - redirect to subdomain login page
        else if (userRole === 'student' && parts.length > 2) {
          const cacheBuster = Date.now();
          window.location.replace(`/login?logout=${cacheBuster}`);
        }
        // Fallback - redirect to apex
        else {
          const cacheBuster = Date.now();
          window.location.replace(`https://${apex}/?logout=${cacheBuster}`);
        }
      } catch (error) {
        window.location.href = '/';
      }
    }
  };

  const refreshUser = async () => {
    try {
      const data = await apiFetch('/auth/me');
      setUser(data.user);
    } catch (error) {
    }
  };

  const value = {
    user,
    login,
    logout,
    refreshUser,
    loading,
    isAuthenticated: !!user,
    isLoggingOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};