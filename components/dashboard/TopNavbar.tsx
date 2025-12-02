'use client';

/**
 * Top Navbar Component
 * Search bar, notifications, and user profile dropdown
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import SmartSearch from '@/components/search/SmartSearch';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function TopNavbar() {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications - FIXED to use real MongoDB data
  useEffect(() => {
    if (token) {
      fetchNotifications();
      
      // Refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      // Clear notifications when logged out
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      console.log('🔔 Fetching real notifications from database...');
      
      const response = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Notifications received:', data.data?.length || 0);
        console.log('✅ Unread count:', data.unreadCount || 0);
        
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        console.error('❌ Failed to fetch notifications:', response.status);
        // Clear on error
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
      // Clear on error
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleLogout = () => {
    // Clear all component state
    setNotifications([]);
    setUnreadCount(0);
    setShowNotifications(false);
    setShowProfile(false);
    
    // Call logout (will handle full cleanup and redirect)
    logout();
  };

  const getNotificationIcon = (type: string) => {
    const colors = {
      info: 'text-blue-400',
      success: 'text-green-400',
      warning: 'text-yellow-400',
      error: 'text-red-400',
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <nav className="sticky top-0 z-30 bg-[#0D1B2A]/95 backdrop-blur-xl border-b border-cyan-500/20">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Smart Search */}
          <SmartSearch />

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="
                  relative p-2 rounded-lg text-gray-400
                  hover:text-white hover:bg-white/5
                  transition-all duration-200 group
                "
              >
                <BellIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-[#0D1B2A] border border-cyan-500/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-cyan-500/20">
                    <h3 className="text-lg font-semibold text-white">Notifications</h3>
                    <p className="text-sm text-gray-400">{unreadCount} unread</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <BellIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`
                            p-4 border-b border-cyan-500/10 hover:bg-white/5
                            transition-colors cursor-pointer
                            ${!notif.read ? 'bg-cyan-500/5' : ''}
                          `}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${getNotificationIcon(notif.type)}`} />
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-white">{notif.title}</h4>
                              <p className="text-sm text-gray-400 mt-1">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-2">{formatTimestamp(notif.timestamp)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t border-cyan-500/20 text-center">
                    <button className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="
                    flex items-center gap-3 px-3 py-2 rounded-lg
                    hover:bg-white/5 transition-all duration-200 group
                  "
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-shadow">
                    <span className="text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.role}</p>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {showProfile && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#0D1B2A] border border-cyan-500/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-cyan-500/20">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                          <span className="text-white font-bold">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => router.push('/profile')}
                        className="
                          w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
                          text-gray-300 hover:text-white hover:bg-white/5
                          transition-all duration-200 group
                        "
                      >
                        <UserCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>View Profile</span>
                      </button>
                      <button
                        onClick={() => router.push('/settings')}
                        className="
                          w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
                          text-gray-300 hover:text-white hover:bg-white/5
                          transition-all duration-200 group
                        "
                      >
                        <Cog6ToothIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Settings</span>
                      </button>
                    </div>
                    <div className="p-2 border-t border-cyan-500/20">
                      <button
                        onClick={handleLogout}
                        className="
                          w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
                          text-red-400 hover:text-red-300 hover:bg-red-500/10
                          transition-all duration-200 group
                        "
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="
                  px-6 py-2.5 rounded-lg font-semibold
                  bg-gradient-to-r from-cyan-500 to-blue-600
                  text-white shadow-lg shadow-cyan-500/30
                  hover:shadow-cyan-500/50 hover:scale-105
                  transition-all duration-200
                "
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
