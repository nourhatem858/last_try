'use client';

/**
 * CardsProvider - Context for managing cards state
 * Provides cards data and operations to all components
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Card interface
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

// Context type
interface CardsContextType {
  cards: Card[];
  loading: boolean;
  error: string | null;
  setCards: (cards: Card[]) => void;
  addCard: (card: Card) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  fetchCards: () => Promise<void>;
  refreshCards: () => Promise<void>;
}

// Create context with default values
const CardsContext = createContext<CardsContextType>({
  cards: [],
  loading: false,
  error: null,
  setCards: () => {},
  addCard: () => {},
  updateCard: () => {},
  deleteCard: () => {},
  fetchCards: async () => {},
  refreshCards: async () => {},
});

// Provider props
interface CardsProviderProps {
  children: ReactNode;
}

// Provider component
export function CardsProvider({ children }: CardsProviderProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cards from API
  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const response = await fetch('/api/cards', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }

      const data = await response.json();
      
      if (data.success && data.cards) {
        setCards(data.cards);
      }
    } catch (err: any) {
      console.error('Error fetching cards:', err);
      setError(err.message || 'Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new card
  const addCard = useCallback((card: Card) => {
    setCards((prev) => [card, ...prev]);
  }, []);

  // Update a card
  const updateCard = useCallback((id: string, updates: Partial<Card>) => {
    setCards((prev) =>
      prev.map((card) =>
        card._id === id ? { ...card, ...updates } : card
      )
    );
  }, []);

  // Delete a card
  const deleteCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((card) => card._id !== id));
  }, []);

  // Refresh cards (alias for fetchCards)
  const refreshCards = useCallback(async () => {
    await fetchCards();
  }, [fetchCards]);

  const value: CardsContextType = {
    cards,
    loading,
    error,
    setCards,
    addCard,
    updateCard,
    deleteCard,
    fetchCards,
    refreshCards,
  };

  return (
    <CardsContext.Provider value={value}>
      {children}
    </CardsContext.Provider>
  );
}

// Custom hook to use cards context
export function useCards() {
  const context = useContext(CardsContext);
  
  if (!context) {
    throw new Error('useCards must be used within a CardsProvider');
  }
  
  return context;
}

// Export context for advanced usage
export { CardsContext };
