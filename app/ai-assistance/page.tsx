'use client';

/**
 * AI Assistance Page
 * Comprehensive AI-powered search, chat, and document assistance
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SidebarNav from '@/components/dashboard/SidebarNav';
import TopNavbar from '@/components/dashboard/TopNavbar';
import AIChatPanel from '@/components/ai/AIChatPanel';
import SearchResults from '@/components/ai/SearchResults';
import DocumentViewer from '@/components/ai/DocumentViewer';
import ConversationsList from '@/components/ai/ConversationsList';
import { useAI } from '@/contexts/AIProvider';
import {
  SparklesIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

export default function AIAssistancePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { conversations, currentConversation, setCurrentConversation, fetchConversations } = useAI();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'search' | 'documents'>('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch conversations on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, fetchConversations]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setSearchQuery(query);
    setActiveTab('search');
    // Search will be handled by SearchResults component
  };

  const handleDocumentClick = (document: any) => {
    setSelectedDocument(document);
    setShowDocumentViewer(true);
  };

  const handleConversationSelect = (conversation: any) => {
    setCurrentConversation(conversation);
    setActiveTab('chat');
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full" />
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
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <SparklesIcon className="w-6 h-6 text-white animate-pulse" />
                </div>
                <h1 className="text-4xl font-bold text-white">AI Assistance</h1>
              </div>
              <p className="text-gray-400">
                Search, chat, and get AI-powered insights from your workspace
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="Ask AI anything or search your workspace..."
              className="
                w-full pl-14 pr-4 py-4 rounded-xl
                bg-gradient-to-br from-[#0D1B2A] to-black
                border border-cyan-500/30
                text-white placeholder-gray-500 text-lg
                focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                transition-all duration-200
                shadow-lg shadow-cyan-500/10
              "
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              className="
                absolute right-2 top-1/2 -translate-y-1/2
                px-6 py-2 rounded-lg
                bg-gradient-to-r from-cyan-500 to-blue-600
                text-white font-semibold
                hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105
                transition-all duration-200
              "
            >
              Search
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-t-xl font-semibold
                transition-all duration-200
                ${activeTab === 'chat'
                  ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-b-2 border-cyan-500 text-cyan-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span>AI Chat</span>
              {conversations.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                  {conversations.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-t-xl font-semibold
                transition-all duration-200
                ${activeTab === 'search'
                  ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-b-2 border-cyan-500 text-cyan-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              <span>Search Results</span>
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-t-xl font-semibold
                transition-all duration-200
                ${activeTab === 'documents'
                  ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-b-2 border-cyan-500 text-cyan-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span>Documents</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'chat' && (
                <AIChatPanel
                  conversation={currentConversation}
                  onDocumentClick={handleDocumentClick}
                />
              )}

              {activeTab === 'search' && (
                <SearchResults
                  query={searchQuery}
                  onDocumentClick={handleDocumentClick}
                  onChatClick={handleConversationSelect}
                />
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-8 text-center">
                    <FolderIcon className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Your Documents
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Browse and search through all your workspace documents
                    </p>
                    <button
                      onClick={() => router.push('/documents')}
                      className="
                        px-6 py-3 rounded-xl font-semibold
                        bg-gradient-to-r from-cyan-500 to-blue-600
                        text-white shadow-lg shadow-cyan-500/30
                        hover:shadow-cyan-500/50 hover:scale-105
                        transition-all duration-200
                      "
                    >
                      View All Documents
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Conversations List */}
            <div className="lg:col-span-1">
              <ConversationsList
                conversations={conversations}
                currentConversation={currentConversation}
                onSelect={handleConversationSelect}
              />
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/50">
                <SparklesIcon className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">AI Capabilities</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Search across all your notes, documents, and chats
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Get instant answers from your workspace content
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Discover related documents and connections
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Summarize long documents and conversations
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Document Viewer Modal */}
      {showDocumentViewer && selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => {
            setShowDocumentViewer(false);
            setSelectedDocument(null);
          }}
        />
      )}
    </div>
  );
}
