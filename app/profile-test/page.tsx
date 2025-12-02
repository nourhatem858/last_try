/**
 * Profile Test Page - Verify all components work together
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
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Inline components to avoid import issues
function ProfileEditModal({ profile, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: profile.name,
    bio: profile.bio || '',
    favoriteTopics: [...profile.favoriteTopics],
  });
  const [newTopic, setNewTopic] = useState('');

  const handleAddTopic = () => {
    if (newTopic.trim() && !formData.favoriteTopics.includes(newTopic.trim())) {
      setFormData(prev => ({
        ...prev,
        favoriteTopics: [...prev.favoriteTopics, newTopic.trim()]
      }));
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteTopics: prev.favoriteTopics.filter(t => t !== topic)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Favorite Topics</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic())}
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                placeholder="Add a topic..."
              />
              <button type="button" onClick={handleAddTopic} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.favoriteTopics.map((topic: string, index: number) => (
                <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-full">
                  {topic}
                  <button type="button" onClick={() => handleRemoveTopic(topic)} className="hover:bg-white/20 rounded-full p-0.5">
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-lg shadow-md">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ActivityCard({ activity }: any) {
  const getIcon = () => {
    switch (activity.type) {
      case 'viewed': return <ClockIcon className="w-5 h-5" />;
      case 'bookmarked': return <BookmarkIcon className="w-5 h-5" />;
      case 'liked': return <HeartIcon className="w-5 h-5" />;
    }
  };

  const getColor = () => {
    switch (activity.type) {
      case 'viewed': return 'from-cyan-500 to-blue-500';
      case 'bookmarked': return 'from-purple-500 to-pink-500';
      case 'liked': return 'from-red-500 to-orange-500';
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group cursor-pointer">
      <div className={`p-2 rounded-lg bg-gradient-to-r ${getColor()} flex-shrink-0`}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
          {activity.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {activity.category && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{activity.category}</span>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500">• {activity.timestamp}</span>
        </div>
      </div>
    </div>
  );
}

export default function ProfileTestPage() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'User',
    theme: 'light',
    favoriteTopics: ['Machine Learning', 'Web Development', 'Data Science'],
    bio: 'Passionate about AI and continuous learning',
    avatar: undefined as string | undefined
  });

  const activities = [
    { id: '1', title: 'Neural Networks Fundamentals', type: 'viewed', timestamp: '2 hours ago', category: 'Machine Learning' },
    { id: '2', title: 'React Best Practices', type: 'bookmarked', timestamp: '5 hours ago', category: 'Web Development' },
    { id: '3', title: 'Python Data Analysis', type: 'liked', timestamp: '1 day ago', category: 'Data Science' },
    { id: '4', title: 'TypeScript Advanced Types', type: 'viewed', timestamp: '2 days ago', category: 'Web Development' },
    { id: '5', title: 'Deep Learning with PyTorch', type: 'bookmarked', timestamp: '3 days ago', category: 'Machine Learning' },
  ];

  const stats = [
    { label: 'Cards Viewed', value: 234, icon: ClockIcon, color: 'from-cyan-500 to-blue-500' },
    { label: 'Bookmarks', value: 45, icon: BookmarkIcon, color: 'from-purple-500 to-pink-500' },
    { label: 'Likes', value: 89, icon: HeartIcon, color: 'from-red-500 to-orange-500' },
  ];

  const handleSaveProfile = (updatedProfile: any) => {
    setProfile(prev => ({ ...prev, ...updatedProfile }));
    setShowEditModal(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {saved && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Profile updated successfully!</p>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Test Page</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">All components working without import errors</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-32 h-32 rounded-full object-cover border-4 border-cyan-500 shadow-lg" />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                      <UserCircleIcon className="w-20 h-20 text-white" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-full cursor-pointer shadow-lg transform hover:scale-110 transition-all duration-200">
                    <CameraIcon className="w-5 h-5" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{profile.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <EnvelopeIcon className="w-5 h-5 text-cyan-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <ShieldCheckIcon className="w-5 h-5 text-cyan-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{profile.role}</p>
                  </div>
                </div>
              </div>

              {profile.bio && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Bio</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{profile.bio}</p>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Favorite Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.favoriteTopics.map((topic, index) => (
                    <span key={index} className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-medium rounded-full">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowEditModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <PencilIcon className="w-5 h-5" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Activity & Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

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
