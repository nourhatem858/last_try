/**
 * Demo Page - Showcases Toolbar and Sidebar features
 * Use this page to test and demonstrate all component functionality
 */

'use client';

import { useState } from 'react';
import { 
  SparklesIcon, 
  ChartBarIcon, 
  ClockIcon,
  BookOpenIcon 
} from '@heroicons/react/24/outline';

export default function DemoPage() {
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const features = [
    {
      icon: SparklesIcon,
      title: 'Live Search Suggestions',
      description: 'Type in the search bar to see dynamic suggestions appear instantly',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: ChartBarIcon,
      title: 'Smart Notifications',
      description: 'Click the bell icon to view notifications with badge counts',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: ClockIcon,
      title: 'Dark Mode Toggle',
      description: 'Switch between light and dark themes with smooth transitions',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: BookOpenIcon,
      title: 'Collapsible Sidebar',
      description: 'Expand/collapse sidebar with nested menu support',
      color: 'from-green-500 to-teal-500'
    }
  ];

  const stats = [
    { label: 'Total Cards', value: '1,234', change: '+12%' },
    { label: 'Topics', value: '48', change: '+5%' },
    { label: 'Favorites', value: '156', change: '+8%' },
    { label: 'This Week', value: '23', change: '+15%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent mb-4">
            Adaptive AI Knowledge Workspace
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience modern, clean, and fully functional navigation components with smooth animations and dark mode support
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className="text-green-500 text-sm font-semibold">
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color}`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Demo Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Try It Out
          </h2>
          
          <div className="space-y-6">
            {/* Search Demo */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🔍 Search Functionality
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Use the search bar in the toolbar above. Type anything to see live suggestions appear!
              </p>
              <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
                <p className="text-sm text-cyan-800 dark:text-cyan-200">
                  💡 <strong>Tip:</strong> Search suggestions appear after typing 2+ characters with a 300ms debounce
                </p>
              </div>
            </div>

            {/* Sidebar Demo */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                📱 Responsive Sidebar
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Click the toggle button in the sidebar to collapse/expand it. On mobile, use the hamburger menu.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 <strong>Tip:</strong> The sidebar has nested menus - click on "Topics" to see expandable categories
                </p>
              </div>
            </div>

            {/* Notifications Demo */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🔔 Notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Click the bell icon in the toolbar to view notifications. Unread notifications show a badge count.
              </p>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  💡 <strong>Tip:</strong> Click on a notification to mark it as read
                </p>
              </div>
            </div>

            {/* Dark Mode Demo */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🌙 Dark Mode
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Toggle between light and dark themes using the sun/moon icon in the toolbar.
              </p>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  💡 <strong>Tip:</strong> Dark mode preference is saved to localStorage
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-12 bg-gray-900 rounded-xl shadow-lg p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-white mb-4">
            Quick Integration Example
          </h3>
          <pre className="text-sm text-gray-300">
            <code>{`import Toolbar from '@/components/Toolbar';
import Sidebar from '@/components/Sidebar';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <>
      <Toolbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onSearch={(query) => console.log(query)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        darkMode={darkMode}
      />
      <main className="pt-16 lg:ml-64">
        {children}
      </main>
    </>
  );
}`}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            Built with React, Next.js, Tailwind CSS, and Heroicons
          </p>
          <p className="text-sm">
            See <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">TOOLBAR_SIDEBAR_README.md</code> for full documentation
          </p>
        </div>
      </div>
    </div>
  );
}
