/**
 * Notifications Service - Handle user notifications
 */

import axios from '@/lib/axios';

export interface Notification {
  id: string;
  type: 'comment' | 'like' | 'follow' | 'system' | 'mention';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

class NotificationsService {
  /**
   * Get all notifications
   */
  async getNotifications(filter?: 'all' | 'unread', limit: number = 50): Promise<NotificationsResponse> {
    try {
      const response = await axios.get('/api/notifications', {
        params: { filter, limit },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await axios.get('/api/notifications/unread-count');
      return response.data.count;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await axios.patch('/api/notifications/read-all');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Clear all notifications
   */
  async clearAll(): Promise<void> {
    try {
      await axios.delete('/api/notifications');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<{
    email: boolean;
    push: boolean;
    weekly: boolean;
    mentions: boolean;
  }> {
    try {
      const response = await axios.get('/api/notifications/preferences');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: {
    email?: boolean;
    push?: boolean;
    weekly?: boolean;
    mentions?: boolean;
  }): Promise<void> {
    try {
      await axios.patch('/api/notifications/preferences', preferences);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      return new Error('No response from server. Please check your connection.');
    } else {
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export default new NotificationsService();
