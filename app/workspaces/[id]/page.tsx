'use client';

/**
 * Open Workspace Page
 * Full workspace viewer with tabs, members, documents, notes, and activity
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeftIcon,
  PencilIcon,
  UserPlusIcon,
  DocumentPlusIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  UsersIcon,
  DocumentIcon,
  ClockIcon,
  FolderIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import SidebarNav from '@/components/dashboard/SidebarNav';
import TopNavbar from '@/components/dashboard/TopNavbar';

interface Activity {
  id: string;
  type: string;
  action: string;
  user: string;
  item: string;
  timestamp: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  tags?: string[];
}

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  size: number;
  uploadedAt: string;
  url: string;
  uploadedBy: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  joinedAt: string;
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  color: string;
  owner: string;
  members: number;
  documents: number;
  notes: number;
  activity: Activity[];
  items: {
    notes: Note[];
    documents: Document[];
    members: Member[];
  };
}

type TabType = 'overview' | 'notes' | 'documents' | 'members' | 'activity';

export default function OpenWorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const workspaceId = params?.id as string;

  useEffect(() => {
    if (workspaceId && token) {
      fetchWorkspace();
      fetchWorkspaceCounts();
    }
  }, [workspaceId, token]);

  const fetchWorkspace = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Workspace not found');
        } else {
          setError('Failed to load workspace');
        }
        return;
      }

      const data = await response.json();
      if (data.success) {
        setWorkspace(data.workspace);
      } else {
        setError(data.error || 'Failed to load workspace');
      }
    } catch (err: any) {
      setError('Network error occurred');
      console.error('Workspace fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaceCounts = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/counts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && workspace) {
          setWorkspace(prev => prev ? {
            ...prev,
            notes: data.counts.notes,
            documents: data.counts.documents,
            members: data.counts.members,
          } : null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch workspace counts:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(dateString);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document':
        return DocumentIcon;
      case 'note':
        return DocumentTextIcon;
      case 'member':
        return UsersIcon;
      default:
        return ClockIcon;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <SidebarNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="lg:pl-64">
          <TopNavbar />
          <main className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-cyan-500/20 rounded w-1/3" />
                <div className="h-32 bg-cyan-500/20 rounded" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 h-96 bg-cyan-500/20 rounded" />
                  <div className="h-96 bg-cyan-500/20 rounded" />
                </div>
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
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-20">
                <FolderIcon className="w-24 h-24 mx-auto text-gray-600 mb-6" />
                <h1 className="text-3xl font-bold text-white mb-4">
                  {error === 'Workspace not found' ? 'Workspace Not Found' : 'Error Loading Workspace'}
                </h1>
                <p className="text-gray-400 mb-8">
                  {error === 'Workspace not found' 
                    ? 'The workspace you\'re looking for doesn\'t exist or has been removed.'
                    : 'There was an error loading the workspace. Please try again.'}
                </p>
                <button
                  onClick={() => router.push('/workspaces')}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200"
                >
                  Back to Workspaces
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!workspace) return null;

  return (
    <div className="min-h-screen bg-black">
      <SidebarNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="lg:pl-64">
        <TopNavbar />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <button
                onClick={() => router.push('/workspaces')}
                className="hover:text-cyan-400 transition-colors"
              >
                Workspaces
              </button>
              <span>/</span>
              <span className="text-white">{workspace.name}</span>
            </div>

            {/* Header */}
            <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-8">
              <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push('/workspaces')}
                    className="p-3 rounded-xl bg-white/10 border border-cyan-500/30 text-cyan-400 hover:bg-white/20 transition-all duration-200"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getColorClasses(workspace.color)} flex items-center justify-center shadow-lg`}>
                    <FolderIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">{workspace.name}</h1>
                    <p className="text-gray-400">{workspace.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-cyan-500/30 text-cyan-400 hover:bg-white/20 transition-all duration-200"
                  >
                    <PencilIcon className="w-5 h-5" />
                    <span className="font-medium">Edit</span>
                  </button>
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200"
                  >
                    <UserPlusIcon className="w-5 h-5" />
                    <span className="font-medium">Add Member</span>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-black/40 border border-cyan-500/10">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <UsersIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Members</p>
                    <p className="text-2xl font-bold text-white">{workspace.members}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-black/40 border border-purple-500/10">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <DocumentIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Documents</p>
                    <p className="text-2xl font-bold text-white">{workspace.documents}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-black/40 border border-green-500/10">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Notes</p>
                    <p className="text-2xl font-bold text-white">{workspace.notes}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-black/40 border border-orange-500/10">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Created</p>
                    <p className="text-sm font-semibold text-white">{formatDate(workspace.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => router.push(`/notes?workspace=${workspaceId}`)}
                className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Create Note</p>
                  <p className="text-sm text-gray-400">Add new note</p>
                </div>
              </button>

              <button
                onClick={() => router.push(`/documents?workspace=${workspaceId}`)}
                className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-[#0D1B2A] to-black border border-purple-500/20 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DocumentPlusIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Upload Document</p>
                  <p className="text-sm text-gray-400">Add files</p>
                </div>
              </button>

              <button
                onClick={() => router.push(`/chat?workspace=${workspaceId}`)}
                className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-[#0D1B2A] to-black border border-green-500/20 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Start Chat</p>
                  <p className="text-sm text-gray-400">Team discussion</p>
                </div>
              </button>

              <button
                onClick={() => router.push(`/ai-assistance?workspace=${workspaceId}`)}
                className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-[#0D1B2A] to-black border border-orange-500/20 hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <SparklesIcon className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Ask AI</p>
                  <p className="text-sm text-gray-400">Get insights</p>
                </div>
              </button>
            </div>

            {/* Tabs */}
            <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 p-2 border-b border-cyan-500/20 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'notes', label: 'Notes' },
                  { id: 'documents', label: 'Documents' },
                  { id: 'members', label: 'Members' },
                  { id: 'activity', label: 'Activity' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`
                      px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-200
                      ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Recent Notes */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-white">Recent Notes</h3>
                          <button
                            onClick={() => setActiveTab('notes')}
                            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            View All
                          </button>
                        </div>
                        <div className="space-y-3">
                          {workspace.items.notes.slice(0, 3).map((note) => (
                            <button
                              key={note.id}
                              onClick={() => router.push(`/notes/${note.id}`)}
                              className="w-full text-left p-4 rounded-xl bg-black/40 border border-cyan-500/10 hover:border-cyan-500/30 hover:bg-black/60 transition-all duration-200"
                            >
                              <h4 className="text-white font-semibold mb-1">{note.title}</h4>
                              <p className="text-sm text-gray-400 line-clamp-2 mb-2">{note.content}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{note.author}</span>
                                <span>•</span>
                                <span>{formatRelativeTime(note.updatedAt)}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Recent Documents */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-white">Recent Documents</h3>
                          <button
                            onClick={() => setActiveTab('documents')}
                            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            View All
                          </button>
                        </div>
                        <div className="space-y-3">
                          {workspace.items.documents.slice(0, 3).map((doc) => (
                            <button
                              key={doc.id}
                              onClick={() => router.push(`/documents/${doc.id}`)}
                              className="w-full text-left p-4 rounded-xl bg-black/40 border border-purple-500/10 hover:border-purple-500/30 hover:bg-black/60 transition-all duration-200"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                                  <DocumentIcon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white font-semibold truncate">{doc.title}</h4>
                                  <p className="text-sm text-gray-400">{formatFileSize(doc.size)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                <span>{doc.uploadedBy}</span>
                                <span>•</span>
                                <span>{formatRelativeTime(doc.uploadedAt)}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                        <button
                          onClick={() => setActiveTab('activity')}
                          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          View All
                        </button>
                      </div>
                      <div className="space-y-3">
                        {workspace.activity.slice(0, 5).map((activity) => {
                          const Icon = getActivityIcon(activity.type);
                          return (
                            <div
                              key={activity.id}
                              className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-cyan-500/10"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-white">
                                  <span className="font-semibold">{activity.user}</span>
                                  {' '}{activity.action}{' '}
                                  <span className="text-cyan-400">{activity.item}</span>
                                </p>
                                <p className="text-sm text-gray-400">{formatRelativeTime(activity.timestamp)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">All Notes ({workspace.items.notes.length})</h3>
                      <button
                        onClick={() => router.push(`/notes?workspace=${workspaceId}`)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200"
                      >
                        Create Note
                      </button>
                    </div>
                    <div className="relative mb-4">
                      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search notes..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/40 border border-cyan-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {workspace.items.notes
                        .filter(note => 
                          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.content.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((note) => (
                          <button
                            key={note.id}
                            onClick={() => router.push(`/notes/${note.id}`)}
                            className="text-left p-6 rounded-xl bg-black/40 border border-cyan-500/10 hover:border-cyan-500/30 hover:bg-black/60 transition-all duration-200"
                          >
                            <h4 className="text-lg font-bold text-white mb-2">{note.title}</h4>
                            <p className="text-sm text-gray-400 line-clamp-3 mb-4">{note.content}</p>
                            {note.tags && note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {note.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{note.author}</span>
                              <span>•</span>
                              <span>{formatRelativeTime(note.updatedAt)}</span>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">All Documents ({workspace.items.documents.length})</h3>
                      <button
                        onClick={() => router.push(`/documents?workspace=${workspaceId}`)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200"
                      >
                        Upload Document
                      </button>
                    </div>
                    <div className="relative mb-4">
                      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search documents..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/40 border border-cyan-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {workspace.items.documents
                        .filter(doc => 
                          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => router.push(`/documents/${doc.id}`)}
                            className="text-left p-6 rounded-xl bg-black/40 border border-purple-500/10 hover:border-purple-500/30 hover:bg-black/60 transition-all duration-200"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                <DocumentIcon className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-semibold truncate">{doc.title}</h4>
                                <p className="text-sm text-gray-400">{formatFileSize(doc.size)}</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-400 truncate mb-2">{doc.fileName}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{doc.uploadedBy}</span>
                              <span>•</span>
                              <span>{formatRelativeTime(doc.uploadedAt)}</span>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Members Tab */}
                {activeTab === 'members' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">Team Members ({workspace.items.members.length})</h3>
                      <button
                        onClick={() => setShowAddMemberModal(true)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200"
                      >
                        Add Member
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {workspace.items.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-4 p-6 rounded-xl bg-black/40 border border-cyan-500/10"
                        >
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold">{member.name}</h4>
                            <p className="text-sm text-gray-400 truncate">{member.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`
                                px-2 py-0.5 rounded text-xs font-medium
                                ${member.role === 'Owner' ? 'bg-cyan-500/20 text-cyan-400' : ''}
                                ${member.role === 'Editor' ? 'bg-purple-500/20 text-purple-400' : ''}
                                ${member.role === 'Viewer' ? 'bg-gray-500/20 text-gray-400' : ''}
                              `}>
                                {member.role}
                              </span>
                              <span className="text-xs text-gray-500">
                                Joined {formatRelativeTime(member.joinedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">Activity Timeline</h3>
                    <div className="space-y-3">
                      {workspace.activity.map((activity) => {
                        const Icon = getActivityIcon(activity.type);
                        return (
                          <div
                            key={activity.id}
                            className="flex items-start gap-4 p-6 rounded-xl bg-black/40 border border-cyan-500/10"
                          >
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white text-lg">
                                <span className="font-semibold">{activity.user}</span>
                                {' '}{activity.action}{' '}
                                <span className="text-cyan-400">{activity.item}</span>
                              </p>
                              <p className="text-sm text-gray-400 mt-1">{formatRelativeTime(activity.timestamp)}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(activity.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Insights Section */}
            <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <SparklesIcon className="w-6 h-6 text-cyan-400 animate-pulse" />
                <h3 className="text-xl font-bold text-white">AI Workspace Insights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push(`/ai-assistance?workspace=${workspaceId}&action=summarize`)}
                  className="p-4 rounded-xl bg-black/40 border border-cyan-500/10 hover:border-cyan-500/30 hover:bg-black/60 transition-all duration-200 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-3">
                    <SparklesIcon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-1">Summarize Workspace</h4>
                  <p className="text-sm text-gray-400">Get AI summary of all content</p>
                </button>

                <button
                  onClick={() => router.push(`/ai-assistance?workspace=${workspaceId}&action=search`)}
                  className="p-4 rounded-xl bg-black/40 border border-purple-500/10 hover:border-purple-500/30 hover:bg-black/60 transition-all duration-200 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-3">
                    <MagnifyingGlassIcon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-1">Smart Search</h4>
                  <p className="text-sm text-gray-400">AI-powered content search</p>
                </button>

                <button
                  onClick={() => router.push(`/ai-assistance?workspace=${workspaceId}&action=ask`)}
                  className="p-4 rounded-xl bg-black/40 border border-green-500/10 hover:border-green-500/30 hover:bg-black/60 transition-all duration-200 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-3">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-1">Ask AI</h4>
                  <p className="text-sm text-gray-400">Get answers about workspace</p>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Workspace Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/30 rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-white mb-6">Edit Workspace</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Workspace Name</label>
                <input
                  type="text"
                  defaultValue={workspace.name}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-cyan-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                  defaultValue={workspace.description}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-cyan-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-cyan-500/30 text-white rounded-xl hover:bg-white/20 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement update
                    setShowEditModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/30 rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-white mb-6">Add Team Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="member@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-cyan-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                <select className="w-full px-4 py-3 rounded-xl bg-black/60 border border-cyan-500/20 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20">
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-cyan-500/30 text-white rounded-xl hover:bg-white/20 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement add member
                    setShowAddMemberModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
