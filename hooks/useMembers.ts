/**
 * useMembers Hook
 * Custom hook for managing workspace members
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Member {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  avatar: string | null;
  status: 'active' | 'invited';
  joinedAt: string;
  lastActive: string | null;
}

interface UseMembersResult {
  members: Member[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addMember: (email: string, role: string) => Promise<Member>;
  removeMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: string) => Promise<void>;
}

export function useMembers(workspaceId: string | null): UseMembersResult {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!workspaceId) {
      setError('No workspace ID provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('👥 Fetching members for workspace:', workspaceId);

      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/members?workspaceId=${workspaceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch members');
      }

      if (!data.success || !data.data) {
        throw new Error('Invalid response format');
      }

      console.log(`✅ Fetched ${data.count} members`);
      setMembers(data.data);
      setError(null);

    } catch (err: any) {
      console.error('❌ Error fetching members:', err);
      setError(err.message || 'Failed to fetch members');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  const addMember = useCallback(async (email: string, role: string): Promise<Member> => {
    if (!workspaceId) {
      throw new Error('No workspace ID provided');
    }

    console.log('➕ Adding member:', email, role);

    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/members', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, role, workspaceId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to add member');
    }

    console.log('✅ Member added successfully');

    // Refresh members list
    await fetchMembers();

    return data.data;
  }, [workspaceId, fetchMembers]);

  const removeMember = useCallback(async (memberId: string): Promise<void> => {
    console.log('➖ Removing member:', memberId);

    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/members/${memberId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to remove member');
    }

    console.log('✅ Member removed successfully');

    // Refresh members list
    await fetchMembers();
  }, [fetchMembers]);

  const updateMemberRole = useCallback(async (memberId: string, role: string): Promise<void> => {
    console.log('🔄 Updating member role:', memberId, role);

    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/members/${memberId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update member role');
    }

    console.log('✅ Member role updated successfully');

    // Refresh members list
    await fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    if (workspaceId) {
      fetchMembers();
    }
  }, [workspaceId, fetchMembers]);

  return {
    members,
    loading,
    error,
    refetch: fetchMembers,
    addMember,
    removeMember,
    updateMemberRole,
  };
}
