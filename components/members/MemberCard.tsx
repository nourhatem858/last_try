'use client';

/**
 * Member Card Component
 * Displays individual member with role and actions
 */

import { useState } from 'react';
import {
  UserCircleIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  avatar?: string | null;
  status: 'active' | 'invited' | 'inactive';
  joinedAt: string;
  lastActive: string | null;
}

interface MemberCardProps {
  member: Member;
  onEditRole?: (member: Member) => void;
  onRemove?: (memberId: string) => void;
  currentUserRole?: string;
}

export default function MemberCard({ member, onEditRole, onRemove, currentUserRole }: MemberCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      owner: { color: 'from-purple-500 to-pink-600', label: 'Owner' },
      admin: { color: 'from-cyan-500 to-blue-600', label: 'Admin' },
      editor: { color: 'from-green-500 to-emerald-600', label: 'Editor' },
      viewer: { color: 'from-orange-500 to-red-600', label: 'Viewer' },
    };
    return badges[role] || badges.viewer;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      active: { color: 'text-green-400 bg-green-500/10', label: 'Active' },
      invited: { color: 'text-yellow-400 bg-yellow-500/10', label: 'Invited' },
      inactive: { color: 'text-gray-400 bg-gray-500/10', label: 'Inactive' },
    };
    return badges[status] || badges.inactive;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
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
    return date.toLocaleDateString();
  };

  const roleBadge = getRoleBadge(member.role);
  const statusBadge = getStatusBadge(member.status);
  const canEdit = currentUserRole === 'owner' || currentUserRole === 'admin';
  const canRemove = canEdit && member.role !== 'owner';

  return (
    <div
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
          <div className="flex items-center gap-4 flex-1">
            {/* Avatar */}
            <div className="relative">
              <div
                className={`
                  w-16 h-16 rounded-full bg-gradient-to-br ${roleBadge.color}
                  flex items-center justify-center shadow-lg
                  group-hover:scale-110 transition-transform duration-300
                `}
              >
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="w-10 h-10 text-white" />
                )}
              </div>
              {member.status === 'active' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-[#0D1B2A] rounded-full" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                  {member.name}
                </h3>
                {member.role === 'owner' && (
                  <CheckBadgeIcon className="w-5 h-5 text-purple-400 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <EnvelopeIcon className="w-4 h-4" />
                <span className="truncate">{member.email}</span>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {(canEdit || canRemove) && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#0D1B2A] border border-cyan-500/20 rounded-xl shadow-2xl z-20 overflow-hidden">
                    {canEdit && (
                      <button
                        onClick={() => {
                          onEditRole?.(member);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <PencilIcon className="w-4 h-4" />
                        <span className="text-sm">Change Role</span>
                      </button>
                    )}
                    {canRemove && (
                      <button
                        onClick={() => {
                          onRemove?.(member.id);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                      >
                        <TrashIcon className="w-4 h-4" />
                        <span className="text-sm">Remove Member</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className={`
              px-3 py-1 rounded-full text-xs font-semibold
              bg-gradient-to-r ${roleBadge.color} text-white
              shadow-lg
            `}
          >
            {roleBadge.label}
          </span>
          <span
            className={`
              px-3 py-1 rounded-full text-xs font-semibold
              ${statusBadge.color}
            `}
          >
            {statusBadge.label}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-black/40">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <ClockIcon className="w-4 h-4" />
              <span className="text-xs">Joined</span>
            </div>
            <p className="text-sm font-semibold text-white">
              {formatDate(member.joinedAt)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-black/40">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <ClockIcon className="w-4 h-4" />
              <span className="text-xs">Last Active</span>
            </div>
            <p className="text-sm font-semibold text-white">
              {formatDate(member.lastActive)}
            </p>
          </div>
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
    </div>
  );
}
