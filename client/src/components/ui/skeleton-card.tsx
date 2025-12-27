export function SkeletonCard() {
  return (
    <div className="bg-gray-900/80 rounded-xl border border-gray-800 p-4 my-2 animate-pulse">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-4 w-24 rounded" />
        </div>
        <div className="skeleton h-3 w-16 rounded" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
      </div>
    </div>
  );
}

export function SkeletonCardList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function ZoneSidebarSkeleton() {
  return (
    <div className="p-3 space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          <div className="skeleton w-7 h-7 rounded-md" />
          <div className="skeleton h-4 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}
