import { AlertTriangle } from 'lucide-react';
import Button from './Button.jsx';

// Shown when an API call fails. onRetry usually is the `reload` function from useFetch.
export default function ErrorState({ message = 'Something went wrong.', onRetry, className = '' }) {
  return (
    <div role="alert" className={`card flex flex-col items-center border-red-500/20 px-6 py-12 text-center ${className}`}>
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-500/10 text-red-400">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-white">Could not load this content</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
