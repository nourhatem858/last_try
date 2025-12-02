'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Card, CardFilters } from '@/types';
import axios from '@/lib/axios';

interface CardsContextType {
  cards: Card[];
  loading: boolean;
  error: string | null;
  filters: CardFilters;
  setFilters: (filters: CardFilters) => void;
  fetchCards: () => Promise<void>;
  createCard: (cardData: any) => Promise<void>;
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

      const response = await axios.get(`/api/cards?${params.toString()}`);

      if (response.data.success) {
        setCards(response.data.cards || []);
      } else {
        setError(response.data.error || 'Failed to fetch cards');
      }
    } catch (err: any) {
      console.error('Error fetching cards:', err);
      setError(err.response?.data?.error || 'Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createCard = async (cardData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/cards', cardData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        await fetchCards(); // Refresh cards list
      }
    } catch (err: any) {
      console.error('Error creating card:', err);
      throw err;
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
