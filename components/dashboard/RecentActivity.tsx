'use client';

/**
 * Recent Activity Component
 * Shows recent user activity and updates
 */

import {
  DocumentTextIcon,
  DocumentIcon,
  FolderIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  type: 'note' | 'document' | 'workspace';
  title: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'note':
        return DocumentTextIcon;
      case 'document':
        return DocumentIcon;
      case 'workspace':
        return FolderIcon;
      default:
        return DocumentIcon;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'note':
        return 'from-purple-500 to-pink-600';
      case 'document':
        return 'from-green-500 to-emerald-600';
      case 'workspace':
        return 'from-cyan-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
          <p className="text-sm text-gray-400 mt-1">Your latest updates</p>
        </div>
        <ClockIcon className="w-8 h-8 text-cyan-400" />
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = getIcon(activity.type);
            const gradient = getColor(activity.type);

            return (
              <div
                key={activity.id}
                className="
                  group flex items-center gap-4 p-4 rounded-xl
                  bg-black/40 border border-cyan-500/20
                  hover:border-cyan-500/40 hover:bg-black/60
                  transition-all duration-200 cursor-pointer
                "
              >
                <div
                  className={`
                    w-12 h-12 rounded-lg bg-gradient-to-br ${gradient}
                    flex items-center justify-center flex-shrink-0
                    shadow-lg group-hover:scale-110 transition-transform duration-200
                  `}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                    {activity.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
