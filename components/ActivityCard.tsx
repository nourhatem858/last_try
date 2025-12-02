/**
 * Activity Card - Display user activity item
 */

'use client';

import { ClockIcon, BookmarkIcon, HeartIcon } from '@heroicons/react/24/outline';

interface ActivityCardProps {
  activity: {
    id: string;
    title: string;
    type: 'viewed' | 'bookmarked' | 'liked';
    timestamp: string;
    category?: string;
  };
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const getIcon = () => {
    switch (activity.type) {
      case 'viewed':
        return <ClockIcon className="w-5 h-5" />;
      case 'bookmarked':
        return <BookmarkIcon className="w-5 h-5" />;
      case 'liked':
        return <HeartIcon className="w-5 h-5" />;
    }
  };

  const getColor = () => {
    switch (activity.type) {
      case 'viewed':
        return 'from-cyan-500 to-blue-500';
      case 'bookmarked':
        return 'from-purple-500 to-pink-500';
      case 'liked':
        return 'from-red-500 to-orange-500';
    }
  };

  const getLabel = () => {
    switch (activity.type) {
      case 'viewed':
        return 'Viewed';
      case 'bookmarked':
        return 'Bookmarked';
      case 'liked':
        return 'Liked';
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group cursor-pointer">
      <div className={`p-2 rounded-lg bg-gradient-to-r ${getColor()} flex-shrink-0`}>
        {getIcon()}
        <span className="sr-only">{getLabel()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
          {activity.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {activity.category && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {activity.category}
            </span>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500">
            • {activity.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
}
