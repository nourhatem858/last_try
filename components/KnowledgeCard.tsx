'use client';

import { useState } from 'react';
import { Heart, Bookmark, Calendar, User } from 'lucide-react';

interface KnowledgeCardProps {
  card: {
    _id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    authorName: string;
    likes: number;
    bookmarks: number;
    createdAt: string;
  };
  isLiked?: boolean;
  isBookmarked?: boolean;
  onLike?: (cardId: string) => void;
  onBookmark?: (cardId: string) => void;
  onClick?: (cardId: string) => void;
}

export default function KnowledgeCard({
  card,
  isLiked = false,
  isBookmarked = false,
  onLike,
  onBookmark,
  onClick,
}: KnowledgeCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [likeCount, setLikeCount] = useState(card.likes);
  const [bookmarkCount, setBookmarkCount] = useState(card.bookmarks);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    onLike?.(card._id);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
    setBookmarkCount(bookmarked ? bookmarkCount - 1 : bookmarkCount + 1);
    onBookmark?.(card._id);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPreview = (content: string, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div
      onClick={() => onClick?.(card._id)}
      className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-400"
    >
      {/* Category Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg">
          {card.category}
        </span>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 pr-20 line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
          {card.title}
        </h3>

        {/* Content Preview */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {getPreview(card.content)}
        </p>

        {/* Tags */}
        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {card.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                #{tag}
              </span>
            ))}
            {card.tags.length > 3 && (
              <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                +{card.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Author & Date */}
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

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                liked
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${liked ? 'fill-current' : ''}`}
              />
              <span className="text-sm font-medium">{likeCount}</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                bookmarked
                  ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20'
              }`}
            >
              <Bookmark
                className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`}
              />
              <span className="text-sm font-medium">{bookmarkCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hover Effect Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/5 group-hover:to-blue-500/5 transition-all duration-300 pointer-events-none" />
    </div>
  );
}
