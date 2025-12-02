'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KnowledgeCard from '@/components/KnowledgeCard';
import CardModal from '@/components/CardModal';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Technology',
  'Science',
  'Business',
  'Design',
  'Development',
  'AI & ML',
  'Data Science',
  'Marketing',
  'Other',
];

export default function CardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [userBookmarks, setUserBookmarks] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCards();
    loadUserData();
  }, [selectedCategory, searchQuery]);

  const loadUserData = () => {
    // Get user from localStorage (from signup/login)
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

  const fetchCards = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/cards?${params}`);
      const data = await response.json();

      if (data.success) {
        setCards(data.cards);
      }
    } catch (error) {
      console.error('Failed to fetch cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (cardId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ [Cards Page | handleLike] User not authenticated', { cardId });
      return;
    }

    try {
      const response = await fetch(`/api/cards/${cardId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        if (data.isLiked) {
          setUserLikes(new Set([...userLikes, cardId]));
        } else {
          const newLikes = new Set(userLikes);
          newLikes.delete(cardId);
          setUserLikes(newLikes);
        }
        // Update card in list
        setCards(cards.map(card =>
          card._id === cardId ? { ...card, likes: data.likes } : card
        ));
      }
    } catch (error) {
      console.error('Failed to like card:', error);
    }
  };

  const handleBookmark = async (cardId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ [Cards Page | handleBookmark] User not authenticated', { cardId });
      return;
    }

    try {
      const response = await fetch(`/api/cards/${cardId}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        if (data.isBookmarked) {
          setUserBookmarks(new Set([...userBookmarks, cardId]));
        } else {
          const newBookmarks = new Set(userBookmarks);
          newBookmarks.delete(cardId);
          setUserBookmarks(newBookmarks);
        }
        // Update card in list
        setCards(cards.map(card =>
          card._id === cardId ? { ...card, bookmarks: data.bookmarks } : card
        ));
      }
    } catch (error) {
      console.error('Failed to bookmark card:', error);
    }
  };

  const handleDelete = async (cardId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setCards(cards.filter(card => card._id !== cardId));
        setSelectedCard(null);
      }
    } catch (error) {
      console.error('Failed to delete card:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Knowledge Cards
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Discover and share knowledge with the community
              </p>
            </div>
            <button
              onClick={() => router.push('/cards/create')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all font-medium shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Card
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cards..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-12 pr-8 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              No cards found
            </p>
            <button
              onClick={() => router.push('/cards/create')}
              className="text-cyan-500 hover:text-cyan-600 font-medium"
            >
              Create the first card
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <KnowledgeCard
                key={card._id}
                card={card}
                isLiked={userLikes.has(card._id)}
                isBookmarked={userBookmarks.has(card._id)}
                onLike={handleLike}
                onBookmark={handleBookmark}
                onClick={(id) => setSelectedCard(card)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          currentUserId={currentUserId || undefined}
          isLiked={userLikes.has(selectedCard._id)}
          isBookmarked={userBookmarks.has(selectedCard._id)}
          onClose={() => setSelectedCard(null)}
          onLike={handleLike}
          onBookmark={handleBookmark}
          onEdit={(id) => router.push(`/cards/edit/${id}`)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
