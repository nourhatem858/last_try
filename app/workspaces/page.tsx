'use client';

/**
 * Workspaces Page
 * Displays all workspaces for the logged-in user
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SidebarNav from '@/components/dashboard/SidebarNav';
import TopNavbar from '@/components/dashboard/TopNavbar';
import WorkspaceCard from '@/components/workspaces/WorkspaceCard';
import CreateWorkspaceModal from '@/components/workspaces/CreateWorkspaceModal';
import {
  FolderPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
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

export default function WorkspacesPage() {
  const { isAuthenticated, loading: authLoading, token } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'updated' | 'created'>('updated');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch workspaces
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchWorkspaces();
    }
  }, [isAuthenticated, token]);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workspaces', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data.data || []);
      } else {
        setError('Failed to load workspaces');
      }
    } catch (err) {
      console.error('Fetch workspaces error:', err);
      setError('An error occurred while loading workspaces');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (data: { name: string; description: string; color: string }) => {
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setWorkspaces([result.data, ...workspaces]);
        setShowCreateModal(false);
      } else {
        throw new Error('Failed to create workspace');
      }
    } catch (err: any) {
      throw err;
    }
  };

  const handleEditWorkspace = (workspace: Workspace) => {
    // TODO: Implement edit functionality
    console.log('Edit workspace:', workspace);
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (!confirm('Are you sure you want to delete this workspace?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setWorkspaces(workspaces.filter((w) => w.id !== workspaceId));
        console.log('✅ [Workspaces Page | handleDeleteWorkspace] Workspace deleted successfully', { workspaceId });
      } else {
        const data = await response.json();
        console.error('❌ [Workspaces Page | handleDeleteWorkspace] Failed to delete workspace', { 
          status: response.status, 
          error: data?.error,
          workspaceId 
        });
      }
    } catch (err: any) {
      console.error('❌ [Workspaces Page | handleDeleteWorkspace] Network error', { 
        error: err.message, 
        stack: err.stack,
        workspaceId 
      });
    }
  };

  // Filter and sort workspaces
  const filteredWorkspaces = workspaces
    .filter((workspace) =>
      workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Show loading state
  if (authLoading || (loading && workspaces.length === 0)) {
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
                  <div key={i} className="h-64 bg-cyan-500/20 rounded-2xl" />
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
              <h1 className="text-4xl font-bold text-white mb-2">Workspaces</h1>
              <p className="text-gray-400">
                Organize your knowledge into collaborative spaces
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="
                flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                bg-gradient-to-r from-cyan-500 to-blue-600
                text-white shadow-lg shadow-cyan-500/30
                hover:shadow-cyan-500/50 hover:scale-105
                transition-all duration-200
              "
            >
              <FolderPlusIcon className="w-5 h-5" />
              <span>Create Workspace</span>
            </button>
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
                  placeholder="Search workspaces..."
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

            {/* Sort */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
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
                <option value="updated">Recently Updated</option>
                <option value="created">Recently Created</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-2 p-1 bg-black/40 border border-cyan-500/20 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}
                `}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}
                `}
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              {error}
            </div>
          )}

          {/* Workspaces Grid/List */}
          {filteredWorkspaces.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center">
                <FolderPlusIcon className="w-12 h-12 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {searchQuery ? 'No workspaces found' : 'No workspaces yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Create your first workspace to get started'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="
                    inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                    bg-gradient-to-r from-cyan-500 to-blue-600
                    text-white shadow-lg shadow-cyan-500/30
                    hover:shadow-cyan-500/50 hover:scale-105
                    transition-all duration-200
                  "
                >
                  <FolderPlusIcon className="w-5 h-5" />
                  <span>Create Your First Workspace</span>
                </button>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredWorkspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  onEdit={handleEditWorkspace}
                  onDelete={handleDeleteWorkspace}
                />
              ))}
            </div>
          )}

          {/* Stats */}
          {filteredWorkspaces.length > 0 && (
            <div className="flex items-center justify-center gap-8 pt-6 text-sm text-gray-400">
              <span>
                Showing {filteredWorkspaces.length} of {workspaces.length} workspaces
              </span>
            </div>
          )}
        </main>
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateWorkspace}
      />
    </div>
  );
}
