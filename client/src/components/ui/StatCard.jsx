const TONES = {
  violet: 'bg-violet-500/15 text-violet-300',
  cyan: 'bg-cyan-500/15 text-cyan-300',
  green: 'bg-emerald-500/15 text-emerald-300',
  amber: 'bg-amber-500/15 text-amber-300',
  red: 'bg-red-500/15 text-red-300',
  sky: 'bg-sky-500/15 text-sky-300',
};

// Dashboard number tile. `value` always comes from the API (real database counts).
export default function StatCard({ icon: Icon, label, value, tone = 'violet', hint }) {
  return (
    <div className="card p-5">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${TONES[tone] || TONES.violet}`}>
        {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
      </span>
      <p className="mt-4 text-2xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-0.5 text-sm text-muted">{label}</p>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
