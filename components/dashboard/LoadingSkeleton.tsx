'use client';

/**
 * Loading Skeleton Component
 * Animated loading placeholders
 */

export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6"
          >
            <div className="w-14 h-14 bg-cyan-500/20 rounded-xl mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-cyan-500/20 rounded w-1/2" />
              <div className="h-8 bg-cyan-500/20 rounded w-3/4" />
              <div className="h-1 bg-cyan-500/20 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6">
        <div className="h-8 bg-cyan-500/20 rounded w-1/4 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-black/40 border border-cyan-500/20 rounded-xl p-5">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg mb-3" />
              <div className="h-5 bg-cyan-500/20 rounded w-3/4 mb-2" />
              <div className="h-4 bg-cyan-500/20 rounded w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Skeleton */}
      <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6">
        <div className="h-8 bg-cyan-500/20 rounded w-1/3 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-black/40 border border-cyan-500/20 rounded-xl"
            >
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-cyan-500/20 rounded w-3/4" />
                <div className="h-3 bg-cyan-500/20 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
