'use client';

/**
 * Quick Add Modal Component
 * Universal modal for quickly creating notes, documents, workspaces, or chats
 */

import { useState } from 'react';
import {
  XMarkIcon,
  DocumentTextIcon,
  DocumentIcon,
  FolderIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNote: (data: any) => Promise<void>;
  onUploadDocument: (data: any) => Promise<void>;
  onCreateWorkspace: (data: any) => Promise<void>;
  onActivityUpdate?: () => void;
}

export default function QuickAddModal({
  isOpen,
  onClose,
  onCreateNote,
  onUploadDocument,
  onCreateWorkspace,
  onActivityUpdate,
}: QuickAddModalProps) {
  const [selectedType, setSelectedType] = useState<'note' | 'document' | 'workspace' | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    tags: '',
    color: 'cyan',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    setLoading(true);
    setError('');

    try {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

      switch (selectedType) {
        case 'note':
          await onCreateNote({
            title: formData.title,
            content: formData.content,
            tags,
            color: formData.color,
          });
          break;
        case 'document':
          await onUploadDocument({
            title: formData.title,
            fileName: formData.title + '.txt',
            fileType: 'txt',
            fileSize: formData.content.length,
            tags,
            content: formData.content,
            color: formData.color,
          });
          break;
        case 'workspace':
          await onCreateWorkspace({
            name: formData.title,
            description: formData.description,
            color: formData.color,
          });
          break;
      }

      onActivityUpdate?.();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedType(null);
    setFormData({
      title: '',
      content: '',
      description: '',
      tags: '',
      color: 'cyan',
    });
    setError('');
    onClose();
  };

  const types = [
    {
      id: 'note',
      name: 'Note',
      icon: DocumentTextIcon,
      gradient: 'from-purple-500 to-pink-600',
      description: 'Quick text note',
    },
    {
      id: 'document',
      name: 'Document',
      icon: DocumentIcon,
      gradient: 'from-green-500 to-emerald-600',
      description: 'Upload or create document',
    },
    {
      id: 'workspace',
      name: 'Workspace',
      icon: FolderIcon,
      gradient: 'from-cyan-500 to-blue-600',
      description: 'New workspace',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20 bg-black/40">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Quick Add</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all duration-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {selectedType ? `Create a new ${selectedType}` : 'Choose what to create'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {!selectedType ? (
            // Type selection
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {types.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id as any)}
                    className="
                      group p-6 rounded-xl
                      bg-black/40 border border-cyan-500/20
                      hover:border-cyan-500/40 hover:bg-black/60
                      hover:shadow-xl hover:shadow-cyan-500/10
                      transition-all duration-300
                    "
                  >
                    <div
                      className={`
                        w-16 h-16 mx-auto mb-4 rounded-xl
                        bg-gradient-to-br ${type.gradient}
                        flex items-center justify-center
                        shadow-lg group-hover:scale-110
                        transition-transform duration-300
                      `}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                      {type.name}
                    </h3>
                    <p className="text-sm text-gray-400">{type.description}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            // Form
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  {selectedType === 'workspace' ? 'Name' : 'Title'}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={`Enter ${selectedType} ${selectedType === 'workspace' ? 'name' : 'title'}`}
                  required
                  className="
                    w-full px-4 py-3 rounded-xl
                    bg-black/60 border border-cyan-500/20
                    text-white placeholder-gray-500
                    focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                    transition-all duration-200
                  "
                />
              </div>

              {selectedType === 'workspace' ? (
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter workspace description"
                    rows={3}
                    className="
                      w-full px-4 py-3 rounded-xl
                      bg-black/60 border border-cyan-500/20
                      text-white placeholder-gray-500
                      focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                      transition-all duration-200
                      resize-none
                    "
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder={`Enter ${selectedType} content`}
                    rows={6}
                    required
                    className="
                      w-full px-4 py-3 rounded-xl
                      bg-black/60 border border-cyan-500/20
                      text-white placeholder-gray-500
                      focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                      transition-all duration-200
                      resize-none
                    "
                  />
                </div>
              )}

              {selectedType !== 'workspace' && (
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., important, project, meeting"
                    className="
                      w-full px-4 py-3 rounded-xl
                      bg-black/60 border border-cyan-500/20
                      text-white placeholder-gray-500
                      focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                      transition-all duration-200
                    "
                  />
                </div>
              )}

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedType(null)}
                  className="
                    flex-1 px-6 py-3 rounded-xl font-semibold
                    bg-white/10 border border-cyan-500/30
                    text-white hover:bg-white/20
                    transition-all duration-200
                  "
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    flex-1 px-6 py-3 rounded-xl font-semibold
                    bg-gradient-to-r from-cyan-500 to-blue-600
                    text-white shadow-lg shadow-cyan-500/30
                    hover:shadow-cyan-500/50 hover:scale-105
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  "
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    `Create ${selectedType}`
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
