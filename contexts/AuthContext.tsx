'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; user?: User }>;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User }>;
  logout: () => void;
  setAuthData: (token: string, user: User) => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user and token from localStorage on mount
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }

    setLoading(false);
  }, []);

  // Signup function - calls API and updates state
  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; user?: User }> => {
    try {
      console.log('🔵 AuthContext: signup called with:', { name, email });

      // Make API request
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      console.log('🔵 AuthContext: Response status:', response.status, response.statusText);

      // Try to parse JSON response
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
          console.log('🔵 AuthContext: Parsed JSON response:', data);
        } catch (parseError) {
          console.error('❌ AuthContext: Failed to parse JSON response:', parseError);
          throw new Error('Server returned invalid response. Please try again.');
        }
      } else {
        // Response is not JSON (probably HTML error page)
        const text = await response.text();
        console.error('❌ AuthContext: Non-JSON response received:', text.substring(0, 200));
        throw new Error('Server error. Please check if the server is running correctly.');
      }

      // Check if request was successful
      if (!response.ok) {
        // Extract error message (try multiple keys)
        const errorMessage = data.error || data.message || data.msg || 'Signup failed';
        console.error('❌ AuthContext: Signup failed:', errorMessage);
        throw new Error(errorMessage);
      }

      // Validate response structure
      if (!data.success) {
        const errorMessage = data.error || data.message || 'Signup failed';
        console.error('❌ AuthContext: Signup unsuccessful:', errorMessage);
        throw new Error(errorMessage);
      }

      if (!data.token || !data.user) {
        console.error('❌ AuthContext: Invalid response structure:', data);
        throw new Error('Invalid server response. Missing token or user data.');
      }

      // Success! Update state
      setToken(data.token);
      setUser(data.user);
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      console.log('✅ AuthContext: User signed up successfully:', data.user.email);
      return { success: true, user: data.user };

    } catch (error: any) {
      console.error('❌ AuthContext: Signup error:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      // Re-throw with original message
      throw error;
    }
  };

  // Login function - calls API and updates state
  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User }> => {
    try {
      console.log('🔵 AuthContext: login called with:', { email });

      // Make API request
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('🔵 AuthContext: Response status:', response.status, response.statusText);

      // Try to parse JSON response
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
          console.log('🔵 AuthContext: Parsed JSON response:', data);
        } catch (parseError) {
          console.error('❌ AuthContext: Failed to parse JSON response:', parseError);
          throw new Error('Server returned invalid response. Please try again.');
        }
      } else {
        // Response is not JSON (probably HTML error page)
        const text = await response.text();
        console.error('❌ AuthContext: Non-JSON response received:', text.substring(0, 200));
        throw new Error('Server error. Please check if the server is running correctly.');
      }

      // Check if request was successful
      if (!response.ok) {
        // Extract error message (try multiple keys)
        const errorMessage = data.error || data.message || data.msg || 'Login failed';
        console.error('❌ AuthContext: Login failed:', errorMessage);
        throw new Error(errorMessage);
      }

      // Validate response structure
      if (!data.success) {
        const errorMessage = data.error || data.message || 'Login failed';
        console.error('❌ AuthContext: Login unsuccessful:', errorMessage);
        throw new Error(errorMessage);
      }

      if (!data.token || !data.user) {
        console.error('❌ AuthContext: Invalid response structure:', data);
        throw new Error('Invalid server response. Missing token or user data.');
      }

      // Success! Update state
      setToken(data.token);
      setUser(data.user);
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      console.log('✅ AuthContext: User logged in successfully:', data.user.email);
      return { success: true, user: data.user };

    } catch (error: any) {
      console.error('❌ AuthContext: Login error:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      // Re-throw with original message
      throw error;
    }
  };

  // Helper function to set auth data directly (for manual token setting)
  const setAuthData = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  // Logout function - COMPLETE DATA WIPE
  const logout = () => {
    console.log('🔴 Starting complete logout...');
    
    // 1. Clear all auth state
    setToken(null);
    setUser(null);
    
    if (typeof window !== 'undefined') {
      // 2. Clear ALL localStorage
      localStorage.clear();
      
      // 3. Clear ALL sessionStorage
      sessionStorage.clear();
      
      // 4. Clear ALL cookies
      document.cookie.split(';').forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
      
      console.log('✅ LOGOUT COMPLETE — All data cleared.');
      
      // 5. Force redirect to login (prevent back navigation)
      window.location.href = '/login';
    }
  };

  // Refresh user data from server
  const refreshUser = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        }
      } else if (response.status === 401) {
        // Token is invalid, logout
        logout();
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        signup,
        login,
        logout,
        setAuthData,
        refreshUser,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
