import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const TONES = {
  error: { icon: AlertCircle, classes: 'border-red-500/30 bg-red-500/10 text-red-200' },
  success: { icon: CheckCircle2, classes: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' },
  info: { icon: Info, classes: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200' },
};

// Inline message box (for example a failed login at the top of the form).
export default function Alert({ tone = 'error', children, className = '' }) {
  const { icon: Icon, classes } = TONES[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm ${classes} ${className}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
