/**
 * Analytics Service - Track user actions and analytics
 */

import axios from '@/lib/axios';

export type ActionType = 'view' | 'like' | 'bookmark' | 'search' | 'create' | 'update' | 'delete' | 'share';

export interface AnalyticsLog {
  action: ActionType;
  cardId?: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalBookmarks: number;
  totalSearches: number;
  popularCards: Array<{
    cardId: string;
    title: string;
    views: number;
    likes: number;
  }>;
  recentActivity: Array<{
    action: ActionType;
    timestamp: string;
    cardTitle?: string;
  }>;
  categoryStats: Array<{
    category: string;
    count: number;
  }>;
}

export interface UserAnalytics {
  cardsCreated: number;
  cardsViewed: number;
  cardsLiked: number;
  cardsBookmarked: number;
  searchesPerformed: number;
  activeTime: number;
  lastActive: string;
}

class AnalyticsService {
  /**
   * Log a user action
   */
  async logAction(data: AnalyticsLog): Promise<void> {
    try {
      await axios.post('/api/analytics/log', data);
    } catch (error: any) {
      // Don't throw errors for analytics - fail silently
      console.error('Analytics logging failed:', error);
    }
  }

  /**
   * Log card view
   */
  async logView(cardId: string): Promise<void> {
    await this.logAction({
      action: 'view',
      cardId,
    });
  }

  /**
   * Log card like
   */
  async logLike(cardId: string): Promise<void> {
    await this.logAction({
      action: 'like',
      cardId,
    });
  }

  /**
   * Log card bookmark
   */
  async logBookmark(cardId: string): Promise<void> {
    await this.logAction({
      action: 'bookmark',
      cardId,
    });
  }

  /**
   * Log search query
   */
  async logSearch(query: string, resultsCount: number): Promise<void> {
    await this.logAction({
      action: 'search',
      metadata: {
        query,
        resultsCount,
      },
    });
  }

  /**
   * Log card creation
   */
  async logCreate(cardId: string, category: string): Promise<void> {
    await this.logAction({
      action: 'create',
      cardId,
      metadata: { category },
    });
  }

  /**
   * Get overall analytics (admin only)
   */
  async getAnalytics(startDate?: string, endDate?: string): Promise<AnalyticsData> {
    try {
      const response = await axios.get('/api/analytics', {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user-specific analytics
   */
  async getUserAnalytics(): Promise<UserAnalytics> {
    try {
      const response = await axios.get('/api/analytics/user');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get card-specific analytics
   */
  async getCardAnalytics(cardId: string): Promise<{
    views: number;
    likes: number;
    bookmarks: number;
    shares: number;
    viewsOverTime: Array<{ date: string; count: number }>;
  }> {
    try {
      const response = await axios.get(`/api/analytics/card/${cardId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get trending topics
   */
  async getTrendingTopics(limit: number = 10): Promise<Array<{
    topic: string;
    count: number;
    growth: number;
  }>> {
    try {
      const response = await axios.get('/api/analytics/trending', {
        params: { limit },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user activity timeline
   */
  async getActivityTimeline(days: number = 30): Promise<Array<{
    date: string;
    actions: number;
  }>> {
    try {
      const response = await axios.get('/api/analytics/timeline', {
        params: { days },
      });
      return response.data;
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

export default new AnalyticsService();
