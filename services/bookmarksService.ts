/**
 * Bookmarks & Likes Service - Handle user interactions with cards
 */

import axios from '@/lib/axios';
import { Card } from './cardsService';

export interface BookmarkResponse {
  success: boolean;
  bookmarked: boolean;
  bookmarksCount: number;
}

export interface LikeResponse {
  success: boolean;
  liked: boolean;
  likesCount: number;
}

class BookmarksService {
  /**
   * Toggle bookmark on a card
   */
  async toggleBookmark(cardId: string): Promise<BookmarkResponse> {
    try {
      const response = await axios.post(`/api/bookmarks/${cardId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all bookmarked cards
   */
  async getBookmarkedCards(page: number = 1, limit: number = 20): Promise<{
    cards: Card[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const response = await axios.get('/api/bookmarks', {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove bookmark from a card
   */
  async removeBookmark(cardId: string): Promise<void> {
    try {
      await axios.delete(`/api/bookmarks/${cardId}`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if card is bookmarked
   */
  async isBookmarked(cardId: string): Promise<boolean> {
    try {
      const response = await axios.get(`/api/bookmarks/${cardId}/status`);
      return response.data.bookmarked;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Toggle like on a card
   */
  async toggleLike(cardId: string): Promise<LikeResponse> {
    try {
      const response = await axios.post(`/api/likes/${cardId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all liked cards
   */
  async getLikedCards(page: number = 1, limit: number = 20): Promise<{
    cards: Card[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const response = await axios.get('/api/likes', {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove like from a card
   */
  async removeLike(cardId: string): Promise<void> {
    try {
      await axios.delete(`/api/likes/${cardId}`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if card is liked
   */
  async isLiked(cardId: string): Promise<boolean> {
    try {
      const response = await axios.get(`/api/likes/${cardId}/status`);
      return response.data.liked;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get bookmark and like counts for a card
   */
  async getCardStats(cardId: string): Promise<{
    bookmarksCount: number;
    likesCount: number;
    bookmarked: boolean;
    liked: boolean;
  }> {
    try {
      const response = await axios.get(`/api/cards/${cardId}/stats`);
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

export default new BookmarksService();
