export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-white/5 bg-white/[0.03] ${className ?? "h-28"}`}
      aria-hidden="true"
    />
  );
}

export function TextSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/[0.06] ${className ?? "h-4 w-32"}`}
      aria-hidden="true"
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading dashboard…">
      <div className="space-y-2">
        <TextSkeleton className="h-3 w-24" />
        <TextSkeleton className="h-8 w-56" />
        <TextSkeleton className="h-3 w-36" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <CardSkeleton key={i} className="h-28" />)}
      </div>
      <CardSkeleton className="h-36" />
      <div className="space-y-2">
        <TextSkeleton className="h-5 w-32" />
        {[0, 1, 2].map((i) => <CardSkeleton key={i} className="h-14" />)}
      </div>
    </div>
  );
}

export function PlayerSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading course…">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-white/[0.05]" />
        <div className="h-7 w-80 rounded bg-white/[0.05]" />
        <div className="h-2 w-40 rounded-full bg-white/[0.05]" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="h-[70vh] rounded-xl bg-white/[0.03]" />
        <div className="h-[70vh] rounded-xl bg-white/[0.03]" />
      </div>
    </div>
  );
}
