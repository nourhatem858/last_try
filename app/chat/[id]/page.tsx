'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SidebarNav from '@/components/dashboard/SidebarNav';
import TopNavbar from '@/components/dashboard/TopNavbar';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

interface Message {
  sender: string;
  senderName: string;
  senderEmail: string;
  content: string;
  type: string;
  timestamp: string;
  metadata?: any;
}

interface ChatData {
  id: string;
  title: string;
  workspace: string | null;
  workspaceId: string | null;
  isAIConversation: boolean;
  messages: Message[];
  context: any;
  contextResources: any;
  lastMessageAt: string;
  createdAt: string;
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { isAuthenticated, loading: authLoading, token } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chat, setChat] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState<string>('');

  useEffect(() => {
    Promise.resolve(params).then((resolvedParams) => {
      console.log("💬 Loading chat page for ID:", resolvedParams.id);
      setChatId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && token && chatId) {
      fetchChat();
    }
  }, [isAuthenticated, token, chatId]);

  const fetchChat = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/chats/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        setChat(data.chat);
      } else if (response.status === 404) {
        setError('Chat not found');
      } else {
        setError('Failed to load chat');
      }
    } catch (err) {
      console.error('Fetch chat error:', err);
      setError('An error occurred while loading chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    try {
      setSending(true);
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: message.trim() }),
      });

      if (response.ok) {
        setMessage('');
        await fetchChat();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      console.error('Send message error:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black">
        <SidebarNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="lg:pl-64">
          <TopNavbar />
          <main className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-cyan-500/20 rounded-lg w-1/3" />
              <div className="h-96 bg-cyan-500/20 rounded-2xl" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error && !chat) {
    return (
      <div className="min-h-screen bg-black">
        <SidebarNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="lg:pl-64">
          <TopNavbar />
          <main className="p-6">
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-600/20 flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Chat not found</h3>
              <p className="text-gray-400 mb-6">The chat you're looking for doesn't exist or you don't have access to it.</p>
              <button
                onClick={() => router.push('/chat')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back to Chats</span>
              </button>
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/chat')}
              className="p-2 rounded-lg bg-black/40 border border-cyan-500/20 text-cyan-400 hover:border-cyan-500/40 transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white">{chat?.title}</h1>
              {chat?.workspace && (
                <p className="text-gray-400 mt-1">Workspace: {chat.workspace}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              {error}
            </div>
          )}

          <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6 min-h-[500px] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-6">
              {chat?.messages && chat.messages.length > 0 ? (
                chat.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-4 rounded-2xl ${
                        msg.type === 'user'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                          : 'bg-black/40 border border-cyan-500/20 text-gray-200'
                      }`}
                    >
                      <p className="text-xs font-semibold opacity-80 mb-1">
                        {msg.senderName}
                      </p>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {new Date(msg.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <ChatBubbleLeftRightIcon className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                  <p className="text-gray-400">No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sending}
                className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-cyan-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!message.trim() || sending}
                className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
