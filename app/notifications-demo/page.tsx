/**
 * Notifications & Loading States Demo Page
 */

'use client';

import { useState } from 'react';
import { 
  BellIcon, 
  SparklesIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Notifications, { Notification } from '@/components/Notifications';
import LoadingSkeleton, { LoadingGrid } from '@/components/LoadingSkeleton';
import NotificationCenter from '@/components/NotificationCenter';

export default function NotificationsDemoPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'comment',
      title: 'New Comment',
      message: 'Sarah commented on your "Machine Learning Basics" card',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      read: false,
      actionUrl: '/cards/ml-basics'
    },
    {
      id: '2',
      type: 'like',
      title: 'Card Liked',
      message: 'John liked your "React Best Practices" card',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false
    },
    {
      id: '3',
      type: 'follow',
      title: 'New Follower',
      message: 'Emma started following you',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true
    },
    {
      id: '4',
      type: 'mention',
      title: 'You were mentioned',
      message: 'Alex mentioned you in a discussion about AI',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true
    },
    {
      id: '5',
      type: 'system',
      title: 'System Update',
      message: 'New features have been added to your workspace',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      read: true
    }
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const addNewNotification = () => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: 'system',
      title: 'New Notification',
      message: 'This is a newly added notification with bounce animation',
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const simulateLoading = () => {
    setShowLoading(true);
    setTimeout(() => setShowLoading(false), 3000);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'} py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Notifications & Loading States
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Interactive demo of notification system and loading skeletons
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Toggle {darkMode ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Notifications */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                  <BellIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Notifications Component
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Full-featured notification system
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <button
                  onClick={addNewNotification}
                  className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                >
                  Add New Notification
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-sm"
                  >
                    Mark All Read
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors text-sm"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <Notifications
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDelete={handleDelete}
                onClearAll={handleClearAll}
                loading={false}
              />
            </div>

            {/* Notification Center Example */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Notification Center (Toolbar Integration)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Click the bell icon to see the dropdown notification center
              </p>
              <div className="flex justify-center p-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <NotificationCenter darkMode={darkMode} />
              </div>
            </div>
          </div>

          {/* Right Column - Loading States */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Loading Skeletons
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Shimmer effect loading states
                  </p>
                </div>
              </div>

              <button
                onClick={simulateLoading}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 mb-4"
              >
                Simulate Loading (3s)
              </button>

              <div className="space-y-6">
                {/* Card Skeleton */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Card Skeleton
                  </h3>
                  {showLoading ? (
                    <LoadingSkeleton variant="card" />
                  ) : (
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-700 dark:to-gray-700 rounded-xl p-6 border border-cyan-200 dark:border-gray-600">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Content Loaded!
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        This is the actual content that appears after loading
                      </p>
                    </div>
                  )}
                </div>

                {/* Profile Skeleton */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Profile Skeleton
                  </h3>
                  <LoadingSkeleton variant="profile" />
                </div>

                {/* Notification Skeleton */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Notification Skeleton
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <LoadingSkeleton variant="notification" count={2} />
                  </div>
                </div>

                {/* List Skeleton */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    List Skeleton
                  </h3>
                  <LoadingSkeleton variant="list" count={2} />
                </div>

                {/* Text Skeleton */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Text Skeleton
                  </h3>
                  <LoadingSkeleton variant="text" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>✓ Read/unread status</li>
                <li>✓ Type-based icons</li>
                <li>✓ Filter (all/unread)</li>
                <li>✓ Mark as read</li>
                <li>✓ Delete notifications</li>
                <li>✓ Timestamp formatting</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Loading States</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>✓ Shimmer animation</li>
                <li>✓ Multiple variants</li>
                <li>✓ Dark mode support</li>
                <li>✓ Customizable count</li>
                <li>✓ Smooth transitions</li>
                <li>✓ Reusable components</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Animations</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>✓ Fade-in effects</li>
                <li>✓ Slide-in animations</li>
                <li>✓ Hover states</li>
                <li>✓ Pulse badges</li>
                <li>✓ Smooth transitions</li>
                <li>✓ Staggered loading</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-8 bg-gray-900 rounded-xl shadow-lg p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Integration</h3>
          <pre className="text-sm text-gray-300">
            <code>{`// Notifications
import Notifications from '@/components/Notifications';

<Notifications
  notifications={notifications}
  onMarkAsRead={(id) => handleMarkAsRead(id)}
  onMarkAllAsRead={() => handleMarkAllAsRead()}
  onDelete={(id) => handleDelete(id)}
  onClearAll={() => handleClearAll()}
/>

// Loading Skeletons
import LoadingSkeleton from '@/components/LoadingSkeleton';

<LoadingSkeleton variant="card" count={3} />
<LoadingSkeleton variant="profile" />
<LoadingSkeleton variant="notification" count={5} />`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
