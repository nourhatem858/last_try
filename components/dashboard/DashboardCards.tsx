'use client';

/**
 * Dashboard Cards Component
 * Overview cards with stats and glowing effects
 */

import {
  FolderIcon,
  DocumentTextIcon,
  DocumentIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

interface DashboardStat {
  name: string;
  value: number;
  icon: any;
  color: string;
  gradient: string;
  change?: string;
  trend?: 'up' | 'down';
}

interface DashboardCardsProps {
  stats: {
    workspaces: number;
    notes: number;
    documents: number;
    aiChats: number;
  };
}

export default function DashboardCards({ stats }: DashboardCardsProps) {
  const cards: DashboardStat[] = [
    {
      name: 'Workspaces',
      value: stats.workspaces,
      icon: FolderIcon,
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-600',
      change: '+12%',
      trend: 'up',
    },
    {
      name: 'Notes',
      value: stats.notes,
      icon: DocumentTextIcon,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-600',
      change: '+8%',
      trend: 'up',
    },
    {
      name: 'Documents',
      value: stats.documents,
      icon: DocumentIcon,
      color: 'green',
      gradient: 'from-green-500 to-emerald-600',
      change: '+5%',
      trend: 'up',
    },
    {
      name: 'AI Chats',
      value: stats.aiChats,
      icon: ChatBubbleLeftRightIcon,
      color: 'orange',
      gradient: 'from-orange-500 to-red-600',
      change: '+15%',
      trend: 'up',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.name}
            className="
              group relative bg-gradient-to-br from-[#0D1B2A] to-black
              border border-cyan-500/20 rounded-2xl p-6
              hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/20
              transition-all duration-300 cursor-pointer overflow-hidden
            "
          >
            {/* Glowing background effect */}
            <div
              className={`
                absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0
                group-hover:opacity-10 transition-opacity duration-300
              `}
            />

            {/* Animated border glow */}
            <div
              className={`
                absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                transition-opacity duration-300
                bg-gradient-to-r ${card.gradient} blur-xl -z-10
              `}
              style={{ transform: 'scale(1.05)' }}
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div
                className={`
                  w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient}
                  flex items-center justify-center mb-4
                  shadow-lg shadow-${card.color}-500/30
                  group-hover:shadow-${card.color}-500/50 group-hover:scale-110
                  transition-all duration-300
                `}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>

              {/* Stats */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
                  {card.name}
                </p>
                <div className="flex items-end justify-between">
                  <h3
                    className={`
                      text-4xl font-bold bg-gradient-to-r ${card.gradient}
                      bg-clip-text text-transparent
                      group-hover:scale-105 transition-transform duration-300
                    `}
                  >
                    {card.value || 0}
                  </h3>
                  {card.change && (
                    <div className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                      <ArrowTrendingUpIcon className="w-4 h-4" />
                      <span>{card.change}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${card.gradient} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: '75%' }}
                />
              </div>
            </div>

            {/* Hover shine effect */}
            <div
              className="
                absolute inset-0 opacity-0 group-hover:opacity-100
                bg-gradient-to-r from-transparent via-white/5 to-transparent
                -translate-x-full group-hover:translate-x-full
                transition-all duration-1000
              "
            />
          </div>
        );
      })}
    </div>
  );
}
