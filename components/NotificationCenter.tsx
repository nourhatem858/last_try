/**
 * Notification Center - Integrated notification system with real-time updates
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import Notifications, { Notification } from './Notifications';

interface NotificationCenterProps {
  darkMode?: boolean;
  enablePolling?: boolean;
  pollingInterval?: number;
}

export default function NotificationCenter({
  darkMode = false,
  enablePolling = false,
  pollingInterval = 30000
}: NotificationCenterProps) {
  const [showNotifications, setShowNotifications] = useState(false);
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
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Polling for new notifications
  useEffect(() => {
    if (!enablePolling) return;

    const interval = setInterval(async () => {
      await fetchNotifications();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [enablePolling, pollingInterval]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH' });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));

    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleClearAll = async () => {
    setNotifications([]);

    try {
      await fetch('/api/notifications', { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className={`relative p-2 rounded-lg ${
          darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
        } transition-all duration-200 transform hover:scale-105`}
        aria-label="Notifications"
      >
        <BellIcon className={`w-6 h-6 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} />
        
        {/* Badge Count */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <Notifications
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDelete={handleDelete}
            onClearAll={handleClearAll}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}
