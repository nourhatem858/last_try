'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Array<{
    type: 'note' | 'document' | 'chat';
    id: string;
    title: string;
    excerpt: string;
  }>;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

interface AIContextType {
  conversations: AIConversation[];
  currentConversation: AIConversation | null;
  loading: boolean;
  error: string | null;
  setConversations: (conversations: AIConversation[]) => void;
  setCurrentConversation: (conversation: AIConversation | null) => void;
  createConversation: (title: string) => AIConversation;
  addMessage: (conversationId: string, message: Omit<AIMessage, 'id' | 'timestamp'>) => void;
  askAI: (question: string, conversationId?: string) => Promise<AIMessage>;
  searchContent: (query: string) => Promise<any>;
  fetchConversations: () => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<AIConversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/ai/conversations', {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createConversation = useCallback((title: string): AIConversation => {
    const newConversation: AIConversation = {
      id: Date.now().toString(),
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
    return newConversation;
  }, []);

  const addMessage = useCallback((conversationId: string, message: Omit<AIMessage, 'id' | 'timestamp'>) => {
    const newMessage: AIMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, newMessage], updatedAt: new Date().toISOString() }
          : conv
      )
    );

    if (currentConversation?.id === conversationId) {
      setCurrentConversation((prev) =>
        prev ? { ...prev, messages: [...prev.messages, newMessage] } : null
      );
    }
  }, [currentConversation]);

  const askAI = useCallback(async (question: string, conversationId?: string): Promise<AIMessage> => {
    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ question, conversationId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiMessage: AIMessage = {
        id: data.data.id || Date.now().toString(),
        role: 'assistant',
        content: data.data.content,
        timestamp: new Date().toISOString(),
        sources: data.data.sources || [],
      };

      return aiMessage;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchContent = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      });
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      throw new Error('Search failed');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AIContext.Provider
      value={{
        conversations,
        currentConversation,
        loading,
        error,
        setConversations,
        setCurrentConversation,
        createConversation,
        addMessage,
        askAI,
        searchContent,
        fetchConversations,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) throw new Error('useAI must be used within AIProvider');
  return context;
}
