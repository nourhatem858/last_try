'use client';

/**
 * Members Page
 * Displays all members for the workspace
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SidebarNav from '@/components/dashboard/SidebarNav';
import TopNavbar from '@/components/dashboard/TopNavbar';
import MemberCard from '@/components/members/MemberCard';
import InviteMemberModal from '@/components/members/InviteMemberModal';
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UsersIcon,
  ShieldCheckIcon,
  UserGroupIcon,
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

export default function MembersPage() {
  const { isAuthenticated, loading: authLoading, token, user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch members
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchMembers();
    }
  }, [isAuthenticated, token]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/members', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data.data || []);
      } else {
        setError('Failed to load members');
      }
    } catch (err) {
      console.error('Fetch members error:', err);
      setError('An error occurred while loading members');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (data: { email: string; role: string }) => {
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setMembers([...members, result.data]);
        setShowInviteModal(false);
      } else {
        throw new Error('Failed to invite member');
      }
    } catch (err: any) {
      throw err;
    }
  };

  const handleEditRole = (member: Member) => {
    // TODO: Implement role change functionality
    console.log('Edit role for:', member);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMembers(members.filter((m) => m.id !== memberId));
        console.log('✅ [Members Page | handleRemoveMember] Member removed successfully', { memberId });
      } else {
        const data = await response.json();
        console.error('❌ [Members Page | handleRemoveMember] Failed to remove member', { 
          status: response.status, 
          error: data?.error,
          memberId 
        });
      }
    } catch (err: any) {
      console.error('❌ [Members Page | handleRemoveMember] Network error', { 
        error: err.message, 
        stack: err.stack,
        memberId 
      });
    }
  };

  // Filter members
  const filteredMembers = members
    .filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === 'all' || member.role === filterRole;
      const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });

  // Calculate stats
  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === 'active').length,
    invited: members.filter((m) => m.status === 'invited').length,
    admins: members.filter((m) => m.role === 'admin' || m.role === 'owner').length,
  };

  // Show loading state
  if (authLoading || (loading && members.length === 0)) {
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
              <h1 className="text-4xl font-bold text-white mb-2">Team Members</h1>
              <p className="text-gray-400">
                Manage workspace members and permissions
              </p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="
                flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                bg-gradient-to-r from-cyan-500 to-blue-600
                text-white shadow-lg shadow-cyan-500/30
                hover:shadow-cyan-500/50 hover:scale-105
                transition-all duration-200
              "
            >
              <UserPlusIcon className="w-5 h-5" />
              <span>Invite Member</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                label: 'Total Members',
                value: stats.total,
                icon: UsersIcon,
                color: 'from-cyan-500 to-blue-600',
              },
              {
                label: 'Active',
                value: stats.active,
                icon: UserGroupIcon,
                color: 'from-green-500 to-emerald-600',
              },
              {
                label: 'Invited',
                value: stats.invited,
                icon: UserPlusIcon,
                color: 'from-yellow-500 to-orange-600',
              },
              {
                label: 'Admins',
                value: stats.admins,
                icon: ShieldCheckIcon,
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
                  placeholder="Search members..."
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

            {/* Filter by Role */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="
                  px-4 py-3 rounded-xl
                  bg-black/40 border border-cyan-500/20
                  text-white
                  focus:outline-none focus:border-cyan-500/50
                  transition-all duration-200
                "
              >
                <option value="all">All Roles</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="
                px-4 py-3 rounded-xl
                bg-black/40 border border-cyan-500/20
                text-white
                focus:outline-none focus:border-cyan-500/50
                transition-all duration-200
              "
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              {error}
            </div>
          )}

          {/* Members Grid */}
          {filteredMembers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center">
                <UsersIcon className="w-12 h-12 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {searchQuery || filterRole !== 'all' || filterStatus !== 'all'
                  ? 'No members found'
                  : 'No members yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || filterRole !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Invite your first team member to get started'}
              </p>
              {!searchQuery && filterRole === 'all' && filterStatus === 'all' && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="
                    inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                    bg-gradient-to-r from-cyan-500 to-blue-600
                    text-white shadow-lg shadow-cyan-500/30
                    hover:shadow-cyan-500/50 hover:scale-105
                    transition-all duration-200
                  "
                >
                  <UserPlusIcon className="w-5 h-5" />
                  <span>Invite Your First Member</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onEditRole={handleEditRole}
                  onRemove={handleRemoveMember}
                  currentUserRole={user?.role}
                />
              ))}
            </div>
          )}

          {/* Stats */}
          {filteredMembers.length > 0 && (
            <div className="flex items-center justify-center gap-8 pt-6 text-sm text-gray-400">
              <span>
                Showing {filteredMembers.length} of {members.length} members
              </span>
            </div>
          )}
        </main>
      </div>

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteMember}
      />
    </div>
  );
}
