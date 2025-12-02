'use client';

/**
 * Search Result Item Component
 * Renders individual search result with highlighting
 */

import {
  DocumentTextIcon,
  DocumentIcon,
  FolderIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';

interface SearchResultItemProps {
  result: any;
  query: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function SearchResultItem({
  result,
  query,
  isSelected,
  onClick,
}: SearchResultItemProps) {
  // Get icon based on type
  const getIcon = () => {
    switch (result.type) {
      case 'note':
        return DocumentTextIcon;
      case 'document':
        return DocumentIcon;
      case 'workspace':
        return FolderIcon;
      case 'chat':
        return ChatBubbleLeftIcon;
      default:
        return DocumentIcon;
    }
  };

  // Get gradient based on type
  const getGradient = () => {
    switch (result.type) {
      case 'note':
        return 'from-purple-500 to-pink-600';
      case 'document':
        return 'from-green-500 to-emerald-600';
      case 'workspace':
        return 'from-cyan-500 to-blue-600';
      case 'chat':
        return 'from-orange-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return (
          <mark
            key={index}
            className="bg-cyan-500/30 text-cyan-300 font-semibold rounded px-0.5"
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  const Icon = getIcon();
  const gradient = getGradient();

  // Get title and snippet
  const title = result.title || result.name || 'Untitled';
  const snippet = result.snippet || result.description || result.lastMessage || '';

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-start gap-3 p-3 rounded-lg
        text-left transition-all duration-200
        ${isSelected
          ? 'bg-cyan-500/20 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
          : 'bg-black/20 border border-transparent hover:bg-black/40 hover:border-cyan-500/20'
        }
      `}
    >
      {/* Icon */}
      <div
        className={`
          w-10 h-10 rounded-lg bg-gradient-to-br ${gradient}
          flex items-center justify-center flex-shrink-0
          shadow-lg transition-transform duration-200
          ${isSelected ? 'scale-110' : ''}
        `}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h4
          className={`
            text-sm font-semibold mb-1 truncate
            transition-colors duration-200
            ${isSelected ? 'text-cyan-300' : 'text-white'}
          `}
        >
          {highlightText(title, query)}
        </h4>

        {/* Snippet */}
        {snippet && (
          <p className="text-xs text-gray-400 line-clamp-2">
            {highlightText(snippet, query)}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-500 capitalize">
            {result.type}
          </span>
          {result.participants && result.participants.length > 0 && (
            <>
              <span className="text-xs text-gray-600">•</span>
              <span className="text-xs text-gray-500">
                {result.participants.length} participant{result.participants.length !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Arrow indicator */}
      <div
        className={`
          flex-shrink-0 transition-all duration-200
          ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
        `}
      >
        <svg
          className="w-5 h-5 text-cyan-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  );
}
