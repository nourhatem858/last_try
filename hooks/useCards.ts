/**
 * useCards Hook - Fetch and manage cards data
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import cardsService, { Card, GetCardsParams } from '@/services/cardsService';
import analyticsService from '@/services/analyticsService';

export function useCards(params: GetCardsParams = {}) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(params.page || 1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cardsService.getCards({ ...params, page });
      setCards(response.cards);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params, page]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const refresh = () => {
    fetchCards();
  };

  const nextPage = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum);
    }
  };

  return {
    cards,
    loading,
    error,
    total,
    page,
    totalPages,
    refresh,
    nextPage,
    prevPage,
    goToPage,
  };
}

export function useCard(cardId: string) {
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await cardsService.getCard(cardId);
        setCard(data);
        
        // Log view
        await analyticsService.logView(cardId);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (cardId) {
      fetchCard();
    }
  }, [cardId]);

  const refresh = async () => {
    try {
      const data = await cardsService.getCard(cardId);
      setCard(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { card, loading, error, refresh };
}

export function useMyCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cardsService.getMyCards();
      setCards(response.cards);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyCards();
  }, [fetchMyCards]);

  return { cards, loading, error, refresh: fetchMyCards };
}

export function useSearchCards(query: string) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchCards = async () => {
      if (!query || query.length < 2) {
        setCards([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await cardsService.searchCards(query);
        setCards(response.cards);
        
        // Log search
        await analyticsService.logSearch(query, response.cards.length);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchCards, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return { cards, loading, error };
}
