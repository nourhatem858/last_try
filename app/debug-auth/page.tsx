'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function DebugAuthPage() {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    setDebugInfo({
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 30) + '...' : 'No token',
      hasUser: !!user,
      userPreview: user ? JSON.parse(user) : null,
      localStorage: {
        token: token || 'Not found',
        user: user || 'Not found'
      }
    });
  };

  const testAPI = async () => {
    setTestResult('Testing...');
    const token = localStorage.getItem('token');
    
    if (!token) {
      setTestResult('❌ No token found!');
      return;
    }

    try {
      const response = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data as any;
      if (data.success) {
        setTestResult(`✅ API works! User: ${data.user.email}`);
      } else {
        setTestResult(`❌ API returned: ${JSON.stringify(data)}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTestResult('🗑️ Cleared localStorage');
    checkAuth();
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🔍 Auth Debug Page</h1>
        
        {/* Debug Info */}
        <div className="bg-black border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Debug Information</h2>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex gap-2">
              <span className="text-gray-500">Has Token:</span>
              <span className={debugInfo.hasToken ? 'text-green-400' : 'text-red-400'}>
                {debugInfo.hasToken ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-500">Token Length:</span>
              <span className="text-white">{debugInfo.tokenLength}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-500">Token Preview:</span>
              <span className="text-white break-all">{debugInfo.tokenPreview}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-500">Has User:</span>
              <span className={debugInfo.hasUser ? 'text-green-400' : 'text-red-400'}>
                {debugInfo.hasUser ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            {debugInfo.userPreview && (
              <div className="mt-4">
                <span className="text-gray-500">User Data:</span>
                <pre className="text-white bg-[#0D1B2A] p-3 rounded mt-2 overflow-auto">
                  {JSON.stringify(debugInfo.userPreview, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className="bg-black border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Test Result</h2>
            <p className="text-white font-mono">{testResult}</p>
          </div>
        )}

        {/* Actions */}
        <div className="bg-black border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testAPI}
              className="px-6 py-3 bg-[#1F77FF] hover:bg-[#0D5FD9] text-white font-semibold rounded-xl transition-all"
            >
              🧪 Test API
            </button>
            <button
              onClick={checkAuth}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all"
            >
              🔄 Refresh Info
            </button>
            <button
              onClick={clearAuth}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all"
            >
              🗑️ Clear Auth
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all"
            >
              🔐 Go to Login
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
            >
              👤 Go to Profile
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-black border border-gray-800 rounded-xl p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-4">📝 Instructions</h2>
          <ol className="text-[#CCCCCC] space-y-2 list-decimal list-inside">
            <li>Check if token exists above</li>
            <li>Click "Test API" to verify token is valid</li>
            <li>If token is invalid, click "Clear Auth" then "Go to Login"</li>
            <li>After login, come back here to verify</li>
            <li>Then try "Go to Profile"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
