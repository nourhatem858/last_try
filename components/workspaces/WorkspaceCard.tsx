'use client';

/**
 * Workspace Card Component
 * Displays individual workspace with stats and actions
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  FolderIcon,
  UsersIcon,
  DocumentIcon,
  DocumentTextIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

interface Workspace {
  id: string;
  name: string;
  description: string;
  members: number;
  documents: number;
  notes: number;
  createdAt: string;
  updatedAt: string;
  color: string;
}

interface WorkspaceCardProps {
  workspace: Workspace;
  onEdit?: (workspace: Workspace) => void;
  onDelete?: (workspaceId: string) => void;
}

export default function WorkspaceCard({ workspace, onEdit, onDelete }: WorkspaceCardProps) {
  const [showMenu, setShowMenu] = useState(false);

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
          absolute inset-0 bg-gradient-to-br ${getColorClasses(workspace.color)} opacity-0
          group-hover:opacity-10 transition-opacity duration-300
        `}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div
              className={`
                w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClasses(workspace.color)}
                flex items-center justify-center shadow-lg
                group-hover:scale-110 transition-transform duration-300
              `}
            >
              <FolderIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                {workspace.name}
              </h3>
              <p className="text-sm text-gray-400 truncate">
                Updated {formatDate(workspace.updatedAt)}
              </p>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
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
                      onEdit?.(workspace);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span className="text-sm">Edit Workspace</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete?.(workspace.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span className="text-sm">Delete Workspace</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 group-hover:text-gray-300 transition-colors">
          {workspace.description || 'No description'}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40">
            <UsersIcon className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-xs text-gray-400">Members</p>
              <p className="text-sm font-semibold text-white">{workspace.members}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40">
            <DocumentIcon className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-xs text-gray-400">Docs</p>
              <p className="text-sm font-semibold text-white">{workspace.documents}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40">
            <DocumentTextIcon className="w-4 h-4 text-green-400" />
            <div>
              <p className="text-xs text-gray-400">Notes</p>
              <p className="text-sm font-semibold text-white">{workspace.notes}</p>
            </div>
          </div>
        </div>

        {/* View Button */}
        <Link
          href={`/workspaces/${workspace.id}`}
          className="
            flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg
            bg-gradient-to-r from-cyan-500/10 to-blue-500/10
            border border-cyan-500/20 text-cyan-400
            hover:from-cyan-500/20 hover:to-blue-500/20
            hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20
            transition-all duration-200 group/btn
          "
        >
          <span className="text-sm font-medium">Open Workspace</span>
          <ArrowRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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
