'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Card, CardFilters, CardsResponse, CreateCardRequest, CreateCardResponse } from '@/types';
import axios from 'axios';
import axiosInstance from '@/lib/axios';

interface CardsContextType {
  cards: Card[];
  loading: boolean;
  error: string | null;
  filters: CardFilters;
  setFilters: (filters: CardFilters) => void;
  fetchCards: () => Promise<void>;
  createCard: (cardData: CreateCardRequest) => Promise<void>;
  refreshCards: () => Promise<void>;
}

const CardsContext = createContext<CardsContextType | undefined>(undefined);

export function CardsProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CardFilters>({
    page: 1,
    limit: 10,
  });

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.tags && filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }
      params.append('page', String(filters.page || 1));
      params.append('limit', String(filters.limit || 10));

      // Properly typed axios response
      const response = await axiosInstance.get<CardsResponse>(`/api/cards?${params.toString()}`);

      // TypeScript now knows the shape of response.data
      if (response.data.success) {
        setCards(response.data.cards || []);
      } else {
        setError(response.data.error || 'Failed to fetch cards');
      }
    } catch (err) {
      console.error('Error fetching cards:', err);
      
      // Type-safe error handling
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch cards';
        setError(errorMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createCard = async (cardData: CreateCardRequest) => {
    try {
      const token = localStorage.getItem('token');
      
      // Properly typed axios response
      const response = await axiosInstance.post<CreateCardResponse>('/api/cards', cardData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        await fetchCards(); // Refresh cards list
      } else {
        throw new Error(response.data.error || 'Failed to create card');
      }
    } catch (err) {
      console.error('Error creating card:', err);
      
      // Type-safe error handling
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to create card';
        throw new Error(errorMessage);
      } else if (err instanceof Error) {
        throw err;
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  };

  const refreshCards = async () => {
    await fetchCards();
  };

  return (
    <CardsContext.Provider
      value={{
        cards,
        loading,
        error,
        filters,
        setFilters,
        fetchCards,
        createCard,
        refreshCards,
      }}
    >
      {children}
    </CardsContext.Provider>
  );
}

export function useCards() {
  const context = useContext(CardsContext);
  if (context === undefined) {
    throw new Error('useCards must be used within a CardsProvider');
  }
  return context;
}
