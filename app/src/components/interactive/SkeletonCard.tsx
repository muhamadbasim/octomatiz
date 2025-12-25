export function SkeletonCard() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="flex gap-4">
        {/* Thumbnail skeleton */}
        <div className="w-20 h-20 shrink-0 rounded-lg bg-white/10" />
        
        {/* Content skeleton */}
        <div className="flex flex-col flex-1 justify-center gap-2">
          <div className="h-4 w-16 rounded-full bg-white/10" />
          <div className="h-5 w-32 rounded bg-white/10" />
          <div className="h-3 w-24 rounded bg-white/5" />
        </div>
      </div>
      
      {/* Action skeleton */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="h-9 w-full rounded-full bg-white/5" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      {/* Welcome skeleton */}
      <div className="flex flex-col gap-2 pt-2 animate-pulse">
        <div className="h-4 w-24 rounded bg-white/10" />
        <div className="h-7 w-48 rounded bg-white/10" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 animate-pulse">
          <div className="h-8 w-12 rounded bg-white/10 mb-1" />
          <div className="h-3 w-16 rounded bg-white/5" />
        </div>
        <div className="card p-4 animate-pulse">
          <div className="h-8 w-12 rounded bg-white/10 mb-1" />
          <div className="h-3 w-16 rounded bg-white/5" />
        </div>
      </div>

      {/* Project cards skeleton */}
      <div className="flex flex-col gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </>
  );
}
