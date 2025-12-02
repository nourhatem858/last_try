'use client';

/**
 * Sidebar Navigation Component
 * Collapsible sidebar with glowing hover effects
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  FolderIcon,
  UsersIcon,
  DocumentTextIcon,
  DocumentIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ArrowUpTrayIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
}

interface SidebarNavProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function SidebarNav({ isOpen, onToggle }: SidebarNavProps) {
  const pathname = usePathname();
  const { token, isAuthenticated } = useAuth();
  const [counts, setCounts] = useState({
    workspaces: 0,
    notes: 0,
    documents: 0,
    aiChats: 0,
  });

  // Fetch counts for badges - FIXED to use real MongoDB data
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCounts();
      
      // Refresh counts every 30 seconds to keep them updated
      const interval = setInterval(fetchCounts, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, token]);

  const fetchCounts = async () => {
    try {
      console.log('📊 Fetching real sidebar counts from database...');
      
      const response = await fetch('/api/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          console.log('✅ Real counts received:', result.data);
          setCounts({
            workspaces: result.data.workspaces || 0,
            notes: result.data.notes || 0,
            documents: result.data.documents || 0,
            aiChats: 0, // AI chats count (can be added later)
          });
        }
      } else {
        console.error('❌ Failed to fetch counts:', response.status);
        // Set to 0 if fetch fails
        setCounts({
          workspaces: 0,
          notes: 0,
          documents: 0,
          aiChats: 0,
        });
      }
    } catch (error) {
      console.error('❌ Failed to fetch sidebar counts:', error);
      // Set to 0 on error
      setCounts({
        workspaces: 0,
        notes: 0,
        documents: 0,
        aiChats: 0,
      });
    }
  };

  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Workspaces', href: '/workspaces', icon: FolderIcon, badge: counts.workspaces },
    { name: 'Members', href: '/members', icon: UsersIcon },
    { name: 'Notes', href: '/notes', icon: DocumentTextIcon, badge: counts.notes },
    { name: 'Documents', href: '/documents', icon: DocumentIcon, badge: counts.documents },
    { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon, badge: counts.aiChats },
    { name: 'AI Assistance', href: '/ai-assistance', icon: SparklesIcon },
  ];

  const quickActions = [
    { name: 'New Note', icon: PlusCircleIcon, action: 'new-note' },
    { name: 'Upload Doc', icon: ArrowUpTrayIcon, action: 'upload-doc' },
    { name: 'New Workspace', icon: FolderIcon, action: 'new-workspace' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b from-[#0D1B2A] to-black
          border-r border-cyan-500/20 z-50 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-72 lg:w-64
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">AI Workspace</h1>
              <p className="text-xs text-cyan-400">Adaptive Knowledge</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200 relative overflow-hidden
                  ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {/* Glowing effect on hover */}
                <div
                  className={`
                    absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    ${active ? 'opacity-100' : ''}
                  `}
                />

                {/* Active indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full shadow-lg shadow-cyan-500/50" />
                )}

                <Icon
                  className={`
                    w-5 h-5 relative z-10 transition-all duration-200
                    ${active ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'group-hover:scale-110'}
                  `}
                />
                <span className="font-medium relative z-10">{item.name}</span>

                {/* Badge */}
                {item.badge && (
                  <span
                    className={`
                      ml-auto px-2 py-0.5 text-xs font-bold rounded-full relative z-10
                      ${
                        active
                          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                          : 'bg-gray-700 text-gray-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-400'
                      }
                    `}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t border-cyan-500/20">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.name}
                  className="
                    group w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
                    bg-gradient-to-r from-cyan-500/10 to-blue-500/10
                    border border-cyan-500/20 text-cyan-400
                    hover:from-cyan-500/20 hover:to-blue-500/20
                    hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20
                    transition-all duration-200 relative overflow-hidden
                  "
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Icon className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium relative z-10">{action.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-500/20">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
            <span>All systems operational</span>
          </div>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="
          fixed bottom-6 left-6 lg:hidden z-40
          w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600
          flex items-center justify-center shadow-2xl shadow-cyan-500/50
          hover:scale-110 transition-transform duration-200
        "
      >
        <Bars3Icon className="w-6 h-6 text-white" />
      </button>
    </>
  );
}
