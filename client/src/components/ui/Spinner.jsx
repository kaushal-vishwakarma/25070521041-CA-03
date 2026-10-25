import { Loader2 } from 'lucide-react';

export function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={`animate-spin text-brand ${className}`} aria-hidden="true" />;
}

// Centered full-area loader (used while the session is being checked).
export function PageLoader({ label = 'Loading...' }) {
  return (
    <div role="status" className="grid min-h-[50vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-muted">
        <Spinner className="h-8 w-8" />
        <p className="text-sm">{label}</p>
      </div>
    </div>
  );
}
