// Small shimmering placeholder blocks used while cards are loading.

export function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-md bg-surface-muted ${className}`}
    />
  );
}

export function ForecastCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <SkeletonLine className="h-4 w-32" />
      <SkeletonLine className="mt-4 h-9 w-48" />
      <SkeletonLine className="mt-2 h-3 w-40" />
      <div className="mt-6 border-t border-border pt-6">
        <SkeletonLine className="h-4 w-40" />
        <SkeletonLine className="mt-4 h-9 w-48" />
        <SkeletonLine className="mt-2 h-3 w-36" />
      </div>
    </div>
  );
}

export function DriftPanelSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <SkeletonLine className="h-4 w-28" />
        <SkeletonLine className="h-6 w-24 rounded-full" />
      </div>
      <SkeletonLine className="mt-4 h-3 w-32" />
      <div className="mt-6 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonLine key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}
