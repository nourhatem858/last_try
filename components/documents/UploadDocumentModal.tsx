'use client';

/**
 * Upload Document Modal Component
 * Modal for uploading new documents
 */

import { useState } from 'react';
import { XMarkIcon, ArrowUpTrayIcon, TagIcon, DocumentIcon } from '@heroicons/react/24/outline';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: { file: File; title: string; tags: string[] }) => Promise<void>;
}

export default function UploadDocumentModal({ isOpen, onClose, onUpload }: UploadDocumentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    tags: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!formData.title) {
        setFormData({ ...formData, title: file.name });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!formData.title.trim()) {
      setError('Document title is required');
      return;
    }

    setLoading(true);

    try {
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await onUpload({
        file: selectedFile,
        title: formData.title,
        tags,
      });

      setFormData({ title: '', tags: '' });
      setSelectedFile(null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
      <div className="relative w-full max-w-lg bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <ArrowUpTrayIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Upload Document</h2>
              <p className="text-sm text-gray-400">Add files to your workspace</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Select File *
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg"
              />
              <label
                htmlFor="file-upload"
                className="
                  flex items-center justify-center gap-3 w-full px-4 py-8 rounded-lg
                  border-2 border-dashed border-cyan-500/30
                  bg-black/40 hover:bg-black/60 hover:border-cyan-500/50
                  cursor-pointer transition-all duration-200
                "
              >
                {selectedFile ? (
                  <div className="text-center">
                    <DocumentIcon className="w-12 h-12 mx-auto text-cyan-400 mb-2" />
                    <p className="text-sm font-semibold text-white">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatFileSize(selectedFile.size)}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <ArrowUpTrayIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-semibold text-white">Click to upload</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, XLS, CSV, Images</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Document Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Q4 Report, Project Proposal"
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
                placeholder="report, finance, q4 (comma separated)"
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

          {/* Info */}
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <p className="text-sm text-cyan-400">
              💡 Supported formats: PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, PNG, JPG, JPEG
            </p>
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
              disabled={loading || !selectedFile}
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
                  Uploading...
                </span>
              ) : (
                'Upload Document'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
