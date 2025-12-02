/**
 * Complete Profile Page - Enhanced with all features
 */

'use client';

import { useState } from 'react';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon,
  PencilIcon,
  ClockIcon,
  BookmarkIcon,
  HeartIcon,
  CameraIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import ProfileEditModal from '@/components/ProfileEditModal';
import ActivityCard from '@/components/ActivityCard';
import StatsCounter from '@/components/StatsCounter';

interface UserProfile {
  name: string;
  email: string;
  role: 'Admin' | 'User';
  avatar?: string;
  theme: 'light' | 'dark';
  favoriteTopics: string[];
  bio?: string;
}

interface Activity {
  id: string;
  title: string;
  type: 'viewed' | 'bookmarked' | 'liked';
  timestamp: string;
  category?: string;
}

export default function CompleteProfilePage() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: 'User',
    theme: 'light',
    favoriteTopics: ['Machine Learning', 'Web Development', 'Data Science', 'Cloud Computing'],
    bio: 'Passionate about AI and continuous learning. Building the future with code and creativity.',
    avatar: undefined
  });

  const [activities] = useState<Activity[]>([
    { id: '1', title: 'Neural Networks Fundamentals', type: 'viewed', timestamp: '2 hours ago', category: 'Machine Learning' },
    { id: '2', title: 'React Best Practices', type: 'bookmarked', timestamp: '5 hours ago', category: 'Web Development' },
    { id: '3', title: 'Python Data Analysis', type: 'liked', timestamp: '1 day ago', category: 'Data Science' },
    { id: '4', title: 'TypeScript Advanced Types', type: 'viewed', timestamp: '2 days ago', category: 'Web Development' },
    { id: '5', title: 'Deep Learning with PyTorch', type: 'bookmarked', timestamp: '3 days ago', category: 'Machine Learning' },
    { id: '6', title: 'AWS Cloud Architecture', type: 'liked', timestamp: '4 days ago', category: 'Cloud Computing' },
    { id: '7', title: 'Data Visualization with D3.js', type: 'viewed', timestamp: '5 days ago', category: 'Data Science' },
  ]);

  const stats = [
    { label: 'Cards Viewed', value: 234, icon: ClockIcon, color: 'from-cyan-500 to-blue-500' },
    { label: 'Bookmarks', value: 45, icon: BookmarkIcon, color: 'from-purple-500 to-pink-500' },
    { label: 'Likes', value: 89, icon: HeartIcon, color: 'from-red-500 to-orange-500' },
  ];

  const handleSaveProfile = (updatedProfile: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updatedProfile }));
    setShowEditModal(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              Profile
            </h1>
            <SparklesIcon className="w-8 h-8 text-cyan-500 animate-pulse" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account, track your progress, and customize your experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 animate-in fade-in slide-in-from-left duration-500">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300">
              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  {profile.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt={profile.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-cyan-500 shadow-lg ring-4 ring-cyan-100 dark:ring-cyan-900"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 flex items-center justify-center shadow-lg ring-4 ring-cyan-100 dark:ring-cyan-900 animate-gradient">
                      <UserCircleIcon className="w-20 h-20 text-white" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white p-2.5 rounded-full cursor-pointer shadow-lg transform hover:scale-110 transition-all duration-200 ring-4 ring-white dark:ring-gray-800">
                    <CameraIcon className="w-5 h-5" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 text-center">
                  {profile.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-center">{profile.email}</p>
              </div>

              {/* Info Cards */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl border border-cyan-100 dark:border-gray-600 hover:shadow-md transition-all duration-200">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <EnvelopeIcon className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {profile.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl border border-purple-100 dark:border-gray-600 hover:shadow-md transition-all duration-200">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <ShieldCheckIcon className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Role</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{profile.role}</p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-cyan-500" />
                    About Me
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Favorite Topics */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <HeartIcon className="w-4 h-4 text-red-500" />
                  Favorite Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.favoriteTopics.map((topic, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-semibold rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <PencilIcon className="w-5 h-5" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Right Column - Activity & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-right duration-500">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        <StatsCounter value={stat.value} duration={1500} />
                      </p>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-bottom duration-500 delay-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ClockIcon className="w-6 h-6 text-cyan-500" />
                  Recent Activity
                </h2>
                <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-semibold rounded-full">
                  {activities.length} activities
                </span>
              </div>
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="animate-in fade-in slide-in-from-bottom duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ActivityCard activity={activity} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <ProfileEditModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}
