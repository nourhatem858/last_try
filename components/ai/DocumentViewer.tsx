'use client';

import { useState } from 'react';
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  ChatBubbleLeftIcon,
  TagIcon,
  ClockIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

interface DocumentViewerProps {
  document: any;
  onClose: () => void;
}

export default function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'metadata'>('content');

  const handleDownload = () => {
    if (document.url) {
      window.open(document.url, '_blank');
    }
  };

  const getIcon = () => {
    if (document.type === 'note') return ClipboardDocumentIcon;
    if (document.type === 'chat') return ChatBubbleLeftIcon;
    return DocumentTextIcon;
  };

  const Icon = getIcon();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[95vh] bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20 bg-black/40">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/50">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-white mb-2 truncate">
                  {document.title || document.fileName || 'Untitled'}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  {document.type && (
                    <span className="px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold uppercase">
                      {document.type}
                    </span>
                  )}
                  {document.fileType && (
                    <span className="px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold uppercase">
                      {document.fileType}
                    </span>
                  )}
                  {document.fileSize && (
                    <span>{(document.fileSize / 1024).toFixed(2)} KB</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {document.url && (
                <button
                  onClick={handleDownload}
                  className="
                    p-3 rounded-xl
                    bg-gradient-to-r from-green-500 to-emerald-600
                    text-white shadow-lg shadow-green-500/30
                    hover:shadow-green-500/50 hover:scale-105
                    transition-all duration-200
                  "
                  title="Download"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="
                  p-3 rounded-xl
                  bg-red-500/20 border border-red-500/30
                  text-red-400
                  hover:bg-red-500/30 hover:border-red-500/50
                  transition-all duration-200
                "
                title="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-cyan-500/20">
          <button
            onClick={() => setActiveTab('content')}
            className={`
              px-6 py-3 rounded-t-xl font-semibold
              transition-all duration-200
              ${activeTab === 'content'
                ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-b-2 border-cyan-500 text-cyan-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`
              px-6 py-3 rounded-t-xl font-semibold
              transition-all duration-200
              ${activeTab === 'metadata'
                ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-b-2 border-cyan-500 text-cyan-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            Details
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {activeTab === 'content' && (
            <div className="prose prose-invert max-w-none">
              {document.content ? (
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed break-words p-6 text-base">
                  {document.content}
                </div>
              ) : document.excerpt ? (
                <div className="text-gray-300 leading-relaxed break-words p-6 text-base">
                  {document.excerpt}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No content preview available</p>
                  {document.url && (
                    <button
                      onClick={handleDownload}
                      className="
                        mt-4 px-6 py-3 rounded-xl font-semibold
                        bg-gradient-to-r from-cyan-500 to-blue-600
                        text-white shadow-lg shadow-cyan-500/30
                        hover:shadow-cyan-500/50 hover:scale-105
                        transition-all duration-200
                      "
                    >
                      Download to View
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="space-y-6">
              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TagIcon className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-bold text-white">Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Workspace */}
              {document.workspace && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FolderIcon className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-bold text-white">Workspace</h3>
                  </div>
                  <p className="text-gray-300">{document.workspace}</p>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ClockIcon className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Timeline</h3>
                </div>
                <div className="space-y-2 text-gray-300">
                  {document.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span>{new Date(document.createdAt).toLocaleString()}</span>
                    </div>
                  )}
                  {document.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Updated:</span>
                      <span>{new Date(document.updatedAt).toLocaleString()}</span>
                    </div>
                  )}
                  {document.uploadedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Uploaded:</span>
                      <span>{new Date(document.uploadedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              {document.author && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-bold text-white">Author</h3>
                  </div>
                  <p className="text-gray-300">{document.author}</p>
                </div>
              )}

              {/* AI Insights */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30">
                <h3 className="text-lg font-bold text-white mb-2">AI Insights</h3>
                <p className="text-gray-300 text-sm">
                  This document has been indexed and can be queried through AI assistance.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
