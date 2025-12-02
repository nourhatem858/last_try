'use client';

/**
 * Home Page - Landing Page
 * Shows welcome screen or redirects to dashboard
 */

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SparklesIcon, RocketLaunchIcon, ShieldCheckIcon, BoltIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0D1B2A] to-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
          <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">AI Workspace</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-6 py-2.5 rounded-lg text-white hover:bg-white/10 transition-all duration-200"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto mb-20">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom duration-700">
              Adaptive AI
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Knowledge Workspace
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
              Organize, search, and interact with your knowledge using AI. Create workspaces, manage documents, and get instant insights.
            </p>
            <div className="flex items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
              <Link
                href="/signup"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-lg shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-200"
              >
                Start Free Trial
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-4 rounded-xl bg-white/10 border border-cyan-500/30 text-white font-semibold text-lg hover:bg-white/20 transition-all duration-200"
              >
                View Demo
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: SparklesIcon,
                title: 'AI-Powered',
                description: 'Get instant answers from your documents and notes using advanced AI',
                gradient: 'from-cyan-500 to-blue-600',
              },
              {
                icon: RocketLaunchIcon,
                title: 'Lightning Fast',
                description: 'Search through thousands of documents in milliseconds',
                gradient: 'from-purple-500 to-pink-600',
              },
              {
                icon: ShieldCheckIcon,
                title: 'Secure & Private',
                description: 'Your data is encrypted and never shared with third parties',
                gradient: 'from-green-500 to-emerald-600',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom duration-700"
                  style={{ animationDelay: `${(index + 4) * 100}ms` }}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="inline-block bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-2xl p-12">
              <BoltIcon className="w-16 h-16 mx-auto text-cyan-400 mb-6 animate-pulse" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to supercharge your workflow?
              </h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already using AI Workspace to organize and access their knowledge.
              </p>
              <Link
                href="/signup"
                className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-lg shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-200"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
