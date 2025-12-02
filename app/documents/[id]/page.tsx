'use client';

/**
 * Document View Page - PRODUCTION GRADE
 * Full document viewer with download, preview, and actions
 * 
 * BUG FIX: Proper error handling, loading states, and ObjectId validation
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeftIcon,
  TrashIcon,
  PencilIcon,
  ShareIcon,
  DocumentIcon,
  ClockIcon,
  TagIcon,
  FolderIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import SidebarNav from '@/components/dashboard/SidebarNav';
import TopNavbar from '@/components/dashboard/TopNavbar';
import showToast from '@/lib/toast';

interface Document {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileType: string;
  size: number;
  uploadedAt: string;
  updatedAt: string;
  url: string;
  tags?: string[];
  workspace?: string;
  workspaceId?: string;
  uploadedBy?: string;
  extractedText?: string;
  viewCount: number;
  downloadCount: number;
}

export default function DocumentViewPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summary, setSummary] = useState<{
    summary: string;
    points: string[];
    keywords: string[];
  } | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  const documentId = params?.id as string;

  useEffect(() => {
    console.log('🎬 [Frontend] Component mounted');
    console.log('📄 [Frontend] Document ID:', documentId);
    console.log('🔑 [Frontend] Token available:', !!token);
    
    if (!documentId) {
      console.error('❌ [Frontend] No document ID provided');
      setError('Document ID is missing');
      setLoading(false);
      return;
    }
    
    // ✅ VALIDATE OBJECTID FORMAT BEFORE API CALL
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(documentId)) {
      console.error('❌ [Frontend] Invalid ObjectId format:', documentId);
      setError('Invalid document ID');
      setLoading(false);
      return;
    }
    
    if (!token) {
      console.error('❌ [Frontend] No authentication token');
      setError('Please login to view this document');
      setLoading(false);
      return;
    }
    
    fetchDocument();
  }, [documentId, token]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📄 Fetching document:', documentId);
      
      const response = await fetch(`/api/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📄 Response status:', response.status);

      if (!response.ok) {
        if (response.status === 400) {
          setError('Invalid document ID');
        } else if (response.status === 404) {
          setError('Document not found');
        } else if (response.status === 403) {
          setError('Access denied');
        } else {
          setError('Failed to load document');
        }
        return;
      }

      const data = await response.json();
      console.log('✅ Document loaded:', data.document?.title);
      
      if (data.success) {
        setDocument(data.document);
      } else {
        setError(data.error || 'Failed to load document');
      }
    } catch (err: any) {
      setError('Network error occurred');
      console.error('❌ Document fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      console.log('📤 DELETE request:', { url: `/api/documents/${documentId}`, method: 'DELETE' });
      
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📥 DELETE response:', { status: response.status });

      if (response.ok) {
        console.log('✅ Document deleted successfully');
        showToast.success('Document deleted successfully');
        router.push('/documents');
      } else {
        const data = await response.json();
        console.error('❌ Delete failed in app/documents/[id]/page.tsx:handleDelete', { status: response.status, error: data });
        showToast.error(data.error || 'Failed to delete document');
      }
    } catch (err: any) {
      console.error('❌ Delete error in app/documents/[id]/page.tsx:handleDelete', { error: err.message, stack: err.stack });
      showToast.error('Failed to delete document');
    }
  };

  const handleDownload = () => {
    if (!document) return;
    
    // Create a temporary link and trigger download
    const link = window.document.createElement('a');
    link.href = document.url;
    link.download = document.fileName;
    link.click();
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: document?.title,
          text: document?.description,
          url: url,
        });
        console.log('✅ Document shared successfully');
      } else {
        await navigator.clipboard.writeText(url);
        console.log('✅ Link copied to clipboard');
        showToast.success('Link copied to clipboard!');
      }
    } catch (err: any) {
      console.error('❌ Share error in app/documents/[id]/page.tsx:handleShare', { error: err.message });
      showToast.error('Failed to share document');
    }
  };

  const handleSummarize = async () => {
    try {
      console.log('📤 Summarize request:', { url: `/api/documents/${documentId}/summarize`, method: 'POST' });
      setSummarizing(true);
      
      const response = await fetch(`/api/documents/${documentId}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📥 Summarize response:', { status: response.status });
      const data = await response.json();

      if (data.success) {
        console.log('✅ Document summarized successfully');
        setSummary({
          summary: data.summary,
          points: data.points,
          keywords: data.keywords,
        });
        showToast.success('Document summarized successfully!');
      } else {
        console.error('❌ Summarize failed in app/documents/[id]/page.tsx:handleSummarize', { status: response.status, error: data });
        showToast.error(data.error || 'Failed to summarize document');
      }
    } catch (err: any) {
      console.error('❌ Summarize error in app/documents/[id]/page.tsx:handleSummarize', { error: err.message, stack: err.stack });
      showToast.error('Failed to summarize document');
    } finally {
      setSummarizing(false);
    }
  };

  const handleCopySummary = () => {
    if (!summary) return;
    try {
      const text = `Summary:\n${summary.summary}\n\nKey Points:\n${summary.points.map(p => `• ${p}`).join('\n')}\n\nKeywords:\n${summary.keywords.map(k => `#${k}`).join(' ')}`;
      navigator.clipboard.writeText(text);
      console.log('✅ Summary copied to clipboard');
      showToast.success('Summary copied to clipboard!');
    } catch (err: any) {
      console.error('❌ Copy error in app/documents/[id]/page.tsx:handleCopySummary', { error: err.message });
      showToast.error('Failed to copy summary');
    }
  };

  const handleDownloadSummary = () => {
    if (!summary) return;
    const text = `Document Summary: ${document?.title}\n\n${summary.summary}\n\nKey Points:\n${summary.points.map(p => `• ${p}`).join('\n')}\n\nKeywords:\n${summary.keywords.map(k => `#${k}`).join(' ')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document?.title || 'document'}-summary.txt`;
    link.click();
    URL.revokeObjectURL(url);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('text')) return '📃';
    if (fileType.includes('image')) return '🖼️';
    return '📎';
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
                <DocumentIcon className="w-24 h-24 mx-auto text-gray-600 mb-6" />
                <h1 className="text-3xl font-bold text-white mb-4">
                  {error === 'Document not found' ? 'Document Not Found' : 
                   error === 'Invalid document ID' ? 'Invalid Document ID' :
                   error === 'Access denied' ? 'Access Denied' :
                   'Error Loading Document'}
                </h1>
                <p className="text-gray-400 mb-8">
                  {error === 'Document not found' 
                    ? 'This document doesn\'t exist or was deleted.'
                    : error === 'Invalid document ID'
                    ? 'The document ID format is invalid.'
                    : error === 'Access denied'
                    ? 'You don\'t have permission to view this document.'
                    : 'There was an error loading the document. Please try again.'}
                </p>
                <button
                  onClick={() => router.push('/documents')}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200"
                >
                  Back to Documents
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!document) return null;

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
                  onClick={() => router.push('/documents')}
                  className="p-2 rounded-lg bg-white/10 border border-cyan-500/30 text-cyan-400 hover:bg-white/20 transition-all duration-200"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg text-2xl">
                  {getFileIcon(document.fileType)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{document.title}</h1>
                  <p className="text-gray-400 mt-1">
                    {document.uploadedBy && `Uploaded by ${document.uploadedBy} • `}
                    {formatFileSize(document.size)}
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSummarize}
                  disabled={summarizing}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="AI Summarize"
                >
                  <span className="text-lg">✨</span>
                  <span className="font-medium hidden sm:inline">
                    {summarizing ? 'Analyzing...' : 'AI Summarize'}
                  </span>
                </button>
                <button
                  onClick={handleDownload}
                  className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200"
                  title="Download"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
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

            {/* Document Info */}
            <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Uploaded</p>
                    <p className="text-white font-semibold text-sm">{formatDate(document.uploadedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <EyeIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Views</p>
                    <p className="text-white font-semibold text-sm">{document.viewCount}</p>
                  </div>
                </div>
                {document.workspace && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <FolderIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Workspace</p>
                      <p className="text-white font-semibold">{document.workspace}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {document.description && (
                <div className="mt-6 pt-6 border-t border-cyan-500/20">
                  <p className="text-sm font-semibold text-white mb-2">Description</p>
                  <p className="text-gray-300">{document.description}</p>
                </div>
              )}

              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-cyan-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <TagIcon className="w-5 h-5 text-cyan-400" />
                    <p className="text-sm font-semibold text-white">Tags</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, idx) => (
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

              {/* File Info */}
              <div className="mt-6 pt-6 border-t border-cyan-500/20">
                <p className="text-sm font-semibold text-white mb-3">File Information</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">File Name</p>
                    <p className="text-white font-mono">{document.fileName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">File Type</p>
                    <p className="text-white">{document.fileType}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            {summarizing && (
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center animate-pulse">
                  <span className="text-3xl">✨</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI is analyzing document...</h3>
                <p className="text-gray-400">This may take a few moments</p>
              </div>
            )}

            {summary && !summarizing && (
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <span className="text-2xl">✨</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">AI Summary</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopySummary}
                      className="px-4 py-2 rounded-lg bg-white/10 border border-cyan-500/30 text-cyan-400 hover:bg-white/20 transition-all duration-200 text-sm font-medium"
                    >
                      Copy
                    </button>
                    <button
                      onClick={handleDownloadSummary}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200 text-sm font-medium"
                    >
                      Download
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-gray-300 leading-relaxed text-lg">{summary.summary}</p>
                  </div>

                  {summary.points.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        Key Points
                      </h4>
                      <ul className="space-y-2">
                        {summary.points.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-300">
                            <span className="text-cyan-400 mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {summary.keywords.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {summary.keywords.map((keyword, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-sm font-medium border border-cyan-500/30"
                          >
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Extracted Text Preview */}
            {document.extractedText && (
              <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-4">Extracted Text</h3>
                <div className="prose prose-invert prose-cyan max-w-none">
                  <div 
                    className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words max-h-96 overflow-y-auto"
                    style={{ fontSize: '14px', lineHeight: '1.6' }}
                  >
                    {document.extractedText.substring(0, 2000)}
                    {document.extractedText.length > 2000 && '...'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gradient-to-br from-[#0D1B2A] to-black border border-red-500/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Delete Document</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "{document.title}"? This action cannot be undone.
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
