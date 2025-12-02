'use client';

/**
 * Note View Page
 * Full note viewer with rich text content and actions
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeftIcon,
  TrashIcon,
  PencilIcon,
  ShareIcon,
  DocumentTextIcon,
  ClockIcon,
  TagIcon,
  StarIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import SidebarNav from '@/components/dashboard/SidebarNav';
import TopNavbar from '@/components/dashboard/TopNavbar';

interface Note {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  workspace?: string;
  workspaceId?: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  color: string;
  author?: string;
}

export default function NoteViewPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const noteId = params?.id as string;

  useEffect(() => {
    console.log('🎬 [Frontend] Component mounted');
    console.log('📝 [Frontend] Note ID:', noteId);
    console.log('🔑 [Frontend] Token available:', !!token);
    
    if (!noteId) {
      console.error('❌ [Frontend] No note ID provided');
      setError('Note ID is missing');
      setLoading(false);
      return;
    }
    
    // ✅ VALIDATE OBJECTID FORMAT BEFORE API CALL
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(noteId)) {
      console.error('❌ [Frontend] Invalid ObjectId format:', noteId);
      setError('Invalid note ID format');
      setLoading(false);
      return;
    }
    
    if (!token) {
      console.error('❌ [Frontend] No authentication token');
      setError('Please login to view this note');
      setLoading(false);
      return;
    }
    
    fetchNote();
  }, [noteId, token]);

  const fetchNote = async () => {
    console.log('🔍 [Frontend] Fetching note:', noteId);
    console.log('🔑 [Frontend] Token exists:', !!token);
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📡 [Frontend] Response status:', response.status);

      // Parse response
      let data;
      try {
        data = await response.json();
        console.log('📦 [Frontend] Response data:', data);
      } catch (parseError) {
        console.error('❌ [Frontend] Failed to parse JSON response');
        setError('Invalid server response');
        return;
      }

      // Handle different status codes
      if (!response.ok) {
        console.error('❌ [Frontend] Request failed:', response.status);
        
        if (response.status === 400) {
          setError(data.message || 'Invalid note ID format');
        } else if (response.status === 401) {
          setError(data.message || 'Please login to view this note');
        } else if (response.status === 403) {
          setError(data.message || 'You do not have permission to view this note');
        } else if (response.status === 404) {
          setError(data.message || 'This note does not exist or has been deleted');
        } else if (response.status === 503) {
          setError(data.message || 'Database connection failed. Please try again.');
        } else {
          setError(data.message || 'Failed to load note. Please try again.');
        }
        return;
      }

      // Success - validate data structure
      if (data.success && data.note) {
        console.log('✅ [Frontend] Note loaded successfully:', data.note.title);
        
        // Ensure all required fields exist
        const noteData = {
          ...data.note,
          color: data.note.color || 'cyan', // Ensure color exists
          tags: data.note.tags || [],
          isPinned: data.note.isPinned || false,
        };
        
        setNote(noteData);
      } else {
        console.error('❌ [Frontend] Invalid response structure:', data);
        setError(data.error || data.message || 'Failed to load note');
      }
    } catch (err: any) {
      console.error('❌ [Frontend] Network error:', err);
      console.error('❌ [Frontend] Error details:', err.message);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
      console.log('🏁 [Frontend] Fetch complete');
    }
  };

  const handleTogglePin = async () => {
    if (!note) return;

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      });

      if (response.ok) {
        setNote(prev => prev ? { ...prev, isPinned: !prev.isPinned } : null);
      }
    } catch (err) {
      console.error('Toggle pin error:', err);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push('/notes');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: note?.title,
        text: note?.content.substring(0, 100),
        url: url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      console.log('✅ [Note View | handleShare] Link copied to clipboard', { url });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(dateString);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      cyan: 'from-cyan-500 to-blue-600',
      purple: 'from-purple-500 to-pink-600',
      green: 'from-green-500 to-emerald-600',
      orange: 'from-orange-500 to-red-600',
      blue: 'from-blue-500 to-indigo-600',
      yellow: 'from-yellow-500 to-orange-600',
    };
    return colors[color] || colors.cyan;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <SidebarNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="lg:pl-64">
          <TopNavbar />
          <main className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-cyan-500/20 rounded w-1/3" />
                <div className="h-64 bg-cyan-500/20 rounded" />
                <div className="h-32 bg-cyan-500/20 rounded" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <SidebarNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="lg:pl-64">
          <TopNavbar />
          <main className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-12">
                <DocumentTextIcon className="w-24 h-24 mx-auto text-gray-600 mb-6" />
                <h1 className="text-3xl font-bold text-white mb-4">
                  {error.includes('not exist') || error.includes('deleted') 
                    ? 'Note Not Found' 
                    : error.includes('permission') || error.includes('Access denied')
                    ? 'Access Denied'
                    : error.includes('Invalid') || error.includes('format')
                    ? 'Invalid Note ID'
                    : error.includes('login') || error.includes('Authentication')
                    ? 'Authentication Required'
                    : error.includes('Database') || error.includes('connection')
                    ? 'Database Error'
                    : 'Error Loading Note'}
                </h1>
                <p className="text-gray-400 mb-4 text-lg font-semibold">
                  {error}
                </p>
                <p className="text-gray-500 mb-8 text-sm">
                  {error.includes('not exist') || error.includes('deleted')
                    ? 'This note may have been deleted or never existed.'
                    : error.includes('permission') || error.includes('Access denied')
                    ? 'You need to be a member of the workspace to view this note.'
                    : error.includes('Invalid') || error.includes('format')
                    ? 'The note ID in the URL is not valid.'
                    : error.includes('login') || error.includes('Authentication')
                    ? 'Please login to your account to continue.'
                    : error.includes('Database') || error.includes('connection')
                    ? 'The database is temporarily unavailable. Please try again in a moment.'
                    : 'Something went wrong. Please try again or contact support.'}
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => router.push('/notes')}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200"
                  >
                    Back to Notes
                  </button>
                  {error.includes('login') || error.includes('Authentication') ? (
                    <button
                      onClick={() => router.push('/login')}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200"
                    >
                      Login
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setError('');
                        fetchNote();
                      }}
                      className="px-6 py-3 bg-white/10 border border-cyan-500/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-200"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!note) return null;

  return (
    <div className="min-h-screen bg-black">
      <SidebarNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="lg:pl-64">
        <TopNavbar />
        
        <main className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/notes')}
                  className="p-2 rounded-lg bg-white/10 border border-cyan-500/30 text-cyan-400 hover:bg-white/20 transition-all duration-200"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClasses(note.color)} flex items-center justify-center shadow-lg`}>
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{note.title}</h1>
                  <p className="text-gray-400 mt-1">
                    {note.author && `By ${note.author} • `}
                    Updated {formatRelativeTime(note.updatedAt)}
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTogglePin}
                  className={`p-3 rounded-lg ${note.isPinned ? 'bg-gradient-to-r from-yellow-500 to-orange-600' : 'bg-white/10 border border-cyan-500/30'} text-white hover:shadow-lg transition-all duration-200`}
                  title={note.isPinned ? 'Unpin' : 'Pin'}
                >
                  {note.isPinned ? (
                    <StarIconSolid className="w-5 h-5" />
                  ) : (
                    <StarIcon className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => router.push(`/notes/${noteId}/edit`)}
                  className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
                  title="Edit"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200"
                  title="Share"
                >
                  <ShareIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200"
                  title="Delete"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Note Info */}
            <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Created</p>
                    <p className="text-white font-semibold text-sm">{formatDate(note.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Last Updated</p>
                    <p className="text-white font-semibold text-sm">{formatDate(note.updatedAt)}</p>
                  </div>
                </div>
                {note.workspace && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <FolderIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Workspace</p>
                      <p className="text-white font-semibold">{note.workspace}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-cyan-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <TagIcon className="w-5 h-5 text-cyan-400" />
                    <p className="text-sm font-semibold text-white">Tags</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-sm border border-cyan-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Note Content */}
            <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 500px)', minHeight: '400px' }}>
              <div className="prose prose-invert prose-cyan max-w-none">
                <div 
                  className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words"
                  style={{ fontSize: '16px', lineHeight: '1.8' }}
                >
                  {note.content}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gradient-to-br from-[#0D1B2A] to-black border border-red-500/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Delete Note</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "{note.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-white/10 border border-cyan-500/30 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
