'use client';

import { AIConversation } from '@/contexts/AIProvider';
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAI } from '@/contexts/AIProvider';

interface ConversationsListProps {
  conversations: AIConversation[];
  currentConversation: AIConversation | null;
  onSelect: (conversation: AIConversation) => void;
}

export default function ConversationsList({
  conversations,
  currentConversation,
  onSelect,
}: ConversationsListProps) {
  const { createConversation } = useAI();

  const handleNewConversation = () => {
    const newConv = createConversation('New Conversation');
    onSelect(newConv);
  };

  return (
    <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/20 bg-black/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Conversations</h3>
          </div>
          <button
            onClick={handleNewConversation}
            className="
              p-2 rounded-lg
              bg-gradient-to-r from-cyan-500 to-blue-600
              text-white shadow-lg shadow-cyan-500/30
              hover:shadow-cyan-500/50 hover:scale-105
              transition-all duration-200
            "
            title="New Conversation"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="max-h-[500px] overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <SparklesIcon className="w-12 h-12 mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400 text-sm">
              No conversations yet. Start a new one!
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation)}
                className={`
                  w-full text-left p-4 rounded-xl
                  transition-all duration-200
                  ${currentConversation?.id === conversation.id
                    ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
                    : 'bg-black/20 border border-cyan-500/10 hover:bg-black/40 hover:border-cyan-500/30'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg
                    ${currentConversation?.id === conversation.id
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/50'
                      : 'bg-gradient-to-br from-gray-700 to-gray-800'
                    }
                  `}>
                    <SparklesIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`
                      font-semibold truncate mb-1
                      ${currentConversation?.id === conversation.id
                        ? 'text-cyan-400'
                        : 'text-white'
                      }
                    `}>
                      {conversation.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <ClockIcon className="w-3 h-3" />
                      <span>{new Date(conversation.updatedAt).toLocaleDateString()}</span>
                      {conversation.messages.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{conversation.messages.length} messages</span>
                        </>
                      )}
                    </div>
                    {conversation.messages.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {conversation.messages[conversation.messages.length - 1].content}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
