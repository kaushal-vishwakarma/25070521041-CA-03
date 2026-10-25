// Complete class strings (Tailwind only generates classes it can see written out in full).
const TONES = {
  neutral: 'border-white/10 bg-white/5 text-slate-300',
  violet: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
  cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  red: 'border-red-500/30 bg-red-500/10 text-red-300',
  sky: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
};

export default function Badge({ tone = 'neutral', icon: Icon, className = '', children }) {
  return (
    <span className={['badge', TONES[tone] || TONES.neutral, className].filter(Boolean).join(' ')}>
      {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {children}
    </span>
  );
}
