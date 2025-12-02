/**
 * useNotifications Hook - Fetch and manage notifications
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import notificationsService, { Notification } from '@/services/notificationsService';

export function useNotifications(enablePolling = false, pollingInterval = 30000) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setError(null);
      const response = await notificationsService.getNotifications();
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    if (enablePolling) {
      const interval = setInterval(fetchNotifications, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, enablePolling, pollingInterval]);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await notificationsService.markAsRead(id);
    } catch (err: any) {
      // Revert on error
      fetchNotifications();
      throw err;
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await notificationsService.markAllAsRead();
    } catch (err: any) {
      // Revert on error
      fetchNotifications();
      throw err;
    }
  };

  const deleteNotification = async (id: string) => {
    // Optimistic update
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      await notificationsService.deleteNotification(id);
    } catch (err: any) {
      // Revert on error
      fetchNotifications();
      throw err;
    }
  };

  const clearAll = async () => {
    // Optimistic update
    setNotifications([]);
    setUnreadCount(0);

    try {
      await notificationsService.clearAll();
    } catch (err: any) {
      // Revert on error
      fetchNotifications();
      throw err;
    }
  };

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh: fetchNotifications,
  };
}
