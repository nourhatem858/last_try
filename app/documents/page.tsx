'use client';

/**
 * Documents Page
 * Displays all documents for the logged-in user
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SidebarNav from '@/components/dashboard/SidebarNav';
import TopNavbar from '@/components/dashboard/TopNavbar';
import DocumentCard from '@/components/documents/DocumentCard';
import UploadDocumentModal from '@/components/documents/UploadDocumentModal';
import {
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentIcon,
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

export default function DocumentsPage() {
  const { isAuthenticated, loading: authLoading, token } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'uploaded' | 'updated' | 'title'>('uploaded');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch documents
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchDocuments();
    }
  }, [isAuthenticated, token]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.data || []);
      } else {
        setError('Failed to load documents');
      }
    } catch (err) {
      console.error('Fetch documents error:', err);
      setError('An error occurred while loading documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async (data: any) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      if (data.file) {
        formData.append('file', data.file);
      }
      formData.append('title', data.title);
      formData.append('tags', JSON.stringify(data.tags || []));
      if (data.description) {
        formData.append('description', data.description);
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setDocuments([result.data, ...documents]);
        setShowUploadModal(false);
        setError('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload document');
      }
    } catch (err: any) {
      throw err;
    }
  };

  const handleViewDocument = (document: Document) => {
    router.push(`/documents/${document.id}`);
  };

  const handleEditDocument = (document: Document) => {
    console.log('Edit document:', document);
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setDocuments(documents.filter((d) => d.id !== documentId));
        console.log('✅ [Documents Page | handleDeleteDocument] Document deleted successfully', { documentId });
      } else {
        const data = await response.json();
        console.error('❌ [Documents Page | handleDeleteDocument] Failed to delete document', { 
          status: response.status, 
          error: data?.error,
          documentId 
        });
      }
    } catch (err: any) {
      console.error('❌ [Documents Page | handleDeleteDocument] Network error', { 
        error: err.message, 
        stack: err.stack,
        documentId 
      });
    }
  };

  const handleDownloadDocument = (document: Document) => {
    window.open(document.url, '_blank');
  };

  // Get all unique tags and file types
  const allTags = Array.from(new Set(documents.flatMap((doc) => doc.tags)));
  const allTypes = Array.from(new Set(documents.map((doc) => doc.fileType)));

  // Filter and sort documents
  const filteredDocuments = documents
    .filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = filterTag === 'all' || doc.tags.includes(filterTag);
      const matchesType = filterType === 'all' || doc.fileType === filterType;
      return matchesSearch && matchesTag && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'uploaded') {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      } else {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  // Calculate stats
  const stats = {
    total: documents.length,
    types: allTypes.length,
    tags: allTags.length,
  };

  // Show loading state
  if (authLoading || (loading && documents.length === 0)) {
    return (
      <div className="min-h-screen bg-black">
        <SidebarNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="lg:pl-64">
          <TopNavbar />
          <main className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-cyan-500/20 rounded-lg w-1/3" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 bg-cyan-500/20 rounded-2xl" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <SidebarNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="lg:pl-64">
        <TopNavbar />

        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Documents</h1>
              <p className="text-gray-400">
                Manage and organize your files
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="
                flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                bg-gradient-to-r from-cyan-500 to-blue-600
                text-white shadow-lg shadow-cyan-500/30
                hover:shadow-cyan-500/50 hover:scale-105
                transition-all duration-200
              "
            >
              <ArrowUpTrayIcon className="w-5 h-5" />
              <span>Upload Document</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: 'Total Documents',
                value: stats.total,
                icon: DocumentIcon,
                color: 'from-cyan-500 to-blue-600',
              },
              {
                label: 'File Types',
                value: stats.types,
                icon: FolderIcon,
                color: 'from-purple-500 to-pink-600',
              },
              {
                label: 'Tags',
                value: stats.tags,
                icon: TagIcon,
                color: 'from-green-500 to-emerald-600',
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="
                    group bg-gradient-to-br from-[#0D1B2A] to-black
                    border border-cyan-500/20 rounded-2xl p-6
                    hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/20
                    transition-all duration-300
                  "
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`
                        w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color}
                        flex items-center justify-center shadow-lg
                        group-hover:scale-110 transition-transform duration-300
                      `}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filters and Search */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents..."
                  className="
                    w-full pl-12 pr-4 py-3 rounded-xl
                    bg-black/40 border border-cyan-500/20
                    text-white placeholder-gray-500
                    focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                    transition-all duration-200
                  "
                />
              </div>
            </div>

            {/* Filter by Tag */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="
                  px-4 py-3 rounded-xl
                  bg-black/40 border border-cyan-500/20
                  text-white
                  focus:outline-none focus:border-cyan-500/50
                  transition-all duration-200
                "
              >
                <option value="all">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="
                px-4 py-3 rounded-xl
                bg-black/40 border border-cyan-500/20
                text-white
                focus:outline-none focus:border-cyan-500/50
                transition-all duration-200
              "
            >
              <option value="all">All Types</option>
              {allTypes.map((type) => (
                <option key={type} value={type}>
                  {type.toUpperCase()}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="
                px-4 py-3 rounded-xl
                bg-black/40 border border-cyan-500/20
                text-white
                focus:outline-none focus:border-cyan-500/50
                transition-all duration-200
              "
            >
              <option value="uploaded">Recently Uploaded</option>
              <option value="updated">Recently Updated</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              {error}
            </div>
          )}

          {/* Documents Grid */}
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center">
                <DocumentIcon className="w-12 h-12 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {searchQuery || filterTag !== 'all' || filterType !== 'all'
                  ? 'No documents found'
                  : 'No documents yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || filterTag !== 'all' || filterType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Upload your first document to get started'}
              </p>
              {!searchQuery && filterTag === 'all' && filterType === 'all' && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="
                    inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                    bg-gradient-to-r from-cyan-500 to-blue-600
                    text-white shadow-lg shadow-cyan-500/30
                    hover:shadow-cyan-500/50 hover:scale-105
                    transition-all duration-200
                  "
                >
                  <ArrowUpTrayIcon className="w-5 h-5" />
                  <span>Upload Your First Document</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onView={handleViewDocument}
                  onEdit={handleEditDocument}
                  onDelete={handleDeleteDocument}
                  onDownload={handleDownloadDocument}
                />
              ))}
            </div>
          )}

          {/* Stats */}
          {filteredDocuments.length > 0 && (
            <div className="flex items-center justify-center gap-8 pt-6 text-sm text-gray-400">
              <span>
                Showing {filteredDocuments.length} of {documents.length} documents
              </span>
            </div>
          )}
        </main>
      </div>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadDocument}
      />
    </div>
  );
}
