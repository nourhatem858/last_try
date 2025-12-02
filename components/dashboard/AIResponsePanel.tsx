'use client';

/**
 * AI Response Panel Component
 * Interactive AI assistant with chat interface
 */

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  SparklesIcon,
  PaperAirplaneIcon,
  DocumentIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedFiles?: string[];
}

interface AIResponsePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIResponsePanel({ isOpen, onClose }: AIResponsePanelProps) {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: isAuthenticated
        ? `Hello ${user?.name}! I'm your AI assistant. I can help you search through your documents, answer questions, and provide insights. What would you like to know?`
        : 'Hello! I can provide limited assistance. Please log in for full access to your workspace and documents.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: isAuthenticated
          ? `I understand you're asking about "${input}". Based on your workspace, I found relevant information in your documents. Here's what I can tell you:\n\n• This topic is covered in 3 of your documents\n• Last updated 2 days ago\n• Related to your "Project Planning" workspace\n\nWould you like me to open the related documents?`
          : 'Please log in to access full AI capabilities and search through your documents.',
        timestamp: new Date(),
        relatedFiles: isAuthenticated ? ['Document 1.pdf', 'Notes.md', 'Report.docx'] : undefined,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-gradient-to-b from-[#0D1B2A] to-black border-l border-cyan-500/20 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
            <SparklesIcon className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Assistant</h3>
            <p className="text-xs text-cyan-400">
              {isAuthenticated ? 'Full Access' : 'Limited Access'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[85%] rounded-2xl p-4
                ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-black/40 border border-cyan-500/20 text-gray-200'
                }
              `}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>

              {/* Related Files */}
              {message.relatedFiles && message.relatedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-cyan-400 font-semibold">Related Files:</p>
                  {message.relatedFiles.map((file, index) => (
                    <button
                      key={index}
                      className="
                        w-full flex items-center gap-2 p-2 rounded-lg
                        bg-cyan-500/10 border border-cyan-500/20
                        hover:bg-cyan-500/20 hover:border-cyan-500/40
                        transition-all duration-200 text-left
                      "
                    >
                      <DocumentIcon className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-cyan-300">{file}</span>
                    </button>
                  ))}
                </div>
              )}

              <p className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-black/40 border border-cyan-500/20 rounded-2xl p-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-cyan-500/20">
        {!isAuthenticated && (
          <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-xs text-yellow-400">
              🔒 Log in for full AI access and document search
            </p>
          </div>
        )}
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isAuthenticated
                ? 'Ask anything about your workspace...'
                : 'Limited access - log in for more'
            }
            rows={3}
            className="
              w-full px-4 py-3 pr-12 rounded-xl resize-none
              bg-black/40 border border-cyan-500/20
              text-white placeholder-gray-500
              focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
              transition-all duration-200
            "
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="
              absolute bottom-3 right-3 p-2 rounded-lg
              bg-gradient-to-br from-cyan-500 to-blue-600
              text-white shadow-lg shadow-cyan-500/30
              hover:shadow-cyan-500/50 hover:scale-110
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              transition-all duration-200
            "
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
