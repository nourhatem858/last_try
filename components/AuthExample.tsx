/**
 * Auth Example Component
 * Demonstrates how to use the Auth system in any component
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function AuthExample() {
  const { signup, login, logout, user, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signup(formData.name, formData.email, formData.password);
      
      if (result.success) {
        console.log('✅ Signup successful!', result.user);
        // Optionally redirect or show success message
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      console.error('❌ Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        console.log('✅ Login successful!', result.user);
        // Optionally redirect or show success message
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      console.error('❌ Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    logout();
    console.log('👋 User logged out');
  };

  // Show loading state during initial auth check
  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Loading authentication...</p>
      </div>
    );
  }

  // Show user info if authenticated
  if (isAuthenticated && user) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
        <div className="space-y-2 mb-4">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>ID:</strong> {user.id}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  // Show auth forms if not authenticated
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Authentication Example</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSignup} className="space-y-4 mb-6">
        <h3 className="text-xl font-semibold">Sign Up</h3>
        
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          required
        />
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          required
        />
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>

      <div className="border-t pt-6">
        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <h3 className="text-xl font-semibold">Login</h3>
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            required
          />
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      {/* Usage Instructions */}
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
        <p className="font-semibold mb-2">How to use in your components:</p>
        <pre className="text-xs overflow-x-auto">
{`const { signup, login, logout, user, isAuthenticated } = useAuth();

// Signup
await signup(name, email, password);

// Login
await login(email, password);

// Logout
logout();`}
        </pre>
      </div>
    </div>
  );
}
