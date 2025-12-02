/**
 * TypeScript Types
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    favorite_topics: string[];
    notifications_enabled: boolean;
    language: string;
  };
  isEmailVerified: boolean;
  created_at: string;
  updated_at?: string;
}

export interface KnowledgeCard {
  _id: string;
  title: string;
  content: string;
  author_id: {
    _id: string;
    name: string;
    email?: string;
  };
  tags: string[];
  category: string;
  visibility: 'public' | 'private' | 'shared';
  view_count: number;
  like_count: number;
  bookmark_count: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  _id: string;
  user_id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'like' | 'bookmark';
  related_card_id?: {
    _id: string;
    title: string;
    category: string;
  };
  read: boolean;
  created_at: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CardsResponse {
  cards: KnowledgeCard[];
  pagination: PaginationData;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
  pagination: PaginationData;
}
