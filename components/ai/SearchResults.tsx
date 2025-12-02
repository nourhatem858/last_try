'use client';

import { useState, useEffect } from 'react';
import { useAI } from '@/contexts/AIProvider';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  ChatBubbleLeftIcon,
  FolderIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface SearchResultsProps {
  query: string;
  onDocumentClick?: (document: any) => void;
  onChatClick?: (chat: any) => void;
}

export default function SearchResults({ query, onDocumentClick, onChatClick }: SearchResultsProps) {
  const { searchContent, loading } = useAI();
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    try {
      setError('');
      const data = await searchContent(query);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    }
  };

  if (!query.trim()) {
    return (
      <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-12 text-center">
        <MagnifyingGlassIcon className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">
          Search Your Workspace
        </h3>
        <p className="text-gray-400">
          Enter a query to search across notes, documents, and chats
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6 animate-pulse"
          >
            <div className="h-6 bg-cyan-500/20 rounded w-3/4 mb-4" />
            <div className="h-4 bg-cyan-500/10 rounded w-full mb-2" />
            <div className="h-4 bg-cyan-500/10 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-500/10 to-black border border-red-500/20 rounded-2xl p-8 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!results || (results.notes?.length === 0 && results.documents?.length === 0 && results.chats?.length === 0)) {
    return (
      <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-12 text-center">
        <MagnifyingGlassIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">
          No Results Found
        </h3>
        <p className="text-gray-400">
          Try a different search query or check your spelling
        </p>
      </div>
    );
  }

  const totalResults = (results.notes?.length || 0) + (results.documents?.length || 0) + (results.chats?.length || 0);

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-2xl p-4">
        <p className="text-white">
          Found <span className="font-bold text-cyan-400">{totalResults}</span> results for "{query}"
        </p>
      </div>

      {/* Notes */}
      {results.notes && results.notes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardDocumentIcon className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">
              Notes ({results.notes.length})
            </h3>
          </div>

          <div className="space-y-3">
            {results.notes.map((note: any) => (
              <button
                key={note.id}
                onClick={() => onDocumentClick?.(note)}
                className="
                  w-full text-left p-6 rounded-2xl
                  bg-gradient-to-br from-[#0D1B2A] to-black
                  border border-cyan-500/20
                  hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/20
                  transition-all duration-300
                  group
                "
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <ClipboardDocumentIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                      {note.title}
                    </h4>
                    <p className="text-gray-400 line-clamp-2 mb-3">
                      {note.content || note.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex items-center gap-2">
                          {note.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{new Date(note.updatedAt || note.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {results.documents && results.documents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">
              Documents ({results.documents.length})
            </h3>
          </div>

          <div className="space-y-3">
            {results.documents.map((doc: any) => (
              <button
                key={doc.id}
                onClick={() => onDocumentClick?.(doc)}
                className="
                  w-full text-left p-6 rounded-2xl
                  bg-gradient-to-br from-[#0D1B2A] to-black
                  border border-cyan-500/20
                  hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/20
                  transition-all duration-300
                  group
                "
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                      {doc.title || doc.fileName}
                    </h4>
                    <p className="text-gray-400 line-clamp-2 mb-3">
                      {doc.excerpt || `${doc.fileType?.toUpperCase()} • ${(doc.fileSize / 1024).toFixed(2)} KB`}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {doc.workspace && (
                        <div className="flex items-center gap-1">
                          <FolderIcon className="w-4 h-4" />
                          <span>{doc.workspace}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chats */}
      {results.chats && results.chats.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ChatBubbleLeftIcon className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">
              Chats ({results.chats.length})
            </h3>
          </div>

          <div className="space-y-3">
            {results.chats.map((chat: any) => (
              <button
                key={chat.id}
                onClick={() => onChatClick?.(chat)}
                className="
                  w-full text-left p-6 rounded-2xl
                  bg-gradient-to-br from-[#0D1B2A] to-black
                  border border-cyan-500/20
                  hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/20
                  transition-all duration-300
                  group
                "
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <ChatBubbleLeftIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                      {chat.title}
                    </h4>
                    <p className="text-gray-400 line-clamp-2 mb-3">
                      {chat.lastMessage?.text || chat.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{new Date(chat.updatedAt || chat.createdAt).toLocaleDateString()}</span>
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">
                          {chat.unreadCount} unread
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
