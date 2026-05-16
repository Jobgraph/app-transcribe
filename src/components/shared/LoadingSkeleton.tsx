export function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="h-4 w-24 bg-muted rounded mb-3" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-5/6" />
          <div className="h-3 bg-muted rounded w-4/6" />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="h-4 w-32 bg-muted rounded mb-3" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="h-4 w-28 bg-muted rounded mb-3" />
        <div className="h-24 bg-muted rounded" />
      </div>
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="h-4 w-36 bg-muted rounded mb-3" />
        <div className="h-20 bg-muted rounded" />
      </div>
    </div>
  );
}
