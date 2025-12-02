'use client';

/**
 * Chat Card Component
 * Displays individual chat with preview and unread count
 */

import Link from 'next/link';
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  UserIcon,
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
  updatedAt: string;
}

interface ChatCardProps {
  chat: Chat;
}

export default function ChatCard({ chat }: ChatCardProps) {
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

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Link
      href={`/chat/${chat.id}`}
      className="
        group relative bg-gradient-to-br from-[#0D1B2A] to-black
        border border-cyan-500/20 rounded-2xl p-6
        hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/20
        transition-all duration-300 overflow-hidden
      "
    >
      {/* Glowing background effect */}
      <div
        className="
          absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0
          group-hover:opacity-100 transition-opacity duration-300
        "
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Avatar/Icon */}
            <div
              className="
                w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600
                flex items-center justify-center shadow-lg flex-shrink-0
                group-hover:scale-110 transition-transform duration-300
              "
            >
              {chat.type === 'group' ? (
                <UserGroupIcon className="w-6 h-6 text-white" />
              ) : (
                <UserIcon className="w-6 h-6 text-white" />
              )}
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate group-hover:text-cyan-400 transition-colors mb-1">
                {chat.title}
              </h3>
              <p className="text-sm text-gray-400">
                {chat.participants.length} {chat.participants.length === 1 ? 'participant' : 'participants'}
              </p>
            </div>
          </div>

          {/* Unread Badge */}
          {chat.unreadCount > 0 && (
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/50">
                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
              </span>
            </div>
          )}
        </div>

        {/* Last Message */}
        {chat.lastMessage && (
          <div className="mb-4 p-3 rounded-lg bg-black/40">
            <p className="text-sm text-gray-300 mb-1">
              <span className="font-semibold text-cyan-400">{chat.lastMessage.sender}:</span>{' '}
              {truncateText(chat.lastMessage.text)}
            </p>
            <p className="text-xs text-gray-500">
              {formatTimestamp(chat.lastMessage.timestamp)}
            </p>
          </div>
        )}

        {/* Workspace Badge */}
        {chat.workspace && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {chat.workspace}
            </span>
          </div>
        )}

        {/* Chat Type Badge */}
        <div className="mt-3 flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500 capitalize">{chat.type} chat</span>
        </div>
      </div>

      {/* Hover shine effect */}
      <div
        className="
          absolute inset-0 opacity-0 group-hover:opacity-100
          bg-gradient-to-r from-transparent via-white/5 to-transparent
          -translate-x-full group-hover:translate-x-full
          transition-all duration-1000
        "
      />
    </Link>
  );
}
