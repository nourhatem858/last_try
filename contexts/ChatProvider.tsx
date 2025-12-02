'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Chat {
  id: string;
  title: string;
  type: 'direct' | 'group';
  participants: Array<{ id: string; name: string; avatar: string | null }>;
  lastMessage: {
    text: string;
    sender: string;
    timestamp: string;
  } | null;
  unreadCount: number;
  workspace: string | null;
  workspaceId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ChatContextType {
  chats: Chat[];
  loading: boolean;
  error: string | null;
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  deleteChat: (id: string) => void;
  fetchChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/chats', {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      });
      if (response.ok) {
        const data = await response.json();
        setChats(data.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addChat = useCallback((chat: Chat) => {
    setChats((prev) => [chat, ...prev]);
  }, []);

  const updateChat = useCallback((id: string, updates: Partial<Chat>) => {
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteChat = useCallback((id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <ChatContext.Provider value={{ chats, loading, error, setChats, addChat, updateChat, deleteChat, fetchChats }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
}
