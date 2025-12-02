/**
 * Toolbar Component - Enhanced with live search suggestions, notifications, and dark mode
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  MoonIcon,
  SunIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

interface ToolbarProps {
  onMenuClick: () => void;
  onSearch: (query: string) => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'card' | 'topic' | 'user';
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function Toolbar({ onMenuClick, onSearch, darkMode = false, onToggleDarkMode }: ToolbarProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'New Card Added', message: 'AI Fundamentals card was created', time: '5m ago', read: false },
    { id: '2', title: 'Comment Reply', message: 'Someone replied to your comment', time: '1h ago', read: false },
    { id: '3', title: 'Weekly Summary', message: 'Your learning progress this week', time: '2h ago', read: true },
  ]);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Simulate live search suggestions
  useEffect(() => {
    if (searchQuery.length > 1) {
      const timer = setTimeout(() => {
        // Simulate API call for suggestions
        const mockSuggestions: SearchSuggestion[] = [
          { id: '1', title: `${searchQuery} - Machine Learning Basics`, type: 'card' },
          { id: '2', title: `${searchQuery} - Neural Networks`, type: 'card' },
          { id: '3', title: `Topic: ${searchQuery}`, type: 'topic' },
        ];
        setSuggestions(mockSuggestions);
        setShowSuggestions(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.title);
    onSearch(suggestion.title);
    setShowSuggestions(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  return (
    <header className={`sticky top-0 z-30 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm transition-colors duration-200`}>
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Menu Button */}
        <button
          onClick={onMenuClick}
          className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all duration-200 lg:hidden transform hover:scale-105`}
          aria-label="Toggle menu"
        >
          <Bars3Icon className={`w-6 h-6 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} />
        </button>

        {/* Center: Search Bar with Live Suggestions */}
        <div className="flex-1 max-w-2xl mx-4" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                placeholder="Search knowledge cards, topics..."
                className={`w-full pl-10 pr-10 py-2.5 rounded-lg transition-all duration-200
                  ${darkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 focus:bg-gray-750' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }
                  border focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                  hover:shadow-md`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className={`absolute top-full mt-2 w-full ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-xl border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-cyan-50'} transition-colors duration-150`}
                  >
                    <MagnifyingGlassIcon className="w-4 h-4 text-cyan-500" />
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {suggestion.title}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {suggestion.type === 'card' ? 'Knowledge Card' : suggestion.type === 'topic' ? 'Topic' : 'User'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Dark Mode Toggle */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all duration-200 transform hover:scale-105`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <SunIcon className="w-5 h-5 text-yellow-400" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          )}

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all duration-200 transform hover:scale-105`}
              aria-label="Notifications"
            >
              <BellIcon className={`w-6 h-6 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-xl border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}>
                <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <BellIcon className={`w-12 h-12 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`w-full px-4 py-3 text-left border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} transition-colors ${!notification.read ? (darkMode ? 'bg-gray-750' : 'bg-cyan-50/50') : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                              {notification.title}
                            </p>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {notification.message}
                            </p>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 mt-1 bg-cyan-500 rounded-full"></div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center gap-2 p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all duration-200 transform hover:scale-105`}
              aria-label="User menu"
            >
              <UserCircleIcon className={`w-6 h-6 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} />
              {user && (
                <span className={`hidden md:block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  {user.name}
                </span>
              )}
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className={`absolute right-0 mt-2 w-56 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-xl border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}>
                <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {user?.name || 'User Name'}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                <div className="py-1">
                  <a
                    href="/profile"
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} transition-colors`}
                  >
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </a>
                  <a
                    href="/settings"
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} transition-colors`}
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                    Settings
                  </a>
                </div>
                <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} py-1`}>
                  <button
                    onClick={logout}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
