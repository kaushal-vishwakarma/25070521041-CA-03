import { Link } from 'react-router-dom';
import { Archive, Briefcase, CheckCircle2, Plus, Star, UserCheck, Users } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import { ListSkeleton, Skeleton, StatCardSkeleton } from '../../components/ui/Skeleton.jsx';
import StatusChart from '../../components/StatusChart.jsx';
import useAuth from '../../hooks/useAuth.js';
import useFetch from '../../hooks/useFetch.js';
import { getRecruiterDashboard } from '../../services/dashboardService.js';
import { timeAgo } from '../../utils/format.js';
import { ROUTES } from '../../utils/routes.js';

export default function RecruiterDashboardPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(getRecruiterDashboard, []);
  const firstName = user.name.split(' ')[0];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle={`Hiring overview for ${user.companyName || 'your company'}.`}
        actions={
          <>
            <Button to={ROUTES.recruiter.newInternship} icon={Plus}>Post internship</Button>
            <Button to={ROUTES.recruiter.internships} variant="secondary">Manage internships</Button>
          </>
        }
      />

      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <section aria-label="Hiring statistics" className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            {loading && !data ? (
              [1, 2, 3, 4, 5, 6].map((n) => <StatCardSkeleton key={n} />)
            ) : (
              <>
                <StatCard icon={Briefcase} label="Internships posted" value={data.stats.totalInternships} tone="violet" />
                <StatCard icon={CheckCircle2} label="Active internships" value={data.stats.activeInternships} tone="green" hint="Open and before the deadline" />
                <StatCard icon={Archive} label="Closed internships" value={data.stats.closedInternships} tone="red" hint="Closed or past the deadline" />
                <StatCard icon={Users} label="Total applicants" value={data.stats.totalApplicants} tone="cyan" />
                <StatCard icon={Star} label="Shortlisted" value={data.stats.shortlisted} tone="amber" />
                <StatCard icon={UserCheck} label="Accepted" value={data.stats.accepted} tone="sky" />
              </>
            )}
          </section>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <section className="card p-5" aria-labelledby="applicant-chart-heading">
              <h2 id="applicant-chart-heading" className="font-semibold text-white">Applicants by status</h2>
              {loading && !data ? (
                <Skeleton className="mt-4 h-56 w-full" />
              ) : (
                <StatusChart data={data.statusBreakdown} emptyText="No applicants yet. They will appear here as students apply." />
              )}
            </section>

            <section className="card p-5" aria-labelledby="top-heading">
              <h2 id="top-heading" className="font-semibold text-white">Most popular internships</h2>
              {loading && !data ? (
                <div className="mt-4 space-y-4">{[1, 2, 3].map((n) => <Skeleton key={n} className="h-8 w-full" />)}</div>
              ) : data.topInternships.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">Nothing to rank yet.</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {data.topInternships.map((item) => {
                    const max = Math.max(...data.topInternships.map((i) => i.applicants), 1);
                    return (
                      <li key={item.internshipId}>
                        <Link to={ROUTES.recruiter.applicants(item.internshipId)} className="group block">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="truncate text-slate-200 group-hover:text-accent">{item.title}</span>
                            <span className="shrink-0 font-semibold text-white">{item.applicants}</span>
                          </div>
                          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                            <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${(item.applicants / max) * 100}%` }} />
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <section className="card p-5" aria-labelledby="recent-heading">
            <h2 id="recent-heading" className="font-semibold text-white">Recent applicants</h2>
            {loading && !data ? (
              <div className="mt-4"><ListSkeleton rows={3} /></div>
            ) : data.recentApplicants.length === 0 ? (
              <EmptyState
                className="mt-4 border-0 shadow-none"
                title="No applicants yet"
                description={data.stats.totalInternships === 0 ? 'Post your first internship to start receiving applications.' : 'Applications will appear here as students apply.'}
                action={data.stats.totalInternships === 0 ? <Button to={ROUTES.recruiter.newInternship}>Post an internship</Button> : undefined}
              />
            ) : (
              <ul className="mt-2 divide-y divide-white/10">
                {data.recentApplicants.map((app) => (
                  <li key={app._id} className="flex items-center gap-3 py-3">
                    <Avatar name={app.student?.name || '?'} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{app.student?.name || 'Deleted user'}</p>
                      <p className="truncate text-xs text-muted">
                        applied to{' '}
                        {app.internship ? (
                          <Link to={ROUTES.recruiter.applicants(app.internship._id)} className="text-accent hover:underline">{app.internship.title}</Link>
                        ) : 'a removed internship'}{' '}
                        &middot; {timeAgo(app.appliedAt)}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}
