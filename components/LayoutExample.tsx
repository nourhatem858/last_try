/**
 * Layout Example - Shows how to use Toolbar and Sidebar together
 * This is a complete example of integrating both components
 */

'use client';

import { useState, useEffect } from 'react';
import Toolbar from './Toolbar';
import Sidebar from './Sidebar';

interface LayoutExampleProps {
  children: React.ReactNode;
}

export default function LayoutExample({ children }: LayoutExampleProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle search
  const handleSearch = async (query: string) => {
    console.log('Searching for:', query);
    
    // Example: Call your search API
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const results = await response.json();
      console.log('Search results:', results);
      
      // Navigate to search results page or update state
      // router.push(`/search?q=${query}`);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Toolbar */}
      <Toolbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onSearch={handleSearch}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        darkMode={darkMode}
      />

      {/* Main Content */}
      <main
        className={`
          transition-all duration-300 pt-16
          ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
          ${darkMode ? 'text-gray-100' : 'text-gray-900'}
        `}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
