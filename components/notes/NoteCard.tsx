'use client';

/**
 * Note Card Component
 * Displays individual note with preview and actions
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  DocumentTextIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  TagIcon,
  FolderIcon,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

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

interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (noteId: string) => void;
  onTogglePin?: (noteId: string) => void;
}

export default function NoteCard({ note, onEdit, onDelete, onTogglePin }: NoteCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  // ✅ Safety check: Ensure note has valid ID
  if (!note || !note.id) {
    console.error('❌ [NoteCard] Invalid note object:', note);
    return null;
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      cyan: 'from-cyan-500 to-blue-600',
      purple: 'from-purple-500 to-pink-600',
      green: 'from-green-500 to-emerald-600',
      orange: 'from-orange-500 to-red-600',
      blue: 'from-blue-500 to-indigo-600',
    };
    return colors[color] || colors.cyan;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div
      className="
        group relative bg-gradient-to-br from-[#0D1B2A] to-black
        border border-cyan-500/20 rounded-2xl p-6
        hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/20
        transition-all duration-300 overflow-hidden
      "
    >
      {/* Glowing background effect */}
      <div
        className={`
          absolute inset-0 bg-gradient-to-br ${getColorClasses(note.color)} opacity-0
          group-hover:opacity-10 transition-opacity duration-300
        `}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`
                w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClasses(note.color)}
                flex items-center justify-center shadow-lg flex-shrink-0
                group-hover:scale-110 transition-transform duration-300
              `}
            >
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                  {note.title}
                </h3>
                {note.isPinned && (
                  <StarIconSolid className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <ClockIcon className="w-4 h-4" />
                <span>{formatDate(note.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#0D1B2A] border border-cyan-500/20 rounded-xl shadow-2xl z-20 overflow-hidden">
                  <button
                    onClick={() => {
                      onTogglePin?.(note.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {note.isPinned ? (
                      <StarIconSolid className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <StarIconOutline className="w-4 h-4" />
                    )}
                    <span className="text-sm">{note.isPinned ? 'Unpin' : 'Pin'} Note</span>
                  </button>
                  <button
                    onClick={() => {
                      onEdit?.(note);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span className="text-sm">Edit Note</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete?.(note.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span className="text-sm">Delete Note</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content Preview */}
        <p className="text-sm text-gray-400 mb-4 line-clamp-3 group-hover:text-gray-300 transition-colors">
          {truncateContent(note.content) || 'No content'}
        </p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <TagIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
            {note.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{note.tags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Workspace */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-black/40 mb-4">
          <FolderIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">{note.workspace}</span>
        </div>

        {/* View Button */}
        <Link
          href={`/notes/${note.id}`} // ✅ Uses note.id (already converted from _id in API)
          onClick={() => console.log('🔗 [NoteCard] Navigating to note:', note.id)}
          className="
            flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg
            bg-gradient-to-r from-cyan-500/10 to-blue-500/10
            border border-cyan-500/20 text-cyan-400
            hover:from-cyan-500/20 hover:to-blue-500/20
            hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20
            transition-all duration-200 group/btn
          "
        >
          <span className="text-sm font-medium">Open Note</span>
          <svg
            className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
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
        </Link>
      </div>

      {/* Hover shine effect */}
      <div
        className="
          absolute inset-0 opacity-0 group-hover:opacity-100
          bg-gradient-to-r from-transparent via-white/5 to-transparent
          -translate-x-full group-hover:translate-x-full
          transition-all duration-1000
        "
      />
    </div>
  );
}
