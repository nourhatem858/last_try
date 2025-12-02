'use client';

/**
 * Analytics Insights Component
 * Display user insights and activity patterns
 */

import { useState, useEffect } from 'react';
import { AnalyticsService, AnalyticsInsight } from '@/lib/analytics-service';
import {
  ChartBarIcon,
  FireIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

export default function AnalyticsInsights() {
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = () => {
    setLoading(true);
    try {
      // Get activities from localStorage
      const stored = localStorage.getItem('user_activities');
      const activities = stored ? JSON.parse(stored) : [];

      // Generate insights
      const generatedInsights = AnalyticsService.generateInsights(activities);
      setInsights(generatedInsights);

      // Get statistics
      const statistics = AnalyticsService.getStatistics(activities);
      setStats(statistics);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return ChartBarIcon;
      case 'recommendation':
        return LightBulbIcon;
      case 'alert':
        return ExclamationTriangleIcon;
      case 'achievement':
        return TrophyIcon;
      default:
        return ChartBarIcon;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend':
        return 'from-blue-500 to-cyan-600';
      case 'recommendation':
        return 'from-purple-500 to-pink-600';
      case 'alert':
        return 'from-orange-500 to-red-600';
      case 'achievement':
        return 'from-yellow-500 to-orange-600';
      default:
        return 'from-cyan-500 to-blue-600';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-500/20 text-red-400 border-red-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

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

  if (insights.length === 0 && !stats) {
    return (
      <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6">
        <div className="text-center py-8">
          <ChartBarIcon className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Start using the workspace to see insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      {stats && (
        <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <ChartBarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Your Activity</h3>
              <p className="text-sm text-gray-400">Usage statistics and patterns</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Total Actions</p>
              <p className="text-2xl font-bold text-white">{stats.totalActions}</p>
            </div>
            <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Active Days</p>
              <p className="text-2xl font-bold text-white">{stats.uniqueDays}</p>
            </div>
            <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Top Action</p>
              <p className="text-lg font-bold text-cyan-400">
                {stats.topActions[0]?.action.replace(/-/g, ' ') || 'N/A'}
              </p>
            </div>
            <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Most Active</p>
              <p className="text-sm font-bold text-white">
                {new Date(stats.mostActiveDay).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <LightBulbIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Insights</h3>
              <p className="text-sm text-gray-400">Personalized recommendations</p>
            </div>
          </div>

          <div className="space-y-3">
            {insights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type);
              return (
                <div
                  key={index}
                  className="
                    group bg-black/40 border border-cyan-500/20
                    rounded-xl p-4
                    hover:border-cyan-500/40 hover:bg-black/60
                    transition-all duration-300
                    relative overflow-hidden
                  "
                >
                  {/* Background gradient */}
                  <div
                    className={`
                      absolute inset-0 bg-gradient-to-br ${getInsightColor(insight.type)}
                      opacity-0 group-hover:opacity-10 transition-opacity duration-300
                    `}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`
                        w-12 h-12 rounded-lg bg-gradient-to-br ${getInsightColor(insight.type)}
                        flex items-center justify-center flex-shrink-0
                        shadow-lg group-hover:shadow-xl group-hover:scale-110
                        transition-all duration-300
                      `}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors">
                          {insight.title}
                        </h4>
                        <span
                          className={`
                            text-xs px-2 py-1 rounded border flex-shrink-0
                            ${getPriorityBadge(insight.priority)}
                          `}
                        >
                          {insight.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
