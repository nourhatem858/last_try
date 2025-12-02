/**
 * Notifications Component - Display and manage user notifications
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  BellIcon, 
  CheckIcon, 
  XMarkIcon,
  FunnelIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { 
  BellAlertIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  UserPlusIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';

export interface Notification {
  id: string;
  type: 'comment' | 'like' | 'follow' | 'system' | 'mention';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationsProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  loading?: boolean;
  className?: string;
}

export default function Notifications({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  loading = false,
  className = ''
}: NotificationsProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'comment':
        return <ChatBubbleLeftIcon className="w-5 h-5 text-blue-500" />;
      case 'like':
        return <HeartIcon className="w-5 h-5 text-red-500" />;
      case 'follow':
        return <UserPlusIcon className="w-5 h-5 text-green-500" />;
      case 'mention':
        return <BellAlertIcon className="w-5 h-5 text-purple-500" />;
      case 'system':
        return <SparklesIcon className="w-5 h-5 text-cyan-500" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-500" />;
    }
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
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Filter notifications"
            >
              <FunnelIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            {/* Mark All Read */}
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Mark all as read"
              >
                <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-3 flex gap-2 animate-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                filter === 'unread'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {loading ? (
          <NotificationsSkeleton count={3} />
        ) : filteredNotifications.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <BellIcon className="w-16 h-16 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {filter === 'unread' ? 'You\'re all caught up!' : 'We\'ll notify you when something happens'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredNotifications.map((notification, index) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`px-4 py-3 transition-all duration-200 cursor-pointer group relative animate-in slide-in-from-top-2 ${
                  !notification.read
                    ? 'bg-cyan-50/50 dark:bg-cyan-900/10 hover:bg-cyan-100/50 dark:hover:bg-cyan-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    !notification.read 
                      ? 'bg-white dark:bg-gray-800 shadow-sm' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${
                          !notification.read 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>

                      {/* Unread Indicator */}
                      {!notification.read && (
                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex-shrink-0 mt-1.5 animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(notification.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    title="Delete notification"
                  >
                    <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 0 && !loading && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClearAll}
            className="w-full text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
          >
            Clear All Notifications
          </button>
        </div>
      )}
    </div>
  );
}

// Notifications Skeleton Loader
function NotificationsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="px-4 py-3 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
