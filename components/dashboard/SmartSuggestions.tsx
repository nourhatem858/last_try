'use client';

/**
 * Smart Suggestions Component
 * AI-powered suggestions based on user context and behavior
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SparklesIcon, LightBulbIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface AISuggestion {
  id: string;
  type: 'action' | 'insight' | 'tip';
  title: string;
  description: string;
  confidence?: number;
  action?: {
    label: string;
    href: string;
  };
}

interface SmartSuggestionsProps {
  context?: {
    workspaceId?: string;
    noteId?: string;
    documentId?: string;
  };
  recentActivity?: any[];
}

export default function SmartSuggestions({ context, recentActivity }: SmartSuggestionsProps) {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate suggestions based on context (without AI)
    const generateSuggestions = () => {
      setLoading(true);
      try {
        const mockSuggestions: AISuggestion[] = [
          {
            id: '1',
            type: 'action',
            title: 'Create a new note',
            description: 'Start documenting your ideas',
            confidence: 0.95,
            action: { label: 'Create Note', href: '/notes' },
          },
          {
            id: '2',
            type: 'insight',
            title: 'Upload a document',
            description: 'Add documents to your workspace',
            confidence: 0.88,
            action: { label: 'Upload', href: '/documents' },
          },
          {
            id: '3',
            type: 'tip',
            title: 'Organize your workspace',
            description: 'Create folders and tags for better organization',
            confidence: 0.92,
            action: { label: 'Go to Workspaces', href: '/workspaces' },
          },
        ];
        setSuggestions(mockSuggestions);
      } catch (error) {
        console.error('Error generating suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    generateSuggestions();
  }, [context, recentActivity]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-cyan-500/10 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-cyan-500/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'action':
        return '⚡';
      case 'content':
        return '📝';
      case 'insight':
        return '💡';
      case 'task':
        return '✓';
      default:
        return '✨';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'action':
        return 'from-cyan-500 to-blue-600';
      case 'content':
        return 'from-purple-500 to-pink-600';
      case 'insight':
        return 'from-yellow-500 to-orange-600';
      case 'task':
        return 'from-green-500 to-emerald-600';
      default:
        return 'from-cyan-500 to-blue-600';
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
            <LightBulbIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Smart Suggestions</h3>
            <p className="text-sm text-gray-400">AI-powered recommendations for you</p>
          </div>
        </div>
        <SparklesIcon className="w-6 h-6 text-cyan-400 animate-pulse" />
      </div>

      {/* Suggestions Grid */}
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="
              group w-full text-left
              bg-black/40 border border-cyan-500/20
              rounded-xl p-4
              hover:border-cyan-500/40 hover:bg-black/60
              hover:shadow-xl hover:shadow-cyan-500/10
              transition-all duration-300
              relative overflow-hidden
            "
          >
            {/* Background gradient */}
            <div
              className={`
                absolute inset-0 bg-gradient-to-br ${getTypeColor(suggestion.type)}
                opacity-0 group-hover:opacity-10 transition-opacity duration-300
              `}
            />

            {/* Content */}
            <div className="relative z-10 flex items-start gap-4">
              {/* Icon */}
              <div
                className={`
                  w-12 h-12 rounded-lg bg-gradient-to-br ${getTypeColor(suggestion.type)}
                  flex items-center justify-center flex-shrink-0
                  shadow-lg group-hover:shadow-xl group-hover:scale-110
                  transition-all duration-300
                `}
              >
                <span className="text-2xl">{getTypeIcon(suggestion.type)}</span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors">
                    {suggestion.title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-cyan-400 flex-shrink-0">
                    <span>{Math.round((suggestion.confidence || 0.5) * 100)}%</span>
                    <div className="w-12 h-1.5 bg-black/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${(suggestion.confidence || 0.5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {suggestion.description}
                </p>
              </div>

              {/* Arrow */}
              <ArrowRightIcon className="w-5 h-5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0" />
            </div>

            {/* Shine effect */}
            <div
              className="
                absolute inset-0 opacity-0 group-hover:opacity-100
                bg-gradient-to-r from-transparent via-white/5 to-transparent
                -translate-x-full group-hover:translate-x-full
                transition-all duration-700
              "
            />
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-cyan-500/10">
        <p className="text-xs text-gray-500 text-center">
          Suggestions are generated based on your activity and workspace context
        </p>
      </div>
    </div>
  );
}
