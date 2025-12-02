/**
 * Profile & Settings Demo - Example integration
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  UserCircleIcon, 
  Cog6ToothIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

export default function ProfileSettingsDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent mb-4">
            Profile & Settings
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Manage your account, preferences, and workspace customization
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Profile Card */}
          <Link href="/profile">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
                  <UserCircleIcon className="w-8 h-8 text-white" />
                </div>
                <ArrowRightIcon className="w-6 h-6 text-gray-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Profile
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                View and edit your profile information, activity summary, and favorite topics
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-medium rounded-full">
                  Avatar Upload
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                  Activity Stats
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                  Edit Modal
                </span>
              </div>
            </div>
          </Link>

          {/* Settings Card */}
          <Link href="/settings">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <Cog6ToothIcon className="w-8 h-8 text-white" />
                </div>
                <ArrowRightIcon className="w-6 h-6 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Customize your workspace theme, notifications, privacy, and language preferences
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                  Theme Switcher
                </span>
                <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs font-medium rounded-full">
                  Notifications
                </span>
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">
                  Privacy
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Profile Page</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-0.5">✓</span>
                  <span>User information display with avatar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-0.5">✓</span>
                  <span>Activity summary with stats</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-0.5">✓</span>
                  <span>Favorite topics management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-0.5">✓</span>
                  <span>Edit profile modal with animations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-0.5">✓</span>
                  <span>Profile picture upload with preview</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Settings Page</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">✓</span>
                  <span>Theme switcher (Light/Dark/Auto)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">✓</span>
                  <span>Accent color picker with 6 colors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">✓</span>
                  <span>Notification preferences toggles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">✓</span>
                  <span>Privacy controls</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">✓</span>
                  <span>Language selection</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-8 bg-gray-900 rounded-xl shadow-lg p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Integration</h3>
          <pre className="text-sm text-gray-300">
            <code>{`// Add to your navigation
<Link href="/profile">Profile</Link>
<Link href="/settings">Settings</Link>

// Or use in your layout
import ProfilePage from '@/app/profile/page';
import SettingsPage from '@/app/settings/page';`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
