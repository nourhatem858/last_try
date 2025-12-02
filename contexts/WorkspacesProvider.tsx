'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Workspace {
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

interface WorkspacesContextType {
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  fetchWorkspaces: () => Promise<void>;
}

const WorkspacesContext = createContext<WorkspacesContextType | undefined>(undefined);

export function WorkspacesProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/workspaces', {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      });
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addWorkspace = useCallback((workspace: Workspace) => {
    setWorkspaces((prev) => [workspace, ...prev]);
  }, []);

  const updateWorkspace = useCallback((id: string, updates: Partial<Workspace>) => {
    setWorkspaces((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  }, []);

  const deleteWorkspace = useCallback((id: string) => {
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return (
    <WorkspacesContext.Provider value={{ workspaces, loading, error, setWorkspaces, addWorkspace, updateWorkspace, deleteWorkspace, fetchWorkspaces }}>
      {children}
    </WorkspacesContext.Provider>
  );
}

export function useWorkspaces() {
  const context = useContext(WorkspacesContext);
  if (!context) throw new Error('useWorkspaces must be used within WorkspacesProvider');
  return context;
}
