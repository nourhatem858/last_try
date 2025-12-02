'use client';

/**
 * Recent Activity List Component
 * Shows recent user activity with real-time updates and API integration
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  DocumentTextIcon,
  DocumentIcon,
  FolderIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  type: 'note' | 'document' | 'workspace' | 'chat';
  title: string;
  timestamp: string;
  workspaceId?: string;
}

interface RecentActivityListProps {
  refreshTrigger?: number;
}

export default function RecentActivityList({ refreshTrigger }: RecentActivityListProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecentActivity();
  }, [token, refreshTrigger]);

  const fetchRecentActivity = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Fetch from multiple endpoints
      const [notesRes, docsRes, workspacesRes, chatsRes] = await Promise.allSettled([
        fetch('/api/notes', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/documents', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/workspaces', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/chats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const allActivities: Activity[] = [];

      // Process notes
      if (notesRes.status === 'fulfilled' && notesRes.value.ok) {
        const notesData = await notesRes.value.json();
        const notes = (notesData.data || []).slice(0, 5).map((note: any) => ({
          id: note.id,
          type: 'note' as const,
          title: note.title,
          timestamp: note.updatedAt || note.createdAt,
          workspaceId: note.workspaceId,
        }));
        allActivities.push(...notes);
      }

      // Process documents
      if (docsRes.status === 'fulfilled' && docsRes.value.ok) {
        const docsData = await docsRes.value.json();
        const docs = (docsData.data || []).slice(0, 5).map((doc: any) => ({
          id: doc.id,
          type: 'document' as const,
          title: doc.title || doc.fileName,
          timestamp: doc.updatedAt || doc.uploadedAt || doc.createdAt,
          workspaceId: doc.workspaceId,
        }));
        allActivities.push(...docs);
      }

      // Process workspaces
      if (workspacesRes.status === 'fulfilled' && workspacesRes.value.ok) {
        const workspacesData = await workspacesRes.value.json();
        const workspaces = (workspacesData.data || []).slice(0, 5).map((workspace: any) => ({
          id: workspace.id,
          type: 'workspace' as const,
          title: workspace.name,
          timestamp: workspace.updatedAt || workspace.createdAt,
        }));
        allActivities.push(...workspaces);
      }

      // Process chats
      if (chatsRes.status === 'fulfilled' && chatsRes.value.ok) {
        const chatsData = await chatsRes.value.json();
        const chats = (chatsData.data || []).slice(0, 5).map((chat: any) => ({
          id: chat.id,
          type: 'chat' as const,
          title: chat.title,
          timestamp: chat.updatedAt || chat.createdAt,
        }));
        allActivities.push(...chats);
      }

      // Sort by timestamp (most recent first) and take top 10
      allActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(allActivities.slice(0, 10));
    } catch (err: any) {
      console.error('Failed to fetch recent activity:', err);
      setError('Failed to load recent activity');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'note':
        return DocumentTextIcon;
      case 'document':
        return DocumentIcon;
      case 'workspace':
        return FolderIcon;
      case 'chat':
        return ChatBubbleLeftIcon;
      default:
        return DocumentIcon;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'note':
        return 'from-purple-500 to-pink-600';
      case 'document':
        return 'from-green-500 to-emerald-600';
      case 'workspace':
        return 'from-cyan-500 to-blue-600';
      case 'chat':
        return 'from-orange-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleActivityClick = (activity: Activity) => {
    switch (activity.type) {
      case 'note':
        router.push(`/notes`);
        break;
      case 'document':
        router.push(`/documents`);
        break;
      case 'workspace':
        router.push(`/workspaces`);
        break;
      case 'chat':
        router.push(`/chat`);
        break;
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
          <p className="text-sm text-gray-400 mt-1">Your latest updates</p>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="w-8 h-8 text-cyan-400" />
          {loading && (
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {loading && activities.length === 0 ? (
          // Loading skeletons
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-cyan-500/20 animate-pulse"
              >
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-cyan-500/20 rounded w-3/4" />
                  <div className="h-3 bg-cyan-500/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-500 mb-2">No recent activity</p>
            <p className="text-sm text-gray-600">
              Start creating notes, documents, or workspaces to see activity here
            </p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = getIcon(activity.type);
            const gradient = getColor(activity.type);

            return (
              <button
                key={`${activity.type}-${activity.id}`}
                onClick={() => handleActivityClick(activity)}
                className="
                  w-full group flex items-center gap-4 p-4 rounded-xl
                  bg-black/40 border border-cyan-500/20
                  hover:border-cyan-500/40 hover:bg-black/60
                  hover:shadow-lg hover:shadow-cyan-500/10
                  transition-all duration-200
                "
              >
                <div
                  className={`
                    w-12 h-12 rounded-lg bg-gradient-to-br ${gradient}
                    flex items-center justify-center flex-shrink-0
                    shadow-lg group-hover:scale-110 group-hover:shadow-xl
                    transition-all duration-200
                  `}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                    {activity.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400 capitalize">
                      {activity.type}
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-400">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-5 h-5 text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            );
          })
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-cyan-500/20">
          <button
            onClick={() => router.push('/dashboard')}
            className="
              w-full py-2 text-sm text-cyan-400 hover:text-cyan-300
              transition-colors duration-200
            "
          >
            View All Activity →
          </button>
        </div>
      )}
    </div>
  );
}
