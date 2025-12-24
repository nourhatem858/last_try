'use client';

/**
 * Chat Page
 * Displays all chats for the logged-in user
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SidebarNav from '@/components/dashboard/SidebarNav';
import TopNavbar from '@/components/dashboard/TopNavbar';
import ChatCard from '@/components/chat/ChatCard';
import CreateChatModal from '@/components/chat/CreateChatModal';
import {
  ChatBubbleLeftRightIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

interface Chat {
  id: string;
  title: string;
  type: 'direct' | 'group';
  participants: Array<{ id: string; name: string; avatar: string | null }>;
  lastMessage: {
    text: string;
    sender: string;
    timestamp: string;
  } | null;
  unreadCount: number;
  workspace: string | null;
  workspaceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ChatPage() {
  const { isAuthenticated, loading: authLoading, token } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch chats
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchChats();
    }
  }, [isAuthenticated, token]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data.data || []);
      } else {
        setError('Failed to load chats');
      }
    } catch (err) {
      console.error('Fetch chats error:', err);
      setError('An error occurred while loading chats');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async (data: { title: string; type: 'direct' | 'group'; participants: string[] }) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setChats([result.data, ...chats]);
        setShowCreateModal(false);
        router.push(`/chat/${result.data.id}`);
      } else {
        throw new Error('Failed to create chat');
      }
    } catch (err: any) {
      throw err;
    }
  };

  // Filter chats
  const filteredChats = chats
    .filter((chat) => {
      const matchesSearch =
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage?.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || chat.type === filterType;
      return matchesSearch && matchesType;
    });

  // Calculate stats
  const stats = {
    total: chats.length,
    unread: chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0),
    groups: chats.filter((c) => c.type === 'group').length,
  };

  // Show loading state
  if (authLoading || (loading && chats.length === 0)) {
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
              <h1 className="text-4xl font-bold text-white mb-2">Chat</h1>
              <p className="text-gray-400">
                Connect and collaborate with your team
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
              <PlusCircleIcon className="w-5 h-5" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: 'Total Chats',
                value: stats.total,
                icon: ChatBubbleLeftRightIcon,
                color: 'from-cyan-500 to-blue-600',
              },
              {
                label: 'Unread Messages',
                value: stats.unread,
                icon: EnvelopeIcon,
                color: 'from-red-500 to-pink-600',
              },
              {
                label: 'Group Chats',
                value: stats.groups,
                icon: UserGroupIcon,
                color: 'from-purple-500 to-pink-600',
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
                  placeholder="Search chats..."
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

            {/* Filter by Type */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
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
                <option value="all">All Chats</option>
                <option value="group">Group Chats</option>
                <option value="direct">Direct Messages</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              {error}
            </div>
          )}

          {/* Chats Grid */}
          {filteredChats.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {searchQuery || filterType !== 'all' ? 'No chats found' : 'No chats yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || filterType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start your first conversation'}
              </p>
              {!searchQuery && filterType === 'all' && (
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
                  <PlusCircleIcon className="w-5 h-5" />
                  <span>Start Your First Chat</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChats.map((chat) => (
                <ChatCard key={chat.id} chat={chat} />
              ))}
            </div>
          )}

          {/* Stats */}
          {filteredChats.length > 0 && (
            <div className="flex items-center justify-center gap-8 pt-6 text-sm text-gray-400">
              <span>
                Showing {filteredChats.length} of {chats.length} chats
              </span>
            </div>
          )}
        </main>
      </div>

      {/* Create Chat Modal */}
      <CreateChatModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateChat}
      />
    </div>
  );
}
