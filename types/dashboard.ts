/**
 * Dashboard Types and Interfaces
 */

export interface DashboardSummary {
  workspaces: number;
  notes: number;
  documents: number;
  activeChats: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'workspace' | 'note' | 'document' | 'chat';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface ModuleCard {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  count?: number;
  requiresAuth?: boolean;
  roles?: string[];
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  color: string;
}
