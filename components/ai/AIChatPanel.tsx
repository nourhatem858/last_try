'use client';

import { useState, useRef, useEffect } from 'react';
import { useAI, AIConversation, AIMessage } from '@/contexts/AIProvider';
import {
  PaperAirplaneIcon,
  SparklesIcon,
  UserCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';

interface AIChatPanelProps {
  conversation: AIConversation | null;
  onDocumentClick?: (document: any) => void;
}

export default function AIChatPanel({ conversation, onDocumentClick }: AIChatPanelProps) {
  const { createConversation, addMessage, askAI, loading } = useAI();
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<AIMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation) {
      setLocalMessages(conversation.messages);
    } else {
      setLocalMessages([]);
    }
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Create conversation if none exists
    let currentConv = conversation;
    if (!currentConv) {
      currentConv = createConversation(userMessage.slice(0, 50) + '...');
    }

    // Add user message
    const userMsg: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, userMsg]);
    addMessage(currentConv.id, { role: 'user', content: userMessage });

    try {
      // Get AI response
      const aiResponse = await askAI(userMessage, currentConv.id);
      setLocalMessages((prev) => [...prev, aiResponse]);
      addMessage(currentConv.id, {
        role: 'assistant',
        content: aiResponse.content,
        sources: aiResponse.sources,
      });
    } catch (error) {
      console.error('AI response error:', error);
      const errorMsg: AIMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/20 bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
            <SparklesIcon className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {conversation?.title || 'New Conversation'}
            </h3>
            <p className="text-sm text-gray-400">AI Assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {localMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <SparklesIcon className="w-16 h-16 text-cyan-400 mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-2">
              Start a Conversation
            </h3>
            <p className="text-gray-400 max-w-md">
              Ask me anything about your workspace, documents, or notes. I can help you find information, summarize content, and more.
            </p>
          </div>
        ) : (
          <>
            {localMessages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/50">
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`
                    max-w-[80%] rounded-2xl p-4
                    ${message.role === 'user'
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-black/40 border border-cyan-500/20 text-gray-200'
                    }
                  `}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-cyan-500/20 space-y-2">
                      <p className="text-xs text-cyan-400 font-semibold mb-2">Sources:</p>
                      {message.sources.map((source, idx) => (
                        <button
                          key={idx}
                          onClick={() => onDocumentClick?.(source)}
                          className="
                            w-full text-left p-3 rounded-lg
                            bg-cyan-500/10 border border-cyan-500/20
                            hover:bg-cyan-500/20 hover:border-cyan-500/40
                            transition-all duration-200
                            group
                          "
                        >
                          <div className="flex items-start gap-2">
                            {source.type === 'document' && (
                              <DocumentTextIcon className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            )}
                            {source.type === 'note' && (
                              <ClipboardDocumentIcon className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            )}
                            {source.type === 'chat' && (
                              <ChatBubbleLeftIcon className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                                {source.title}
                              </p>
                              <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                                {source.excerpt}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/50">
                    <UserCircleIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/50">
                  <SparklesIcon className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-black/40 border border-cyan-500/20 rounded-2xl p-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-cyan-500/20 bg-black/40">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask AI anything..."
            rows={1}
            disabled={loading}
            className="
              flex-1 px-4 py-3 rounded-xl
              bg-black/60 border border-cyan-500/20
              text-white placeholder-gray-500
              focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
              transition-all duration-200
              resize-none
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="
              px-6 py-3 rounded-xl font-semibold
              bg-gradient-to-r from-cyan-500 to-blue-600
              text-white shadow-lg shadow-cyan-500/30
              hover:shadow-cyan-500/50 hover:scale-105
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              flex items-center gap-2
            "
          >
            <PaperAirplaneIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
