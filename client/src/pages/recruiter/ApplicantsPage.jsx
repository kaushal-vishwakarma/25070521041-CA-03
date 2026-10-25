import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Mail, Search, Users } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Select from '../../components/ui/Select.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import { ListSkeleton } from '../../components/ui/Skeleton.jsx';
import useFetch from '../../hooks/useFetch.js';
import useDebounce from '../../hooks/useDebounce.js';
import useToast from '../../hooks/useToast.js';
import { getInternshipApplicants, updateApplicationStatus } from '../../services/applicationService.js';
import { getErrorMessage } from '../../services/api.js';
import { APPLICATION_STATUSES } from '../../utils/constants.js';
import { formatDate, timeAgo } from '../../utils/format.js';
import { ROUTES } from '../../utils/routes.js';

const PAGE_SIZE = 8;

export default function ApplicantsPage() {
  const { id } = useParams();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawStatus = searchParams.get('status') || '';
  const status = APPLICATION_STATUSES.includes(rawStatus) ? rawStatus : '';
  const search = (searchParams.get('search') || '').slice(0, 100);
  const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);

  const update = (patch, { replace = false } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined || (k === 'page' && v === 1)) next.delete(k);
      else next.set(k, String(v));
    });
    if (!('page' in patch)) next.delete('page');
    setSearchParams(next, { replace });
  };

  const [searchText, setSearchText] = useState(search);
  const debounced = useDebounce(searchText, 400);
  useEffect(() => {
    const value = debounced.trim() ? debounced : '';
    if (value !== search) update({ search: value }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);
  useEffect(() => setSearchText(search), [search]);

  const { data, loading, error, reload, setData } = useFetch(
    () => getInternshipApplicants(id, { status, search, page, limit: PAGE_SIZE }),
    [id, status, search, page]
  );

  const [updatingId, setUpdatingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const selected = data?.items.find((app) => app._id === selectedId) || null;

  const changeStatus = async (app, nextStatus) => {
    if (nextStatus === app.status) return;
    setUpdatingId(app._id);
    try {
      const updated = await updateApplicationStatus(app._id, nextStatus);
      toast.success(`${app.student?.name || 'Applicant'} is now "${updated.status}"`);
      setData((current) => ({ ...current, items: current.items.map((i) => (i._id === app._id ? { ...i, status: updated.status } : i)) }));
      reload(); // refreshes the counts on the tabs
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = data?.meta.statusCounts;
  const totalApplicants = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;
  const hasFilter = Boolean(status || search);

  const header = (
    <>
      <Link to={ROUTES.recruiter.internships} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> My internships
      </Link>
      <PageHeader
        title="Applicants"
        subtitle={data ? data.meta.internship.title : 'Loading internship...'}
        actions={<Button to={ROUTES.internshipDetails(id)} variant="secondary" icon={ExternalLink}>View listing</Button>}
      />
    </>
  );

  if (error && !data) return (<>{header}<ErrorState message={error} onRetry={reload} /></>);

  return (
    <>
      {header}

      {/* Status tabs with counts */}
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {['', ...APPLICATION_STATUSES].map((value) => {
          const active = value === status;
          const count = counts ? (value ? counts[value] : totalApplicants) : null;
          return (
            <button
              key={value || 'all'}
              type="button"
              aria-pressed={active}
              onClick={() => update({ status: value })}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${active ? 'border-brand bg-brand/20 text-white' : 'border-white/10 bg-white/5 text-muted hover:text-white'}`}
            >
              {value || 'All'}{count !== null && <span className="ml-1.5 text-xs opacity-70">{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="relative mb-5 max-w-md" role="search">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
        <label htmlFor="applicant-search" className="sr-only">Search applicants by name, college or skill</label>
        <input id="applicant-search" type="search" className="input pl-10" placeholder="Search by name, college or skill" maxLength={100} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
      </div>

      {loading && !data ? (
        <ListSkeleton rows={4} />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={Users}
          title={hasFilter ? 'No applicants match' : 'No applicants yet'}
          description={hasFilter ? 'Try a different status or search.' : 'When students apply to this internship they will appear here.'}
          action={hasFilter ? <Button variant="secondary" onClick={() => { setSearchText(''); setSearchParams(new URLSearchParams()); }}>Clear filters</Button> : undefined}
        />
      ) : (
        <>
          <ul className={`space-y-3 transition-opacity ${loading ? 'opacity-60' : ''}`}>
            {data.items.map((app) => {
              const student = app.student;
              const resume = app.resumeUrl || student?.resumeUrl;
              return (
                <li key={app._id} className="card p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <Avatar name={student?.name || '?'} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{student?.name || 'Deleted user'}</p>
                        <p className="truncate text-sm text-muted">{student?.college || 'College not provided'}</p>
                        {student?.skills?.length > 0 && (
                          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Skills">
                            {student.skills.slice(0, 5).map((skill) => <li key={skill} className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-slate-300">{skill}</li>)}
                            {student.skills.length > 5 && <li className="px-1 text-xs text-muted">+{student.skills.length - 5}</li>}
                          </ul>
                        )}
                        <p className="mt-2 text-xs text-slate-500">Applied {formatDate(app.appliedAt)} ({timeAgo(app.appliedAt)})</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <Select
                        className="w-44"
                        aria-label={`Update status for ${student?.name || 'applicant'}`}
                        options={APPLICATION_STATUSES}
                        value={app.status}
                        disabled={updatingId === app._id}
                        onChange={(e) => changeStatus(app, e.target.value)}
                      />
                      {resume && (
                        <a href={resume} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3 py-1.5 text-xs">
                          Resume <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      )}
                      <Button size="sm" variant="secondary" onClick={() => setSelectedId(app._id)}>View profile</Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={(p) => update({ page: p })} />
        </>
      )}

      {/* Applicant profile */}
      <Modal open={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.student?.name || 'Applicant'} size="lg" footer={<Button variant="secondary" onClick={() => setSelectedId(null)}>Close</Button>}>
        {selected && (
          <div className="space-y-5 text-sm">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Email</dt>
                <dd className="mt-0.5">
                  <a href={`mailto:${selected.student?.email}`} className="inline-flex items-center gap-1.5 text-accent hover:underline">
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />{selected.student?.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">College</dt>
                <dd className="mt-0.5 text-white">{selected.student?.college || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Applied on</dt>
                <dd className="mt-0.5 text-white">{formatDate(selected.appliedAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Resume</dt>
                <dd className="mt-0.5">
                  {selected.resumeUrl || selected.student?.resumeUrl ? (
                    <a href={selected.resumeUrl || selected.student.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-accent hover:underline">
                      Open resume <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  ) : <span className="text-white">Not provided</span>}
                </dd>
              </div>
            </dl>

            <div>
              <p className="text-xs text-muted">Skills</p>
              {selected.student?.skills?.length > 0 ? (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {selected.student.skills.map((skill) => <li key={skill} className="rounded-md bg-brand/15 px-2 py-0.5 text-xs text-violet-200">{skill}</li>)}
                </ul>
              ) : <p className="mt-1 text-white">None listed</p>}
            </div>

            {selected.student?.bio && (
              <div>
                <p className="text-xs text-muted">About</p>
                <p className="mt-1 whitespace-pre-line text-slate-200">{selected.student.bio}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-muted">Cover letter</p>
              <p className="mt-1 whitespace-pre-line rounded-xl bg-white/5 p-3 text-slate-200">{selected.coverLetter || 'No cover letter was added.'}</p>
            </div>

            <Select
              label="Application status"
              options={APPLICATION_STATUSES}
              value={selected.status}
              disabled={updatingId === selected._id}
              onChange={(e) => changeStatus(selected, e.target.value)}
            />
          </div>
        )}
      </Modal>
    </>
  );
}
