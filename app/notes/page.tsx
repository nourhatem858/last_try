'use client';

/**
 * Notes Page
 * Displays all notes for the logged-in user
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SidebarNav from '@/components/dashboard/SidebarNav';
import TopNavbar from '@/components/dashboard/TopNavbar';
import NoteCard from '@/components/notes/NoteCard';
import CreateNoteModal from '@/components/notes/CreateNoteModal';
import {
  DocumentPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  StarIcon,
  TagIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  workspace: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  color: string;
}

export default function NotesPage() {
  const { isAuthenticated, loading: authLoading, token } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch notes
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchNotes();
    }
  }, [isAuthenticated, token]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data.data || []);
      } else {
        setError('Failed to load notes');
      }
    } catch (err) {
      console.error('Fetch notes error:', err);
      setError('An error occurred while loading notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (data: { title: string; content: string; tags: string[]; color: string }) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setNotes([result.data, ...notes]);
        setShowCreateModal(false);
        setError('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create note');
      }
    } catch (err: any) {
      throw err;
    }
  };

  const handleEditNote = (note: Note) => {
    // TODO: Implement edit functionality
    console.log('Edit note:', note);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotes(notes.filter((n) => n.id !== noteId));
        console.log('✅ [Notes Page | handleDeleteNote] Note deleted successfully', { noteId });
      } else {
        const data = await response.json();
        console.error('❌ [Notes Page | handleDeleteNote] Failed to delete note', { 
          status: response.status, 
          error: data?.error,
          noteId 
        });
      }
    } catch (err: any) {
      console.error('❌ [Notes Page | handleDeleteNote] Network error', { 
        error: err.message, 
        stack: err.stack,
        noteId 
      });
    }
  };

  const handleTogglePin = async (noteId: string) => {
    // TODO: Implement pin toggle
    setNotes(
      notes.map((note) =>
        note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
      )
    );
  };

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags)));

  // Filter and sort notes
  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = filterTag === 'all' || note.tags.includes(filterTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Separate pinned and unpinned notes
  const pinnedNotes = filteredNotes.filter((note) => note.isPinned);
  const unpinnedNotes = filteredNotes.filter((note) => !note.isPinned);

  // Calculate stats
  const stats = {
    total: notes.length,
    pinned: notes.filter((n) => n.isPinned).length,
    tags: allTags.length,
  };

  // Show loading state
  if (authLoading || (loading && notes.length === 0)) {
    return (
      <div className="min-h-screen bg-black">
        <SidebarNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="lg:pl-64">
          <TopNavbar />
          <main className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-cyan-500/20 rounded-lg w-1/3" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 bg-cyan-500/20 rounded-2xl" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <SidebarNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="lg:pl-64">
        <TopNavbar />

        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Notes</h1>
              <p className="text-gray-400">
                Capture and organize your thoughts
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="
                flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                bg-gradient-to-r from-cyan-500 to-blue-600
                text-white shadow-lg shadow-cyan-500/30
                hover:shadow-cyan-500/50 hover:scale-105
                transition-all duration-200
              "
            >
              <DocumentPlusIcon className="w-5 h-5" />
              <span>Create Note</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: 'Total Notes',
                value: stats.total,
                icon: DocumentTextIcon,
                color: 'from-cyan-500 to-blue-600',
              },
              {
                label: 'Pinned',
                value: stats.pinned,
                icon: StarIcon,
                color: 'from-yellow-500 to-orange-600',
              },
              {
                label: 'Tags',
                value: stats.tags,
                icon: TagIcon,
                color: 'from-purple-500 to-pink-600',
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="
                    group bg-gradient-to-br from-[#0D1B2A] to-black
                    border border-cyan-500/20 rounded-2xl p-6
                    hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/20
                    transition-all duration-300
                  "
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`
                        w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color}
                        flex items-center justify-center shadow-lg
                        group-hover:scale-110 transition-transform duration-300
                      `}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filters and Search */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes..."
                  className="
                    w-full pl-12 pr-4 py-3 rounded-xl
                    bg-black/40 border border-cyan-500/20
                    text-white placeholder-gray-500
                    focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                    transition-all duration-200
                  "
                />
              </div>
            </div>

            {/* Filter by Tag */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="
                  px-4 py-3 rounded-xl
                  bg-black/40 border border-cyan-500/20
                  text-white
                  focus:outline-none focus:border-cyan-500/50
                  transition-all duration-200
                "
              >
                <option value="all">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="
                px-4 py-3 rounded-xl
                bg-black/40 border border-cyan-500/20
                text-white
                focus:outline-none focus:border-cyan-500/50
                transition-all duration-200
              "
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
              <option value="title">Title (A-Z)</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center gap-2 p-1 bg-black/40 border border-cyan-500/20 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}
                `}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}
                `}
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              {error}
            </div>
          )}

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center">
                <DocumentTextIcon className="w-12 h-12 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {searchQuery || filterTag !== 'all' ? 'No notes found' : 'No notes yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || filterTag !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first note to get started'}
              </p>
              {!searchQuery && filterTag === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="
                    inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                    bg-gradient-to-r from-cyan-500 to-blue-600
                    text-white shadow-lg shadow-cyan-500/30
                    hover:shadow-cyan-500/50 hover:scale-105
                    transition-all duration-200
                  "
                >
                  <DocumentPlusIcon className="w-5 h-5" />
                  <span>Create Your First Note</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Pinned Notes */}
              {pinnedNotes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-xl font-bold text-white">Pinned Notes</h2>
                  </div>
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-4'
                    }
                  >
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={handleEditNote}
                        onDelete={handleDeleteNote}
                        onTogglePin={handleTogglePin}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Notes */}
              {unpinnedNotes.length > 0 && (
                <div className="space-y-4">
                  {pinnedNotes.length > 0 && (
                    <h2 className="text-xl font-bold text-white">All Notes</h2>
                  )}
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-4'
                    }
                  >
                    {unpinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={handleEditNote}
                        onDelete={handleDeleteNote}
                        onTogglePin={handleTogglePin}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Stats */}
          {filteredNotes.length > 0 && (
            <div className="flex items-center justify-center gap-8 pt-6 text-sm text-gray-400">
              <span>
                Showing {filteredNotes.length} of {notes.length} notes
              </span>
            </div>
          )}
        </main>
      </div>

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateNote}
      />
    </div>
  );
}
