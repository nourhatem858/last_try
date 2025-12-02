/**
 * Settings Page - Workspace customization and preferences
 */

'use client';

import { useState } from 'react';
import { 
  PaintBrushIcon,
  BellIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import ToggleSwitch from '@/components/ToggleSwitch';
import ColorPicker from '@/components/ColorPicker';

interface Settings {
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  notifications: {
    email: boolean;
    push: boolean;
    weekly: boolean;
    mentions: boolean;
  };
  privacy: {
    profileVisible: boolean;
    activityVisible: boolean;
  };
  language: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    accentColor: '#06b6d4',
    notifications: {
      email: true,
      push: true,
      weekly: false,
      mentions: true,
    },
    privacy: {
      profileVisible: true,
      activityVisible: false,
    },
    language: 'en',
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const accentColors = [
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Green', value: '#10b981' },
    { name: 'Orange', value: '#f59e0b' },
  ];

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save to localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    setSaving(false);
    setSaved(true);
    
    setTimeout(() => setSaved(false), 3000);
  };

  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateNestedSetting = (parent: keyof Settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [key]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Customize your workspace preferences</p>
        </div>

        <div className="space-y-6">
          {/* Appearance Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                <PaintBrushIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Appearance</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Customize the look and feel</p>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['light', 'dark', 'auto'].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => updateSetting('theme', theme)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      settings.theme === theme
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {theme}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color Picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Accent Color
              </label>
              <ColorPicker
                colors={accentColors}
                selected={settings.accentColor}
                onChange={(color) => updateSetting('accentColor', color)}
              />
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <BellIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage notification preferences</p>
              </div>
            </div>

            <div className="space-y-4">
              <ToggleSwitch
                label="Email Notifications"
                description="Receive updates via email"
                checked={settings.notifications.email}
                onChange={(checked) => updateNestedSetting('notifications', 'email', checked)}
              />
              <ToggleSwitch
                label="Push Notifications"
                description="Get real-time browser notifications"
                checked={settings.notifications.push}
                onChange={(checked) => updateNestedSetting('notifications', 'push', checked)}
              />
              <ToggleSwitch
                label="Weekly Summary"
                description="Receive weekly activity digest"
                checked={settings.notifications.weekly}
                onChange={(checked) => updateNestedSetting('notifications', 'weekly', checked)}
              />
              <ToggleSwitch
                label="Mentions & Replies"
                description="Notify when someone mentions you"
                checked={settings.notifications.mentions}
                onChange={(checked) => updateNestedSetting('notifications', 'mentions', checked)}
              />
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privacy</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Control your privacy settings</p>
              </div>
            </div>

            <div className="space-y-4">
              <ToggleSwitch
                label="Public Profile"
                description="Make your profile visible to others"
                checked={settings.privacy.profileVisible}
                onChange={(checked) => updateNestedSetting('privacy', 'profileVisible', checked)}
              />
              <ToggleSwitch
                label="Show Activity"
                description="Display your recent activity publicly"
                checked={settings.privacy.activityVisible}
                onChange={(checked) => updateNestedSetting('privacy', 'activityVisible', checked)}
              />
            </div>
          </div>

          {/* Language Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <GlobeAltIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Language</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred language</p>
              </div>
            </div>

            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="zh">中文</option>
            </select>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            {saved && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-left duration-200">
                <CheckCircleIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Settings saved successfully!</span>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`ml-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                saving ? 'animate-pulse' : ''
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
