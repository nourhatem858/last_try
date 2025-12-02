/**
 * Profile Page - Completely Redesigned
 * Dark theme with proper error handling and modern UI
 * Colors: #0D1B2A (primary bg), #000000 (secondary bg), #1F77FF (accent)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon,
  PencilIcon,
  ClockIcon,
  BookmarkIcon,
  HeartIcon,
  CameraIcon,
  EyeIcon,
  SparklesIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import ProfileEditModal from '@/components/ProfileEditModal';
import ActivityCard from '@/components/ActivityCard';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  theme?: 'light' | 'dark';
  favoriteTopics?: string[];
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Activity {
  id: string;
  title: string;
  type: 'viewed' | 'bookmarked' | 'liked';
  timestamp: string;
  category?: string;
}

interface Stats {
  cardsViewed: number;
  bookmarks: number;
  likes: number;
}

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  workspace: string;
  workspaceId: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  tags: string[];
  owner: string;
  isOwner: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ChatItem {
  id: string;
  title: string;
  workspace: string | null;
  workspaceId: string | null;
  isAIConversation: boolean;
  messageCount: number;
  lastMessageAt: string;
  lastMessage: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats>({ cardsViewed: 0, bookmarks: 0, likes: 0 });
  const [notes, setNotes] = useState<Note[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Fetch profile data on mount
  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;
    
    console.log('🚀 Profile page mounted');
    console.log('🔍 Checking localStorage...');
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('Token exists:', !!token);
    console.log('User exists:', !!user);
    
    if (token) {
      console.log('✅ Token found, fetching data...');
      fetchProfile();
      fetchStats();
      fetchActivity();
      fetchNotes();
      fetchWorkspaces();
      fetchChats();
    } else {
      console.log('❌ No token found in localStorage');
      setLoading(false);
      setTimeout(() => {
        console.log('🔄 Redirecting to login...');
        router.push('/login');
      }, 500);
    }
  }, []);

  // Refresh all data
  const refreshAllData = () => {
    fetchProfile();
    fetchStats();
    fetchActivity();
    fetchNotes();
    fetchWorkspaces();
    fetchChats();
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('⚠️ No token found, redirecting to login');
        setLoading(false);
        // Delay redirect to avoid flash
        setTimeout(() => router.push('/login'), 100);
        return;
      }

      console.log('🔍 Fetching user profile...');
      console.log('🔑 Token exists:', token.substring(0, 20) + '...');

      // Use /api/auth/me endpoint to get logged-in user data
      const response = await axios.get<{ success: boolean; user: UserProfile }>('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📡 API Response:', response.status, response.data);

      if (response.data?.success && response.data?.user) {
        console.log('✅ Profile loaded successfully:', response.data.user.email);
        setProfile(response.data.user);
        setError('');
      } else {
        console.error('❌ Invalid response format:', response.data);
        setError('Failed to load profile data');
      }
    } catch (err: any) {
      console.error('❌ Profile fetch error:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      if (err.response?.status === 401) {
        console.log('🔒 Unauthorized (401), clearing token and redirecting');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => router.push('/login'), 100);
      } else {
        setError(err.response?.data?.error || 'Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get<{ success: boolean; stats: Stats }>('/api/profile/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success && response.data?.stats) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
      // Don't show error for stats, just use defaults
    }
  };

  const fetchActivity = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get<{ success: boolean; activities: Activity[] }>('/api/profile/activity', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success && response.data?.activities) {
        setActivities(response.data.activities);
      }
    } catch (err) {
      console.error('Activity fetch error:', err);
      // Don't show error for activity, just show empty state
    }
  };

  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get<{ success: boolean; data: Note[] }>('/api/notes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success && response.data?.data) {
        setNotes(response.data.data.slice(0, 5)); // Show only first 5
      }
    } catch (err: any) {
      console.error('Notes fetch error:', err);
      if (err.response?.status === 401) {
        console.log('🔒 Unauthorized while fetching notes');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
      // Don't show error, just show empty state
    } finally {
      setLoadingNotes(false);
    }
  };

  const fetchWorkspaces = async () => {
    setLoadingWorkspaces(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get<{ success: boolean; data: Workspace[] }>('/api/workspaces', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success && response.data?.data) {
        setWorkspaces(response.data.data.slice(0, 5)); // Show only first 5
      }
    } catch (err: any) {
      console.error('Workspaces fetch error:', err);
      if (err.response?.status === 401) {
        console.log('🔒 Unauthorized while fetching workspaces');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
      // Don't show error, just show empty state
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  const fetchChats = async () => {
    setLoadingChats(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get<{ success: boolean; data: ChatItem[] }>('/api/chats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success && response.data?.data) {
        setChats(response.data.data.slice(0, 5)); // Show only first 5
      }
    } catch (err: any) {
      console.error('Chats fetch error:', err);
      if (err.response?.status === 401) {
        console.log('🔒 Unauthorized while fetching chats');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
      // Don't show error, just show empty state
    } finally {
      setLoadingChats(false);
    }
  };

  const statsDisplay = [
    { 
      label: 'Cards Viewed', 
      value: stats?.cardsViewed ?? 0, 
      icon: EyeIcon, 
      gradient: 'from-[#1F77FF] to-[#0D5FD9]',
      shadow: 'shadow-[#1F77FF]/20'
    },
    { 
      label: 'Bookmarks', 
      value: stats?.bookmarks ?? 0, 
      icon: BookmarkIcon, 
      gradient: 'from-purple-500 to-purple-700',
      shadow: 'shadow-purple-500/20'
    },
    { 
      label: 'Likes', 
      value: stats?.likes ?? 0, 
      icon: HeartIcon, 
      gradient: 'from-pink-500 to-red-500',
      shadow: 'shadow-pink-500/20'
    },
  ];

  const handleSaveProfile = async (updatedProfile: Partial<UserProfile>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.put<{ success: boolean; user: UserProfile }>('/api/profile', updatedProfile, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success && response.data?.user) {
        setProfile(response.data.user);
        setShowEditModal(false);
        setError('');
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setUploadingAvatar(true);
    setError('');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const avatar = reader.result as string;
      
      // Update locally first for immediate feedback
      if (profile) {
        setProfile({ ...profile, avatar });
      }

      // Save to backend
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        await axios.put('/api/profile', { avatar }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error('Avatar upload error:', err);
        setError('Failed to upload avatar');
        // Revert on error
        if (profile) {
          setProfile({ ...profile, avatar: profile.avatar });
        }
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read image file');
      setUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#1F77FF]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#1F77FF] animate-spin"></div>
          </div>
          <p className="text-[#CCCCCC] text-lg font-medium">Loading your profile...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // Error state (no profile)
  if (error && !profile) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-black border border-red-500/30 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Unable to Load Profile</h2>
            <p className="text-[#CCCCCC] mb-6">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full px-6 py-3 bg-[#1F77FF] hover:bg-[#0D5FD9] text-white font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1F77FF] focus:ring-offset-2 focus:ring-offset-[#0D1B2A]"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No profile data
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-4">
        <div className="text-center">
          <UserCircleIcon className="w-24 h-24 text-gray-600 mx-auto mb-4" />
          <p className="text-[#CCCCCC] text-lg">No profile data available</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 px-6 py-3 bg-[#1F77FF] hover:bg-[#0D5FD9] text-white font-semibold rounded-xl transition-all duration-200"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 flex-1">{error}</p>
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
            <p className="text-[#CCCCCC]">Manage your account and preferences</p>
          </div>
          <button
            onClick={refreshAllData}
            className="px-4 py-2 bg-[#0D1B2A] hover:bg-[#1F77FF]/10 border border-gray-800 hover:border-[#1F77FF]/50 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
            title="Refresh data"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 animate-in fade-in slide-in-from-left duration-500">
            <div className="bg-black border border-gray-800 rounded-2xl p-6 shadow-2xl hover:border-[#1F77FF]/30 transition-all duration-300">
              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  {profile?.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt={profile?.name || 'User Avatar'}
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#1F77FF] shadow-lg shadow-[#1F77FF]/30 transition-all duration-300 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-[#1F77FF] to-[#0D5FD9] flex items-center justify-center shadow-lg shadow-[#1F77FF]/30 transition-all duration-300 group-hover:scale-105 ${profile?.avatar ? 'hidden' : ''}`}>
                    <UserCircleIcon className="w-20 h-20 text-white" />
                  </div>
                  
                  {/* Upload Button */}
                  <label className="absolute bottom-0 right-0 bg-[#1F77FF] hover:bg-[#0D5FD9] text-white p-2.5 rounded-full cursor-pointer shadow-lg shadow-[#1F77FF]/50 transform hover:scale-110 transition-all duration-200 focus-within:ring-2 focus-within:ring-[#1F77FF] focus-within:ring-offset-2 focus-within:ring-offset-black">
                    {uploadingAvatar ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <CameraIcon className="w-5 h-5" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>
                
                {/* Name and Email */}
                <h2 className="text-2xl font-bold text-white mt-4 text-center">
                  {profile?.name || 'Anonymous User'}
                </h2>
                <p className="text-[#CCCCCC] text-sm mt-1 break-all text-center px-4">
                  {profile?.email || 'No email provided'}
                </p>
                
                {/* Role Badge */}
                <span className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 bg-[#1F77FF]/10 border border-[#1F77FF]/30 text-[#1F77FF] text-xs font-semibold rounded-full">
                  <ShieldCheckIcon className="w-4 h-4" />
                  {profile?.role === 'admin' ? 'Administrator' : 'User'}
                </span>
              </div>

              {/* Info Cards */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-4 bg-[#0D1B2A] rounded-xl border border-gray-800 hover:border-[#1F77FF]/30 transition-all duration-200">
                  <div className="w-10 h-10 rounded-lg bg-[#1F77FF]/10 flex items-center justify-center flex-shrink-0">
                    <EnvelopeIcon className="w-5 h-5 text-[#1F77FF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Email</p>
                    <p className="text-sm font-medium text-white truncate">{profile?.email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-[#0D1B2A] rounded-xl border border-gray-800 hover:border-[#1F77FF]/30 transition-all duration-200">
                  <div className="w-10 h-10 rounded-lg bg-[#1F77FF]/10 flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="w-5 h-5 text-[#1F77FF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Member Since</p>
                    <p className="text-sm font-medium text-white">{formatDate(profile?.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              {profile?.bio && (
                <div className="mb-6 p-4 bg-[#0D1B2A] rounded-xl border border-gray-800">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-[#1F77FF]" />
                    Bio
                  </h3>
                  <p className="text-sm text-[#CCCCCC] leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Favorite Topics */}
              {profile?.favoriteTopics && profile.favoriteTopics.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#1F77FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Favorite Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.favoriteTopics.map((topic, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1.5 bg-gradient-to-r from-[#1F77FF] to-[#0D5FD9] text-white text-xs font-medium rounded-lg shadow-lg shadow-[#1F77FF]/20 hover:scale-105 transition-transform duration-200"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit Button */}
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1F77FF] hover:bg-[#0D5FD9] text-white font-semibold rounded-xl shadow-lg shadow-[#1F77FF]/30 hover:shadow-[#1F77FF]/50 transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1F77FF] focus:ring-offset-2 focus:ring-offset-black"
              >
                <PencilIcon className="w-5 h-5" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="lg:col-span-2 space-y-6 animate-in fade-in slide-in-from-right duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {statsDisplay.map((stat, index) => (
                <div
                  key={index}
                  className={`bg-black border border-gray-800 rounded-2xl p-6 hover:border-[#1F77FF]/30 transform hover:scale-105 transition-all duration-300 shadow-lg ${stat.shadow} hover:shadow-2xl`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                      <p className="text-sm text-[#CCCCCC] mt-0.5">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="bg-black border border-gray-800 rounded-2xl p-6 shadow-2xl hover:border-[#1F77FF]/30 transition-all duration-300">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#1F77FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Access
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/notes')}
                  className="flex items-center gap-3 p-4 bg-[#0D1B2A] hover:bg-[#1F77FF]/10 border border-gray-800 hover:border-[#1F77FF]/50 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#1F77FF]/10 group-hover:bg-[#1F77FF]/20 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5 text-[#1F77FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold">My Notes</p>
                    <p className="text-xs text-[#CCCCCC]">View all notes</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/workspaces')}
                  className="flex items-center gap-3 p-4 bg-[#0D1B2A] hover:bg-[#1F77FF]/10 border border-gray-800 hover:border-[#1F77FF]/50 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold">Workspaces</p>
                    <p className="text-xs text-[#CCCCCC]">Manage spaces</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/chat')}
                  className="flex items-center gap-3 p-4 bg-[#0D1B2A] hover:bg-[#1F77FF]/10 border border-gray-800 hover:border-[#1F77FF]/50 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold">AI Chat</p>
                    <p className="text-xs text-[#CCCCCC]">Start chatting</p>
                  </div>
                </button>
              </div>
            </div>

            {/* My Notes */}
            <div className="bg-black border border-gray-800 rounded-2xl p-6 shadow-2xl hover:border-[#1F77FF]/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-[#1F77FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  My Notes
                </h2>
                {notes.length > 0 && (
                  <button
                    onClick={() => router.push('/notes')}
                    className="text-[#1F77FF] hover:text-[#3D8FFF] text-sm font-medium transition-colors"
                  >
                    View All →
                  </button>
                )}
              </div>
              
              {loadingNotes ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#1F77FF] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => router.push(`/notes/${note.id}`)}
                      className="p-4 bg-[#0D1B2A] hover:bg-[#1F77FF]/10 border border-gray-800 hover:border-[#1F77FF]/50 rounded-xl transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate group-hover:text-[#1F77FF] transition-colors">
                            {note.title}
                          </h3>
                          <p className="text-[#CCCCCC] text-sm mt-1 line-clamp-2">
                            {note.content || 'No content'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">{note.workspace}</span>
                            {note.tags && note.tags.length > 0 && (
                              <>
                                <span className="text-gray-600">•</span>
                                <div className="flex gap-1">
                                  {note.tags.slice(0, 2).map((tag, idx) => (
                                    <span key={idx} className="text-xs px-2 py-0.5 bg-[#1F77FF]/10 text-[#1F77FF] rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        {note.isPinned && (
                          <svg className="w-5 h-5 text-[#1F77FF] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 3a1 1 0 011 1v5h3a1 1 0 110 2h-3v5a1 1 0 11-2 0v-5H6a1 1 0 110-2h3V4a1 1 0 011-1z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#0D1B2A] flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No Notes Yet</h3>
                  <p className="text-[#CCCCCC] text-sm max-w-sm mx-auto mb-4">
                    Create your first note to start organizing your knowledge
                  </p>
                  <button
                    onClick={() => router.push('/notes')}
                    className="px-6 py-2.5 bg-[#1F77FF] hover:bg-[#0D5FD9] text-white font-medium rounded-lg transition-all duration-200"
                  >
                    Create Note
                  </button>
                </div>
              )}
            </div>

            {/* My Workspaces */}
            <div className="bg-black border border-gray-800 rounded-2xl p-6 shadow-2xl hover:border-[#1F77FF]/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  My Workspaces
                </h2>
                {workspaces.length > 0 && (
                  <button
                    onClick={() => router.push('/workspaces')}
                    className="text-purple-500 hover:text-purple-400 text-sm font-medium transition-colors"
                  >
                    View All →
                  </button>
                )}
              </div>
              
              {loadingWorkspaces ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : workspaces.length > 0 ? (
                <div className="space-y-3">
                  {workspaces.map((workspace) => (
                    <div
                      key={workspace.id}
                      onClick={() => router.push(`/workspaces/${workspace.id}`)}
                      className="p-4 bg-[#0D1B2A] hover:bg-purple-500/10 border border-gray-800 hover:border-purple-500/50 rounded-xl transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate group-hover:text-purple-400 transition-colors">
                            {workspace.name}
                          </h3>
                          {workspace.description && (
                            <p className="text-[#CCCCCC] text-sm mt-1 line-clamp-2">
                              {workspace.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded">
                              {workspace.isOwner ? 'Owner' : 'Member'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {workspace.memberCount} {workspace.memberCount === 1 ? 'member' : 'members'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#0D1B2A] flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No Workspaces Yet</h3>
                  <p className="text-[#CCCCCC] text-sm max-w-sm mx-auto mb-4">
                    Create a workspace to collaborate with others
                  </p>
                  <button
                    onClick={() => router.push('/workspaces')}
                    className="px-6 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    Create Workspace
                  </button>
                </div>
              )}
            </div>

            {/* My Chats */}
            <div className="bg-black border border-gray-800 rounded-2xl p-6 shadow-2xl hover:border-[#1F77FF]/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  My Chats
                </h2>
                {chats.length > 0 && (
                  <button
                    onClick={() => router.push('/chat')}
                    className="text-green-500 hover:text-green-400 text-sm font-medium transition-colors"
                  >
                    View All →
                  </button>
                )}
              </div>
              
              {loadingChats ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : chats.length > 0 ? (
                <div className="space-y-3">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => router.push(`/chat?id=${chat.id}`)}
                      className="p-4 bg-[#0D1B2A] hover:bg-green-500/10 border border-gray-800 hover:border-green-500/50 rounded-xl transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-semibold truncate group-hover:text-green-400 transition-colors">
                              {chat.title}
                            </h3>
                            {chat.isAIConversation && (
                              <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded flex-shrink-0">
                                AI
                              </span>
                            )}
                          </div>
                          {chat.lastMessage && (
                            <p className="text-[#CCCCCC] text-sm mt-1 line-clamp-1">
                              {chat.lastMessage}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">
                              {chat.messageCount} {chat.messageCount === 1 ? 'message' : 'messages'}
                            </span>
                            {chat.workspace && (
                              <>
                                <span className="text-gray-600">•</span>
                                <span className="text-xs text-gray-500">{chat.workspace}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#0D1B2A] flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No Chats Yet</h3>
                  <p className="text-[#CCCCCC] text-sm max-w-sm mx-auto mb-4">
                    Start a conversation with AI or team members
                  </p>
                  <button
                    onClick={() => router.push('/chat')}
                    className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    Start Chat
                  </button>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-black border border-gray-800 rounded-2xl p-6 shadow-2xl hover:border-[#1F77FF]/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ClockIcon className="w-6 h-6 text-[#1F77FF]" />
                  Recent Activity
                </h2>
                {activities.length > 0 && (
                  <span className="px-3 py-1 bg-[#1F77FF]/10 text-[#1F77FF] text-xs font-semibold rounded-full">
                    {activities.length} {activities.length === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#0D1B2A] flex items-center justify-center">
                    <ClockIcon className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No Activity Yet</h3>
                  <p className="text-[#CCCCCC] text-sm max-w-sm mx-auto">
                    Start exploring knowledge cards to see your activity history here
                  </p>
                  <button
                    onClick={() => router.push('/cards')}
                    className="mt-6 px-6 py-2.5 bg-[#1F77FF] hover:bg-[#0D5FD9] text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1F77FF] focus:ring-offset-2 focus:ring-offset-black"
                  >
                    Explore Cards
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && profile && (
        <ProfileEditModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}
