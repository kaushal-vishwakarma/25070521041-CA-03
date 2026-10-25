import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarDays, FileText, MapPin, Wallet } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import { ListSkeleton } from '../../components/ui/Skeleton.jsx';
import useFetch from '../../hooks/useFetch.js';
import useToast from '../../hooks/useToast.js';
import { getMyApplications, withdrawApplication } from '../../services/applicationService.js';
import { getErrorMessage } from '../../services/api.js';
import { APPLICATION_STATUSES, WITHDRAWABLE_STATUSES } from '../../utils/constants.js';
import { formatDate, formatStipend, timeAgo } from '../../utils/format.js';
import { ROUTES } from '../../utils/routes.js';

const PAGE_SIZE = 8;

export default function MyApplicationsPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawStatus = searchParams.get('status') || '';
  const status = APPLICATION_STATUSES.includes(rawStatus) ? rawStatus : '';
  const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);

  const { data, loading, error, reload } = useFetch(
    () => getMyApplications({ status, page, limit: PAGE_SIZE }),
    [status, page]
  );

  const [toWithdraw, setToWithdraw] = useState(null); // the application the user wants to withdraw
  const [withdrawing, setWithdrawing] = useState(false);

  const goTo = (next) => {
    const params = new URLSearchParams();
    if (next.status) params.set('status', next.status);
    if (next.page > 1) params.set('page', String(next.page));
    setSearchParams(params);
  };

  const confirmWithdraw = async () => {
    setWithdrawing(true);
    try {
      await withdrawApplication(toWithdraw._id);
      toast.success('Application withdrawn');
      setToWithdraw(null);
      // If that was the only item on this page, step back one page.
      if (data.items.length === 1 && page > 1) goTo({ status, page: page - 1 });
      else reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setToWithdraw(null);
      reload(); // the status may have changed meanwhile
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <>
      <PageHeader
        title="My applications"
        subtitle="Track every internship you have applied to. You can withdraw while it is still Applied or Under Review."
        actions={<Button to={ROUTES.internships} variant="secondary">Find more internships</Button>}
      />

      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {['', ...APPLICATION_STATUSES].map((value) => {
          const active = value === status;
          return (
            <button
              key={value || 'all'}
              type="button"
              aria-pressed={active}
              onClick={() => goTo({ status: value, page: 1 })}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                active ? 'border-brand bg-brand/20 text-white' : 'border-white/10 bg-white/5 text-muted hover:text-white'
              }`}
            >
              {value || 'All'}
            </button>
          );
        })}
      </div>

      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <ListSkeleton rows={4} />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={status ? `No "${status}" applications` : 'You have not applied yet'}
          description={status ? 'Try another status filter.' : 'Find an internship you like and apply. It will show up here.'}
          action={
            status ? <Button variant="secondary" onClick={() => goTo({ status: '', page: 1 })}>Show all</Button> : <Button to={ROUTES.internships}>Browse internships</Button>
          }
        />
      ) : (
        <>
          <ul className={`space-y-3 transition-opacity ${loading ? 'opacity-60' : ''}`}>
            {data.items.map((app) => {
              const job = app.internship;
              const canWithdraw = WITHDRAWABLE_STATUSES.includes(app.status);
              return (
                <li key={app._id} className="card p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Avatar name={job?.companyName || '?'} />
                    <div className="min-w-0 flex-1">
                      {job ? (
                        <Link to={ROUTES.internshipDetails(job._id)} className="block truncate font-semibold text-white hover:text-accent">
                          {job.title}
                        </Link>
                      ) : (
                        <p className="font-semibold text-slate-400">Internship no longer available</p>
                      )}
                      <p className="truncate text-sm text-muted">{job?.companyName}</p>
                      {job && (
                        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                          <li className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{job.location}</li>
                          <li className="inline-flex items-center gap-1"><Wallet className="h-3.5 w-3.5" aria-hidden="true" />{formatStipend(job.stipendMin, job.stipendMax)}</li>
                          <li className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />Applied {formatDate(app.appliedAt)}</li>
                        </ul>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <StatusBadge status={app.status} />
                      <span className="text-xs text-slate-500">Updated {timeAgo(app.updatedAt)}</span>
                    </div>

                    <div className="flex gap-2 sm:w-44 sm:justify-end">
                      {job && <Button to={ROUTES.internshipDetails(job._id)} variant="secondary" size="sm">View</Button>}
                      {canWithdraw ? (
                        <Button variant="danger" size="sm" onClick={() => setToWithdraw(app)}>Withdraw</Button>
                      ) : (
                        <Badge className="self-center">Decision made</Badge>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={(p) => goTo({ status, page: p })} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(toWithdraw)}
        danger
        title="Withdraw this application?"
        message={`Your application to "${toWithdraw?.internship?.title ?? 'this internship'}" will be removed. You can apply again later if the internship is still open.`}
        confirmLabel="Withdraw"
        loading={withdrawing}
        onCancel={() => setToWithdraw(null)}
        onConfirm={confirmWithdraw}
      />
    </>
  );
}
