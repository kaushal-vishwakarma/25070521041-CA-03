import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck, CalendarDays, Clock, MapPin, Wallet } from 'lucide-react';
import Avatar from './ui/Avatar.jsx';
import Badge from './ui/Badge.jsx';
import { ROUTES } from '../utils/routes.js';
import { daysLeft, deadlineLabel, formatStipend } from '../utils/format.js';

const MAX_SKILLS = 3;

// One internship summary. Used on the landing page, the listing page and the dashboards.
// The whole card is clickable (the title link is stretched over it); the save button sits above that link.
//   saved + onToggleSave are optional: pass them only where a student can bookmark.
//   matchedSkills (optional): skills shared with the student's profile; shown first and highlighted.
export default function InternshipCard({ internship, saved = false, onToggleSave, saving = false, matchedSkills = [] }) {
  const {
    _id,
    title,
    companyName,
    category,
    workMode,
    location,
    duration,
    stipendMin,
    stipendMax,
    applicationDeadline,
    requiredSkills = [],
    isOpen,
  } = internship;

  const closed = isOpen === false;
  const matched = new Set(matchedSkills.map((skill) => skill.toLowerCase()));
  // matched skills first (sort is stable, so the original order is kept inside each group)
  const orderedSkills = [...requiredSkills].sort(
    (a, b) => Number(matched.has(b.toLowerCase())) - Number(matched.has(a.toLowerCase()))
  );
  const days = daysLeft(applicationDeadline);
  const deadlineColor = closed ? 'text-red-300' : days <= 3 ? 'text-amber-300' : 'text-muted';

  return (
    <article className={`card card-hover relative flex h-full flex-col p-5 ${closed ? 'opacity-75' : ''}`}>
      <div className="flex items-start gap-3">
        <Avatar name={companyName} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-white">
            <Link
              to={ROUTES.internshipDetails(_id)}
              className="after:absolute after:inset-0 after:rounded-2xl hover:text-accent"
            >
              {title}
            </Link>
          </h3>
          <p className="truncate text-sm text-muted">{companyName}</p>
        </div>

        {onToggleSave && (
          <button
            type="button"
            onClick={() => onToggleSave(internship)}
            disabled={saving}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
            className={`relative z-10 rounded-lg p-1.5 transition hover:bg-white/10 disabled:opacity-50 ${
              saved ? 'text-brand' : 'text-muted hover:text-white'
            }`}
          >
            {saved ? <BookmarkCheck className="h-5 w-5" aria-hidden="true" /> : <Bookmark className="h-5 w-5" aria-hidden="true" />}
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="violet">{category}</Badge>
        <Badge tone="cyan">{workMode}</Badge>
        {closed && <Badge tone="red">Closed</Badge>}
      </div>

      <ul className="mt-4 space-y-2 text-sm text-slate-300">
        <li className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          <span className="truncate">{location}</span>
        </li>
        <li className="flex items-center gap-2">
          <Wallet className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          <span>{formatStipend(stipendMin, stipendMax)}</span>
        </li>
        <li className="flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          <span>{duration}</span>
        </li>
      </ul>

      {requiredSkills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {orderedSkills.slice(0, MAX_SKILLS).map((skill) => (
            <span
              key={skill}
              className={`rounded-md px-2 py-0.5 text-xs ${
                matched.has(skill.toLowerCase())
                  ? 'bg-brand/20 text-violet-200 ring-1 ring-brand/40'
                  : 'bg-white/5 text-slate-300'
              }`}
            >
              {skill}
            </span>
          ))}
          {requiredSkills.length > MAX_SKILLS && (
            <span className="rounded-md px-1 py-0.5 text-xs text-muted">+{requiredSkills.length - MAX_SKILLS} more</span>
          )}
        </div>
      )}

      <div className={`mt-auto flex items-center gap-2 border-t border-white/10 pt-4 text-xs ${deadlineColor}`}>
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        {closed ? 'No longer accepting applications' : deadlineLabel(applicationDeadline)}
      </div>
    </article>
  );
}
