'use client';

/**
 * Quick Actions Component
 * Quick action buttons for common tasks
 */

import {
  PlusCircleIcon,
  DocumentPlusIcon,
  FolderPlusIcon,
  ChatBubbleLeftIcon,
  ArrowUpTrayIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface QuickAction {
  name: string;
  description: string;
  icon: any;
  gradient: string;
  action: () => void;
}

export default function QuickActions() {
  const actions: QuickAction[] = [
    {
      name: 'Create Note',
      description: 'Start a new note',
      icon: DocumentPlusIcon,
      gradient: 'from-cyan-500 to-blue-600',
      action: () => console.log('Create note'),
    },
    {
      name: 'Upload Document',
      description: 'Add files to workspace',
      icon: ArrowUpTrayIcon,
      gradient: 'from-purple-500 to-pink-600',
      action: () => console.log('Upload document'),
    },
    {
      name: 'New Workspace',
      description: 'Create a workspace',
      icon: FolderPlusIcon,
      gradient: 'from-green-500 to-emerald-600',
      action: () => console.log('New workspace'),
    },
    {
      name: 'Start Chat',
      description: 'Begin AI conversation',
      icon: ChatBubbleLeftIcon,
      gradient: 'from-orange-500 to-red-600',
      action: () => console.log('Start chat'),
    },
    {
      name: 'Ask AI',
      description: 'Get instant answers',
      icon: SparklesIcon,
      gradient: 'from-yellow-500 to-orange-600',
      action: () => console.log('Ask AI'),
    },
    {
      name: 'Quick Add',
      description: 'Add anything quickly',
      icon: PlusCircleIcon,
      gradient: 'from-blue-500 to-indigo-600',
      action: () => console.log('Quick add'),
    },
  ];

  return (
    <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
          <p className="text-sm text-gray-400 mt-1">Get started with common tasks</p>
        </div>
        <SparklesIcon className="w-8 h-8 text-cyan-400 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.name}
              onClick={action.action}
              className="
                group relative bg-black/40 border border-cyan-500/20
                rounded-xl p-5 text-left
                hover:border-cyan-500/40 hover:bg-black/60
                hover:shadow-xl hover:shadow-cyan-500/10
                transition-all duration-300 overflow-hidden
              "
            >
              {/* Glowing background */}
              <div
                className={`
                  absolute inset-0 bg-gradient-to-br ${action.gradient}
                  opacity-0 group-hover:opacity-10 transition-opacity duration-300
                `}
              />

              {/* Content */}
              <div className="relative z-10">
                <div
                  className={`
                    w-12 h-12 rounded-lg bg-gradient-to-br ${action.gradient}
                    flex items-center justify-center mb-3
                    shadow-lg group-hover:shadow-xl group-hover:scale-110
                    transition-all duration-300
                  `}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                  {action.name}
                </h3>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {action.description}
                </p>
              </div>

              {/* Hover shine effect */}
              <div
                className="
                  absolute inset-0 opacity-0 group-hover:opacity-100
                  bg-gradient-to-r from-transparent via-white/5 to-transparent
                  -translate-x-full group-hover:translate-x-full
                  transition-all duration-700
                "
              />

              {/* Arrow indicator */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  className="w-5 h-5 text-cyan-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
