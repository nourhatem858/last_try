/**
 * Loading Skeleton Component - Reusable loading states with shimmer effect
 */

'use client';

interface LoadingSkeletonProps {
  variant?: 'card' | 'profile' | 'notification' | 'list' | 'text';
  count?: number;
  className?: string;
}

export default function LoadingSkeleton({ 
  variant = 'card', 
  count = 1,
  className = '' 
}: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count });

  return (
    <div className={className}>
      {skeletons.map((_, index) => (
        <div key={index} className="mb-4 last:mb-0">
          {variant === 'card' && <CardSkeleton />}
          {variant === 'profile' && <ProfileSkeleton />}
          {variant === 'notification' && <NotificationSkeleton />}
          {variant === 'list' && <ListSkeleton />}
          {variant === 'text' && <TextSkeleton />}
        </div>
      ))}
    </div>
  );
}

// Card Skeleton - For Knowledge Cards
function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-3/4 mb-2 shimmer" />
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-1/2 shimmer" />
        </div>
        <div className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg shimmer" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-full shimmer" />
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-5/6 shimmer" />
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-4/6 shimmer" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full w-20 shimmer" />
        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full w-24 shimmer" />
      </div>
    </div>
  );
}

// Profile Skeleton
function ProfileSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full shimmer" />
        <div className="flex-1">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-1/2 mb-2 shimmer" />
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-3/4 shimmer" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-full shimmer" />
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-5/6 shimmer" />
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-4/6 shimmer" />
      </div>
    </div>
  );
}

// Notification Skeleton
function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 animate-pulse">
      <div className="w-9 h-9 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg flex-shrink-0 shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-3/4 shimmer" />
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-full shimmer" />
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-1/4 shimmer" />
      </div>
    </div>
  );
}

// List Skeleton
function ListSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-2/3 shimmer" />
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-1/2 shimmer" />
        </div>
      </div>
    </div>
  );
}

// Text Skeleton
function TextSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-full shimmer" />
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-5/6 shimmer" />
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-4/6 shimmer" />
    </div>
  );
}

// Grid of Loading Cards
export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
