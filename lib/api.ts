/**
 * API Service
 * Handles all API calls to the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

// Knowledge Cards API
export const cardsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
    sort?: string;
  }) => {
    const queryParams = new URLSearchParams(
      Object.entries(params || {}).map(([key, value]) => [key, String(value)])
    );
    return apiCall(`/cards?${queryParams}`);
  },

  getById: (id: string) => apiCall(`/cards/${id}`),

  create: (data: {
    title: string;
    content: string;
    category: string;
    tags?: string[];
    visibility?: string;
  }) => apiCall('/cards', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<{
    title: string;
    content: string;
    category: string;
    tags: string[];
    visibility: string;
  }>) => apiCall(`/cards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) => apiCall(`/cards/${id}`, { method: 'DELETE' }),

  getMyCards: (page?: number, limit?: number) => 
    apiCall(`/cards/user/my-cards?page=${page || 1}&limit=${limit || 10}`),

  getRelated: (id: string, limit?: number) =>
    apiCall(`/cards/${id}/related?limit=${limit || 5}`),
};

// Interactions API
export const interactionsApi = {
  like: (cardId: string) => apiCall(`/interactions/${cardId}/like`, { method: 'POST' }),
  unlike: (cardId: string) => apiCall(`/interactions/${cardId}/like`, { method: 'DELETE' }),
  bookmark: (cardId: string) => apiCall(`/interactions/${cardId}/bookmark`, { method: 'POST' }),
  unbookmark: (cardId: string) => apiCall(`/interactions/${cardId}/bookmark`, { method: 'DELETE' }),
  getBookmarks: (page?: number, limit?: number) =>
    apiCall(`/interactions/bookmarks?page=${page || 1}&limit=${limit || 10}`),
  getLikes: (page?: number, limit?: number) =>
    apiCall(`/interactions/likes?page=${page || 1}&limit=${limit || 10}`),
  getStats: (cardId: string) => apiCall(`/interactions/stats/${cardId}`),
};

// Recommendations API
export const recommendationsApi = {
  getPersonalized: (limit?: number) =>
    apiCall(`/recommendations/personalized?limit=${limit || 10}`),
  getTrending: (days?: number, limit?: number) =>
    apiCall(`/recommendations/trending?days=${days || 7}&limit=${limit || 10}`),
  getSuggestions: (data: { title: string; content: string; tags?: string[] }) =>
    apiCall('/recommendations/suggest', { method: 'POST', body: JSON.stringify(data) }),
};

// Notifications API
export const notificationsApi = {
  getAll: (params?: { page?: number; limit?: number; read?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.read !== undefined) queryParams.append('read', String(params.read));
    return apiCall(`/notifications?${queryParams}`);
  },
  markAsRead: (id: string) => apiCall(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllAsRead: () => apiCall('/notifications/read-all', { method: 'PATCH' }),
  delete: (id: string) => apiCall(`/notifications/${id}`, { method: 'DELETE' }),
  deleteAllRead: () => apiCall('/notifications/read', { method: 'DELETE' }),
};

// Auth API
export const authApi = {
  signup: (data: { name: string; email: string; password: string }) =>
    apiCall('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    apiCall('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getCurrentUser: () => apiCall('/users/me'),
};
