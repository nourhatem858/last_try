'use client';

/**
 * Document Card Component
 * Displays individual document with preview and actions
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  DocumentIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  TagIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  tags: string[];
  workspace: string;
  workspaceId: string;
  uploadedAt: string;
  updatedAt: string;
  url: string;
  color: string;
}

interface DocumentCardProps {
  document: Document;
  onView?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onDelete?: (documentId: string) => void;
  onDownload?: (document: Document) => void;
}

export default function DocumentCard({ document, onView, onEdit, onDelete, onDownload }: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  // ✅ Safety check: Ensure document has valid ID
  if (!document || !document.id) {
    console.error('❌ [DocumentCard] Invalid document object:', document);
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

  const getFileIcon = (fileType: string) => {
    // Return appropriate icon based on file type
    return DocumentIcon;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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

  const FileIcon = getFileIcon(document.fileType);

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
          absolute inset-0 bg-gradient-to-br ${getColorClasses(document.color)} opacity-0
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
                w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClasses(document.color)}
                flex items-center justify-center shadow-lg flex-shrink-0
                group-hover:scale-110 transition-transform duration-300
              `}
            >
              <FileIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate group-hover:text-cyan-400 transition-colors mb-1">
                {document.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="uppercase font-semibold">{document.fileType}</span>
                <span>•</span>
                <span>{formatFileSize(document.fileSize)}</span>
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
                      onView?.(document);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span className="text-sm">View Document</span>
                  </button>
                  <button
                    onClick={() => {
                      onDownload?.(document);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span className="text-sm">Download</span>
                  </button>
                  <button
                    onClick={() => {
                      onEdit?.(document);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span className="text-sm">Edit Details</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete?.(document.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* File Name */}
        <div className="mb-4 p-3 rounded-lg bg-black/40">
          <p className="text-sm text-gray-400 truncate">{document.fileName}</p>
        </div>

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <TagIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
            {document.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              >
                {tag}
              </span>
            ))}
            {document.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{document.tags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Uploaded</p>
              <p className="text-sm font-semibold text-white">{formatDate(document.uploadedAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40">
            <FolderIcon className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Workspace</p>
              <p className="text-sm font-semibold text-white truncate">{document.workspace}</p>
            </div>
          </div>
        </div>

        {/* View Button */}
        <Link
          href={`/documents/${document.id}`} // ✅ Uses document.id (already converted from _id in API)
          onClick={() => console.log('🔗 [DocumentCard] Navigating to document:', document.id)}
          className="
            flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg
            bg-gradient-to-r from-cyan-500/10 to-blue-500/10
            border border-cyan-500/20 text-cyan-400
            hover:from-cyan-500/20 hover:to-blue-500/20
            hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20
            transition-all duration-200 group/btn
          "
        >
          <EyeIcon className="w-4 h-4" />
          <span className="text-sm font-medium">View Document</span>
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
