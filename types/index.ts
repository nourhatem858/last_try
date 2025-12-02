/**
 * TypeScript Types for Knowledge Sharing App
 */

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  error?: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Card Types
export interface Card {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  authorName: string;
  likes: number;
  bookmarks: number;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CardsResponse {
  success: boolean;
  cards?: Card[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
}

export interface CreateCardRequest {
  title: string;
  content: string;
  category: string;
  tags: string[];
  isDraft?: boolean;
}

export interface CreateCardResponse {
  success: boolean;
  message?: string;
  card?: Card;
  error?: string;
}

// AI Types
export interface AIGenerateRequest {
  prompt: string;
  category?: string;
}

export interface AIGenerateResponse {
  success: boolean;
  content?: string;
  title?: string;
  tags?: string[];
  error?: string;
}

// Filter Types
export interface CardFilters {
  category?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
}
