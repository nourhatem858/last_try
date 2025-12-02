'use client';

/**
 * Smart Search Component
 * Real-time search with debounce, keyboard navigation, and grouped results
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  DocumentIcon,
  UserIcon,
  FolderIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface SearchResult {
  notes: Array<{
    id: string;
    title: string;
    content: string;
    workspace: string;
    type: 'note';
  }>;
  documents: Array<{
    id: string;
    title: string;
    fileName: string;
    fileType: string;
    type: 'document';
  }>;
  members: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    type: 'member';
  }>;
  workspaces: Array<{
    id: string;
    name: string;
    description: string;
    type: 'workspace';
  }>;
}

export default function SmartSearch() {
  const router = useRouter();
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({
    notes: [],
    documents: [],
    members: [],
    workspaces: [],
  });
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Flatten results for keyboard navigation
  const allResults = [
    ...results.notes.map((r) => ({ ...r, type: 'note' as const })),
    ...results.documents.map((r) => ({ ...r, type: 'document' as const })),
    ...results.members.map((r) => ({ ...r, type: 'member' as const })),
    ...results.workspaces.map((r) => ({ ...r, type: 'workspace' as const })),
  ];

  // Search function with debounce
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || !token) {
        setResults({ notes: [], documents: [], members: [], workspaces: [] });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setResults(data.data);
          }
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Handle input change with debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.trim()) {
      setLoading(true);
      debounceTimer.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setResults({ notes: [], documents: [], members: [], workspaces: [] });
      setLoading(false);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, performSearch]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleResultClick(allResults[selectedIndex]);
    }
  };

  // Handle result click
  const handleResultClick = (result: any) => {
    setShowResults(false);
    setQuery('');
    setSelectedIndex(-1);

    switch (result.type) {
      case 'note':
        router.push(`/notes/${result.id}`);
        break;
      case 'document':
        router.push(`/documents/${result.id}`);
        break;
      case 'member':
        router.push(`/members/${result.id}`);
        break;
      case 'workspace':
        router.push(`/workspaces/${result.id}`);
        break;
    }
  };

  // Highlight matched text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-cyan-500/30 text-cyan-300 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const hasResults =
    results.notes.length > 0 ||
    results.documents.length > 0 ||
    results.members.length > 0 ||
    results.workspaces.length > 0;

  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value.substring(0, 60))}
          onFocus={() => setShowResults(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search notes, documents, members, workspaces..."
          className="
            w-full pl-12 pr-12 py-3 rounded-xl
            bg-black/40 border border-cyan-500/20
            text-white placeholder-gray-500
            focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
            transition-all duration-200
          "
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults({ notes: [], documents: [], members: [], workspaces: [] });
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0D1B2A] border border-cyan-500/20 rounded-xl shadow-2xl max-h-[500px] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {loading && (
            <div className="p-4">
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-cyan-500/20 rounded w-3/4" />
                      <div className="h-3 bg-cyan-500/10 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && !hasResults && (
            <div className="p-8 text-center">
              <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400">No results found for "{query}"</p>
              <p className="text-sm text-gray-500 mt-1">Try different keywords</p>
            </div>
          )}

          {!loading && hasResults && (
            <div className="p-2">
              {/* Notes */}
              {results.notes.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Notes
                  </div>
                  {results.notes.map((note, index) => {
                    const globalIndex = index;
                    return (
                      <button
                        key={note.id}
                        onClick={() => handleResultClick(note)}
                        className={`
                          w-full flex items-start gap-3 p-3 rounded-lg text-left
                          transition-all duration-150
                          ${
                            selectedIndex === globalIndex
                              ? 'bg-cyan-500/20 border border-cyan-500/30'
                              : 'hover:bg-white/5'
                          }
                        `}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <DocumentTextIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {highlightText(note.title, query)}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {highlightText(note.content, query)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{note.workspace}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Documents */}
              {results.documents.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Documents
                  </div>
                  {results.documents.map((doc, index) => {
                    const globalIndex = results.notes.length + index;
                    return (
                      <button
                        key={doc.id}
                        onClick={() => handleResultClick(doc)}
                        className={`
                          w-full flex items-start gap-3 p-3 rounded-lg text-left
                          transition-all duration-150
                          ${
                            selectedIndex === globalIndex
                              ? 'bg-cyan-500/20 border border-cyan-500/30'
                              : 'hover:bg-white/5'
                          }
                        `}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                          <DocumentIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {highlightText(doc.title, query)}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {highlightText(doc.fileName, query)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{doc.fileType.toUpperCase()}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Members */}
              {results.members.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Members
                  </div>
                  {results.members.map((member, index) => {
                    const globalIndex = results.notes.length + results.documents.length + index;
                    return (
                      <button
                        key={member.id}
                        onClick={() => handleResultClick(member)}
                        className={`
                          w-full flex items-start gap-3 p-3 rounded-lg text-left
                          transition-all duration-150
                          ${
                            selectedIndex === globalIndex
                              ? 'bg-cyan-500/20 border border-cyan-500/30'
                              : 'hover:bg-white/5'
                          }
                        `}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="w-full h-full rounded-lg" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {highlightText(member.name, query)}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {highlightText(member.email, query)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Workspaces */}
              {results.workspaces.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Workspaces
                  </div>
                  {results.workspaces.map((workspace, index) => {
                    const globalIndex =
                      results.notes.length + results.documents.length + results.members.length + index;
                    return (
                      <button
                        key={workspace.id}
                        onClick={() => handleResultClick(workspace)}
                        className={`
                          w-full flex items-start gap-3 p-3 rounded-lg text-left
                          transition-all duration-150
                          ${
                            selectedIndex === globalIndex
                              ? 'bg-cyan-500/20 border border-cyan-500/30'
                              : 'hover:bg-white/5'
                          }
                        `}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                          <FolderIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {highlightText(workspace.name, query)}
                          </p>
                          {workspace.description && (
                            <p className="text-xs text-gray-400 truncate mt-1">{workspace.description}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Keyboard hints */}
          {!loading && hasResults && (
            <div className="px-4 py-2 border-t border-cyan-500/10 bg-black/20">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
