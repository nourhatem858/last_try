/**
 * Sidebar Component - Enhanced with nested menus, active states, and dark mode
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  BookmarkIcon, 
  BellIcon, 
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  FolderIcon,
  DocumentTextIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  darkMode?: boolean;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
  children?: NavItem[];
}

export default function Sidebar({ isOpen, onToggle, darkMode = false }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Topics']);

  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { 
      name: 'Topics', 
      href: '/topics', 
      icon: TagIcon,
      children: [
        { name: 'Machine Learning', href: '/topics/ml', icon: AcademicCapIcon },
        { name: 'Web Development', href: '/topics/web', icon: DocumentTextIcon },
        { name: 'Data Science', href: '/topics/data', icon: FolderIcon },
      ]
    },
    { name: 'Favorites', href: '/favorites', icon: BookmarkIcon, badge: 12 },
    { name: 'Notifications', href: '/notifications', icon: BellIcon, badge: 3 },
    { name: 'AI Suggestions', href: '/suggestions', icon: SparklesIcon },
  ];

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (item: NavItem) => {
    if (isActive(item.href)) return true;
    return item.children?.some(child => isActive(child.href)) || false;
  };

  const renderNavItem = (item: NavItem, isChild = false) => {
    const active = isActive(item.href);
    const parentActive = isParentActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);

    return (
      <div key={item.name}>
        <div className="relative">
          <Link
            href={item.href}
            onClick={(e) => {
              if (hasChildren) {
                e.preventDefault();
                toggleExpanded(item.name);
              }
            }}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg
              transition-all duration-200 group
              ${!isOpen && !isChild && 'justify-center'}
              ${isChild && 'pl-11'}
              ${active || parentActive
                ? darkMode
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                : darkMode
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-cyan-400'
                  : 'text-gray-700 hover:bg-cyan-50 hover:text-cyan-600'
              }
            `}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
            {isOpen && (
              <>
                <span className="font-medium flex-1">{item.name}</span>
                {item.badge && item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    active || parentActive
                      ? 'bg-white/20 text-white'
                      : darkMode
                        ? 'bg-cyan-500 text-white'
                        : 'bg-cyan-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {hasChildren && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleExpanded(item.name);
                    }}
                    className="p-1"
                  >
                    {isExpanded ? (
                      <ChevronUpIcon className="w-4 h-4" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                )}
              </>
            )}
          </Link>
          
          {/* Active indicator */}
          {(active || parentActive) && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full"></div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && isOpen && (
          <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {item.children!.map(child => renderNavItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          transition-all duration-300 ease-in-out
          ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
          border-r shadow-xl
          ${isOpen ? 'w-64' : 'w-0 lg:w-20'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className={`flex items-center justify-between h-16 px-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {isOpen && (
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent animate-in fade-in slide-in-from-left duration-300">
                AI Workspace
              </h1>
            )}
            <button
              onClick={onToggle}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all duration-200 transform hover:scale-110 ${!isOpen && 'mx-auto'}`}
              aria-label="Toggle sidebar"
            >
              {isOpen ? (
                <ChevronLeftIcon className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              ) : (
                <ChevronRightIcon className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            {navItems.map(item => renderNavItem(item))}
          </nav>

          {/* Footer */}
          {isOpen && (
            <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} animate-in fade-in slide-in-from-bottom duration-300`}>
              <div className={`text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                © 2024 AI Workspace
              </div>
              <div className={`text-xs text-center mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                v1.0.0
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
