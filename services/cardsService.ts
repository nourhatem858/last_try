/**
 * Cards Service - Knowledge Cards CRUD operations
 */

import axios from '@/lib/axios';

export interface Card {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  bookmarked?: boolean;
  liked?: boolean;
  likesCount?: number;
  bookmarksCount?: number;
}

export interface CreateCardData {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export interface UpdateCardData extends Partial<CreateCardData> {}

export interface GetCardsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  order?: 'asc' | 'desc';
}

export interface CardsResponse {
  cards: Card[];
  total: number;
  page: number;
  totalPages: number;
}

class CardsService {
  /**
   * Get all cards with filters and pagination
   */
  async getCards(params: GetCardsParams = {}): Promise<CardsResponse> {
    try {
      const response = await axios.get('/api/cards', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a single card by ID
   */
  async getCard(id: string): Promise<Card> {
    try {
      const response = await axios.get(`/api/cards/${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new card
   */
  async createCard(data: CreateCardData): Promise<Card> {
    try {
      const response = await axios.post('/api/cards', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update a card
   */
  async updateCard(id: string, data: UpdateCardData): Promise<Card> {
    try {
      const response = await axios.patch(`/api/cards/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a card
   */
  async deleteCard(id: string): Promise<void> {
    try {
      await axios.delete(`/api/cards/${id}`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's own cards
   */
  async getMyCards(params: GetCardsParams = {}): Promise<CardsResponse> {
    try {
      const response = await axios.get('/api/cards/my-cards', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get cards by category
   */
  async getCardsByCategory(category: string, params: GetCardsParams = {}): Promise<CardsResponse> {
    try {
      const response = await axios.get(`/api/cards/category/${category}`, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Search cards
   */
  async searchCards(query: string, params: GetCardsParams = {}): Promise<CardsResponse> {
    try {
      const response = await axios.get('/api/cards/search', {
        params: { q: query, ...params },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get trending cards
   */
  async getTrendingCards(limit: number = 10): Promise<Card[]> {
    try {
      const response = await axios.get('/api/cards/trending', {
        params: { limit },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get recommended cards
   */
  async getRecommendedCards(limit: number = 10): Promise<Card[]> {
    try {
      const response = await axios.get('/api/cards/recommended', {
        params: { limit },
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

export default new CardsService();
