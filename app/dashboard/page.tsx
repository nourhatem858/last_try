'use client';

/**
 * Dashboard Page - Main Hub
 * Central dashboard for Adaptive AI Knowledge Workspace
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SidebarNav from '@/components/dashboard/SidebarNav';
import TopNavbar from '@/components/dashboard/TopNavbar';
import DashboardCards from '@/components/dashboard/DashboardCards';
import QuickActionsPanel from '@/components/dashboard/QuickActionsPanel';
import RecentActivityList from '@/components/dashboard/RecentActivityList';
import AIResponsePanel from '@/components/dashboard/AIResponsePanel';
import LoadingSkeleton from '@/components/dashboard/LoadingSkeleton';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface DashboardData {
  workspaces: number;
  notes: number;
  documents: number;
  aiChats: number;
  recentActivity: Array<{
    id: string;
    type: 'note' | 'document' | 'workspace';
    title: string;
    timestamp: string;
  }>;
}

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading, token } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activityRefreshTrigger, setActivityRefreshTrigger] = useState(0);

  // Fetch dashboard data
  useEffect(() => {
    if (!authLoading && isAuthenticated && token) {
      fetchDashboardData();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/dashboard/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();

      if (data.success) {
        setDashboardData({
          notes: data.counts.notes || 0,
          workspaces: data.counts.workspaces || 0,
          documents: data.counts.documents || 0,
          aiChats: data.counts.chats || 0,
          recentActivity: [],
        });
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load real data');
      setDashboardData({
        notes: 0,
        workspaces: 0,
        documents: 0,
        aiChats: 0,
        recentActivity: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black">
        <SidebarNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="lg:pl-64">
          <TopNavbar />
          <main className="p-6">
            <LoadingSkeleton />
          </main>
        </div>
      </div>
    );
  }

  // Guest view (not logged in)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black">
        <SidebarNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="lg:pl-64">
          <TopNavbar />
          <main className="p-6">
            {/* Welcome Banner for Guests */}
            <div className="mb-8 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-2xl p-8 text-center">
              <SparklesIcon className="w-16 h-16 mx-auto text-cyan-400 mb-4 animate-pulse" />
              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome to AI Knowledge Workspace
              </h1>
              <p className="text-lg text-gray-300 mb-6">
                Your adaptive workspace for managing knowledge with AI assistance
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => router.push('/login')}
                  className="
                    px-8 py-3 rounded-xl font-semibold
                    bg-gradient-to-r from-cyan-500 to-blue-600
                    text-white shadow-lg shadow-cyan-500/30
                    hover:shadow-cyan-500/50 hover:scale-105
                    transition-all duration-200
                  "
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="
                    px-8 py-3 rounded-xl font-semibold
                    bg-white/10 border border-cyan-500/30
                    text-white hover:bg-white/20
                    transition-all duration-200
                  "
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Limited Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { name: 'Workspaces', value: '—', color: 'cyan' },
                { name: 'Notes', value: '—', color: 'purple' },
                { name: 'Documents', value: '—', color: 'green' },
                { name: 'AI Chats', value: '—', color: 'orange' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6 opacity-50"
                >
                  <p className="text-sm text-gray-400 mb-2">{item.name}</p>
                  <p className="text-4xl font-bold text-gray-600">{item.value}</p>
                  <p className="text-xs text-gray-500 mt-4">🔒 Login to view</p>
                </div>
              ))}
            </div>

            {/* Limited AI Access */}
            <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-8 text-center">
              <SparklesIcon className="w-12 h-12 mx-auto text-cyan-400 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">AI Assistant Available</h2>
              <p className="text-gray-400 mb-6">
                Get limited AI assistance or login for full access
              </p>
              <button
                onClick={() => setAiPanelOpen(true)}
                className="
                  px-6 py-3 rounded-xl font-semibold
                  bg-gradient-to-r from-cyan-500 to-blue-600
                  text-white shadow-lg shadow-cyan-500/30
                  hover:shadow-cyan-500/50 hover:scale-105
                  transition-all duration-200
                "
              >
                Try AI Assistant
              </button>
            </div>
          </main>
        </div>
        <AIResponsePanel isOpen={aiPanelOpen} onClose={() => setAiPanelOpen(false)} />
      </div>
    );
  }

  // Logged in user view
  const stats = dashboardData || {
    workspaces: 0,
    notes: 0,
    documents: 0,
    aiChats: 0,
    recentActivity: [],
  };

  return (
    <div className="min-h-screen bg-black">
      <SidebarNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="lg:pl-64">
        <TopNavbar />

        <main className="p-6 space-y-8">
          {/* Welcome Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-gray-400">
                Here's what's happening in your workspace today
              </p>
            </div>
            <button
              onClick={() => setAiPanelOpen(true)}
              className="
                flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                bg-gradient-to-r from-cyan-500 to-blue-600
                text-white shadow-lg shadow-cyan-500/30
                hover:shadow-cyan-500/50 hover:scale-105
                transition-all duration-200
              "
            >
              <SparklesIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
              {error}
            </div>
          )}

          {/* Dashboard Cards */}
          <DashboardCards stats={stats} />

          {/* Quick Actions */}
          <QuickActionsPanel onActivityUpdate={() => {
            setActivityRefreshTrigger(prev => prev + 1);
            fetchDashboardData();
          }} />

          {/* Recent Activity */}
          <RecentActivityList refreshTrigger={activityRefreshTrigger} />

          {/* AI Insights Card */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/50">
                <SparklesIcon className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">AI Insights</h3>
                <p className="text-gray-300 mb-4">
                  Your workspace has been analyzed. Here are some insights:
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    You've been most active in "Project Planning" workspace
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    3 documents need your review
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    AI has found 5 related topics across your notes
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* AI Response Panel */}
      <AIResponsePanel isOpen={aiPanelOpen} onClose={() => setAiPanelOpen(false)} />
    </div>
  );
}
