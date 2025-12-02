'use client';

/**
 * Create Note Modal Component
 * Modal for creating new notes
 */

import { useState } from 'react';
import { XMarkIcon, DocumentPlusIcon, TagIcon } from '@heroicons/react/24/outline';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; content: string; tags: string[]; color: string }) => Promise<void>;
}

export default function CreateNoteModal({ isOpen, onClose, onCreate }: CreateNoteModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    color: 'cyan',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = [
    { name: 'Cyan', value: 'cyan', class: 'from-cyan-500 to-blue-600' },
    { name: 'Purple', value: 'purple', class: 'from-purple-500 to-pink-600' },
    { name: 'Green', value: 'green', class: 'from-green-500 to-emerald-600' },
    { name: 'Orange', value: 'orange', class: 'from-orange-500 to-red-600' },
    { name: 'Blue', value: 'blue', class: 'from-blue-500 to-indigo-600' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Note title is required');
      return;
    }

    setLoading(true);

    try {
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await onCreate({
        title: formData.title,
        content: formData.content,
        tags,
        color: formData.color,
      });

      setFormData({ title: '', content: '', tags: '', color: 'cyan' });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl h-[95vh] bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/20 sticky top-0 bg-[#0D1B2A]/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <DocumentPlusIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Note</h2>
              <p className="text-sm text-gray-400">Capture your thoughts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 min-h-0">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Note Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Meeting Notes, Ideas, To-Do List"
              className="
                w-full px-4 py-3 rounded-lg
                bg-black/40 border border-cyan-500/20
                text-white placeholder-gray-500
                focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                transition-all duration-200
              "
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your note here..."
              rows={10}
              className="
                w-full px-4 py-3 rounded-lg resize-y
                bg-black/40 border border-cyan-500/20
                text-white placeholder-gray-500
                focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                transition-all duration-200
                min-h-[200px]
              "
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Tags
            </label>
            <div className="relative">
              <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="meeting, planning, ideas (comma separated)"
                className="
                  w-full pl-12 pr-4 py-3 rounded-lg
                  bg-black/40 border border-cyan-500/20
                  text-white placeholder-gray-500
                  focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                  transition-all duration-200
                "
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Note Color
            </label>
            <div className="grid grid-cols-5 gap-3">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`
                    relative h-12 rounded-lg bg-gradient-to-br ${color.class}
                    hover:scale-110 transition-transform duration-200
                    ${formData.color === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0D1B2A]' : ''}
                  `}
                  title={color.name}
                >
                  {formData.color === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 px-6 py-3 rounded-lg font-semibold
                bg-white/5 border border-cyan-500/20 text-white
                hover:bg-white/10 transition-all duration-200
              "
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="
                flex-1 px-6 py-3 rounded-lg font-semibold
                bg-gradient-to-r from-cyan-500 to-blue-600
                text-white shadow-lg shadow-cyan-500/30
                hover:shadow-cyan-500/50 hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                transition-all duration-200
              "
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Note'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
