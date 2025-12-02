/**
 * Note Viewer Component
 * Displays a single note with error handling
 */

'use client';

import { useNote } from '@/hooks/useNote';
import { DocumentTextIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface NoteViewerProps {
  noteId: string;
  onClose?: () => void;
}

export default function NoteViewer({ noteId, onClose }: NoteViewerProps) {
  const { note, loading, error, refetch } = useNote(noteId);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#1F77FF] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white font-medium">Loading note...</p>
          <p className="text-[#CCCCCC] text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-md mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <XCircleIcon className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Note</h3>
            <p className="text-red-400 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => refetch()}
                className="px-6 py-3 bg-[#1F77FF] hover:bg-[#3D8FFF] text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Try Again
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-[#0A1420] hover:bg-[#1F77FF]/10 text-white font-semibold rounded-lg border border-[#1F77FF]/30 transition-all duration-200"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No note (shouldn't happen if loading/error handled)
  if (!note) {
    return (
      <div className="p-8 text-center">
        <p className="text-[#CCCCCC]">No note data available</p>
      </div>
    );
  }

  // Success - show note
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#1F77FF]/10 flex items-center justify-center flex-shrink-0">
              <DocumentTextIcon className="w-6 h-6 text-[#1F77FF]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{note.title}</h1>
              <div className="flex items-center gap-4 text-sm text-[#CCCCCC]">
                <span>📁 {note.workspace}</span>
                <span>👤 {note.author}</span>
                <span>📅 {new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-[#999999] hover:text-white transition-colors"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {note.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-[#1F77FF]/10 text-[#1F77FF] text-sm rounded-lg border border-[#1F77FF]/30"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="bg-[#0D1B2A] rounded-xl border border-[#1F77FF]/20 p-6">
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-white leading-relaxed">
              {note.content}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-sm text-[#999999] text-center">
          Last updated: {new Date(note.updatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
