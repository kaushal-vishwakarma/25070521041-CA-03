import { Inbox } from 'lucide-react';

// "Nothing here yet" message with an optional call-to-action button.
export default function EmptyState({ icon: Icon = Inbox, title, description, action, className = '' }) {
  return (
    <div className={`card flex flex-col items-center px-6 py-12 text-center ${className}`}>
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-muted">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
