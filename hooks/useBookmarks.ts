/**
 * useBookmarks Hook - Manage bookmarks and likes
 */

'use client';

import { useState, useCallback } from 'react';
import bookmarksService from '@/services/bookmarksService';
import analyticsService from '@/services/analyticsService';

export function useBookmark(cardId: string, initialBookmarked = false) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const toggleBookmark = useCallback(async () => {
    setLoading(true);
    
    // Optimistic update
    const previousState = bookmarked;
    const previousCount = bookmarksCount;
    setBookmarked(!bookmarked);
    setBookmarksCount(prev => bookmarked ? prev - 1 : prev + 1);

    try {
      const response = await bookmarksService.toggleBookmark(cardId);
      setBookmarked(response.bookmarked);
      setBookmarksCount(response.bookmarksCount);
      
      // Log analytics
      if (response.bookmarked) {
        await analyticsService.logBookmark(cardId);
      }
    } catch (error) {
      // Revert on error
      setBookmarked(previousState);
      setBookmarksCount(previousCount);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [cardId, bookmarked, bookmarksCount]);

  return { bookmarked, bookmarksCount, toggleBookmark, loading };
}

export function useLike(cardId: string, initialLiked = false) {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const toggleLike = useCallback(async () => {
    setLoading(true);
    
    // Optimistic update
    const previousState = liked;
    const previousCount = likesCount;
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);

    try {
      const response = await bookmarksService.toggleLike(cardId);
      setLiked(response.liked);
      setLikesCount(response.likesCount);
      
      // Log analytics
      if (response.liked) {
        await analyticsService.logLike(cardId);
      }
    } catch (error) {
      // Revert on error
      setLiked(previousState);
      setLikesCount(previousCount);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [cardId, liked, likesCount]);

  return { liked, likesCount, toggleLike, loading };
}
