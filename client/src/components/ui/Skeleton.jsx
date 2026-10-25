// Gray pulsing placeholders shown while data loads (better than a blank page or a spinner).
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function InternshipCardSkeleton() {
  return (
    <div className="card p-5" role="status" aria-label="Loading internship">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 !rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-5 w-24 !rounded-full" />
        <Skeleton className="h-5 w-16 !rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="mt-5 h-3 w-1/3" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card p-5" role="status" aria-label="Loading statistic">
      <Skeleton className="h-10 w-10 !rounded-xl" />
      <Skeleton className="mt-4 h-7 w-16" />
      <Skeleton className="mt-2 h-3 w-24" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Rows for tables / lists (applications, applicants).
export function ListSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading list">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="card flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 !rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-20 !rounded-full" />
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
