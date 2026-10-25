import { Link } from 'react-router-dom';
import { Bookmark, CheckCircle2, ExternalLink, FileText, Hourglass, Sparkles, Star, XCircle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import { InternshipCardSkeleton, ListSkeleton, Skeleton, StatCardSkeleton } from '../../components/ui/Skeleton.jsx';
import InternshipCard from '../../components/InternshipCard.jsx';
import StatusChart from '../../components/StatusChart.jsx';
import useAuth from '../../hooks/useAuth.js';
import useFetch from '../../hooks/useFetch.js';
import useSavedInternships from '../../hooks/useSavedInternships.js';
import { getStudentDashboard } from '../../services/dashboardService.js';
import { profileCompleteness } from '../../utils/profile.js';
import { timeAgo } from '../../utils/format.js';
import { ROUTES } from '../../utils/routes.js';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const saved = useSavedInternships();
  const { data, loading, error, reload } = useFetch(getStudentDashboard, []);
  const completeness = profileCompleteness(user);
  const firstName = user.name.split(' ')[0];

  const toggleSave = async (item) => {
    await saved.toggle(item);
    reload(); // refresh the "Saved" counter
  };

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Here is what is happening with your applications."
        actions={<Button to={ROUTES.internships}>Browse internships</Button>}
      />

      {/* Profile summary */}
      <section className="card mb-6 p-5" aria-label="Profile summary">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar name={user.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-white">{user.name}</h2>
            <p className="text-sm text-muted">{user.college || 'Add your college in your profile'}</p>
            {user.skills.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Your skills">
                {user.skills.slice(0, 8).map((skill) => (
                  <li key={skill} className="rounded-md bg-brand/15 px-2 py-0.5 text-xs text-violet-200">{skill}</li>
                ))}
                {user.skills.length > 8 && <li className="px-1 text-xs text-muted">+{user.skills.length - 8} more</li>}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-amber-300">Add your skills to get internship recommendations.</p>
            )}
            {user.resumeUrl && (
              <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent hover:underline">
                View my resume <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
          </div>
          <div className="sm:w-56">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Profile completeness</span>
              <span className="font-semibold text-white">{completeness.percent}%</span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-valuenow={completeness.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Profile completeness"
            >
              <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all" style={{ width: `${completeness.percent}%` }} />
            </div>
            {completeness.missing.length > 0 ? (
              <p className="mt-2 text-xs text-muted">
                Still missing: {completeness.missing.join(', ')}.{' '}
                <Link to={ROUTES.student.profile} className="text-accent hover:underline">Complete it</Link>
              </p>
            ) : (
              <p className="mt-2 text-xs text-emerald-300">Your profile is complete.</p>
            )}
          </div>
        </div>
      </section>

      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          {/* Stats (calculated from the database by GET /api/dashboard/student) */}
          <section aria-label="Application statistics" className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            {loading && !data ? (
              [1, 2, 3, 4, 5, 6].map((n) => <StatCardSkeleton key={n} />)
            ) : (
              <>
                <StatCard icon={FileText} label="Total applications" value={data.stats.total} tone="violet" />
                <StatCard icon={Hourglass} label="Pending" value={data.stats.pending} tone="amber" hint="Applied + Under Review" />
                <StatCard icon={Star} label="Shortlisted" value={data.stats.shortlisted} tone="cyan" />
                <StatCard icon={CheckCircle2} label="Accepted" value={data.stats.accepted} tone="green" />
                <StatCard icon={XCircle} label="Rejected" value={data.stats.rejected} tone="red" />
                <StatCard icon={Bookmark} label="Saved internships" value={data.stats.saved} tone="sky" />
              </>
            )}
          </section>

          {/* Chart + recent activity */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <section className="card p-5" aria-labelledby="chart-heading">
              <h2 id="chart-heading" className="font-semibold text-white">Applications by status</h2>
              {loading && !data ? (
                <Skeleton className="mt-4 h-56 w-full" />
              ) : (
                <StatusChart data={data.statusBreakdown} emptyText="Your chart will appear here after you apply to an internship." />
              )}
            </section>

            <section className="card p-5" aria-labelledby="activity-heading">
              <div className="flex items-center justify-between">
                <h2 id="activity-heading" className="font-semibold text-white">Recent activity</h2>
                <Link to={ROUTES.student.applications} className="text-xs text-accent hover:underline">View all</Link>
              </div>
              {loading && !data ? (
                <div className="mt-4"><ListSkeleton rows={3} /></div>
              ) : data.recentActivity.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">No activity yet. Apply to an internship to get started.</p>
              ) : (
                <ul className="mt-2 divide-y divide-white/10">
                  {data.recentActivity.map((app) => (
                    <li key={app._id} className="flex items-start justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <Link to={ROUTES.internshipDetails(app.internship?._id)} className="block truncate text-sm font-medium text-white hover:text-accent">
                          {app.internship?.title || 'Removed internship'}
                        </Link>
                        <p className="truncate text-xs text-muted">
                          {app.internship?.companyName} &middot; {app.status === 'Applied' ? 'applied' : 'updated'} {timeAgo(app.updatedAt)}
                        </p>
                      </div>
                      <StatusBadge status={app.status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Recommendations */}
          <section aria-labelledby="recommended-heading">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand" aria-hidden="true" />
              <h2 id="recommended-heading" className="text-lg font-semibold text-white">Recommended for you</h2>
            </div>
            {data && (
              <p className="mb-4 text-sm text-muted">
                {data.recommendedBySkills
                  ? 'Open internships that match the skills on your profile.'
                  : 'These are the newest openings. Add skills to your profile to get personalised matches.'}
              </p>
            )}
            {loading && !data ? (
              <div className="grid gap-5 sm:grid-cols-2">{[1, 2].map((n) => <InternshipCardSkeleton key={n} />)}</div>
            ) : data.recommended.length === 0 ? (
              <EmptyState title="Nothing to recommend yet" description="There are no open internships you have not applied to." action={<Button to={ROUTES.internships}>Browse all internships</Button>} />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {data.recommended.map((item) => (
                  <InternshipCard
                    key={item._id}
                    internship={item}
                    matchedSkills={item.matchedSkills}
                    saved={saved.isSaved(item._id)}
                    onToggleSave={toggleSave}
                    saving={saved.savingId === item._id}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
