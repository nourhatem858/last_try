'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Heart, Bookmark, Calendar, User, Edit, Trash2, Share2, Loader2 } from 'lucide-react';

export default function CardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadUserData();
    fetchCard();
  }, [params.id]);

  const loadUserData = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id);
      } catch (error) {
        console.error('Failed to parse token:', error);
      }
    }
  };

  const fetchCard = async () => {
    try {
      const response = await fetch(`/api/cards/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setCard(data.card);
      } else {
        console.error('❌ [Card Detail | fetchCard] Card not found', { cardId: params.id, error: data.error });
        router.push('/cards');
      }
    } catch (error: any) {
      console.error('❌ [Card Detail | fetchCard] Failed to load card', { 
        cardId: params.id, 
        error: error.message,
        stack: error.stack 
      });
      router.push('/cards');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ [Card Detail | handleLike] User not authenticated', { cardId: params.id });
      return;
    }

    try {
      const response = await fetch(`/api/cards/${params.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setIsLiked(data.isLiked);
        setCard({ ...card, likes: data.likes });
      }
    } catch (error) {
      console.error('Failed to like card:', error);
    }
  };

  const handleBookmark = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ [Card Detail | handleBookmark] User not authenticated', { cardId: params.id });
      return;
    }

    try {
      const response = await fetch(`/api/cards/${params.id}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setIsBookmarked(data.isBookmarked);
        setCard({ ...card, bookmarks: data.bookmarks });
      }
    } catch (error) {
      console.error('Failed to bookmark card:', error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      console.log('✅ [Card Detail | handleShare] Link copied to clipboard', { url: window.location.href });
    } catch (error: any) {
      console.error('❌ [Card Detail | handleShare] Failed to copy link', { 
        error: error.message,
        url: window.location.href 
      });
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/cards/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ [Card Detail | handleDelete] Card deleted successfully', { cardId: params.id });
        router.push('/cards');
      } else {
        console.error('❌ [Card Detail | handleDelete] Failed to delete card', { 
          status: response.status,
          error: data?.error,
          cardId: params.id 
        });
      }
    } catch (error: any) {
      console.error('❌ [Card Detail | handleDelete] Network error', { 
        error: error.message,
        stack: error.stack,
        cardId: params.id 
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!card) {
    return null;
  }

  const isOwner = currentUserId === card.author;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/cards')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Cards
          </button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                  {card.category}
                </span>
                {isOwner && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    Your Card
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {card.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{card.authorName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(card.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
          {/* Tags */}
          {card.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {card.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {card.content}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isLiked
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{card.likes}</span>
            </button>

            <button
              onClick={handleBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isBookmarked
                  ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>{card.bookmarks}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>

          {isOwner && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/cards/edit/${card._id}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Edit className="w-5 h-5" />
                <span>Edit</span>
              </button>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
