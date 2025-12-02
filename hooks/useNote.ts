/**
 * useNote Hook
 * Custom hook for fetching and managing a single note
 */

'use client';

import { useState, useEffect } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  workspace: string;
  workspaceId: string;
  author: string;
  authorId: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UseNoteResult {
  note: Note | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNote(noteId: string | null): UseNoteResult {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNote = async () => {
    if (!noteId) {
      setError('No note ID provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔵 Fetching note:', noteId);

      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Not authenticated. Please login.');
      }

      // Make API request
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🔵 Response status:', response.status, response.statusText);

      // Try to parse JSON response
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
          console.log('🔵 Parsed response:', data);
        } catch (parseError) {
          console.error('❌ Failed to parse JSON:', parseError);
          throw new Error('Server returned invalid response');
        }
      } else {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text.substring(0, 200));
        throw new Error('Server error. Please try again.');
      }

      // Handle error responses
      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Failed to load note';
        console.error('❌ API error:', errorMessage);
        throw new Error(errorMessage);
      }

      // Validate response structure
      if (!data.success || !data.note) {
        console.error('❌ Invalid response structure:', data);
        throw new Error('Invalid server response');
      }

      // Success!
      console.log('✅ Note loaded successfully:', data.note.title);
      setNote(data.note);
      setError(null);

    } catch (err: any) {
      console.error('❌ Error loading note:', err);
      
      // Handle specific errors
      if (err.message.includes('Not authenticated') || err.message.includes('token')) {
        setError('Please login to view this note');
      } else if (err.message.includes('not found')) {
        setError('Note not found. It may have been deleted.');
      } else if (err.message.includes('access')) {
        setError('You do not have permission to view this note');
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.message || 'Failed to load note');
      }
      
      setNote(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (noteId) {
      fetchNote();
    }
  }, [noteId]);

  return {
    note,
    loading,
    error,
    refetch: fetchNote,
  };
}
