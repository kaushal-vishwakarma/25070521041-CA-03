import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Briefcase, CalendarDays, Pencil, Plus, RotateCcw, Search, Trash2, Users, Wallet, XCircle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Select from '../../components/ui/Select.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import { ListSkeleton } from '../../components/ui/Skeleton.jsx';
import useFetch from '../../hooks/useFetch.js';
import useDebounce from '../../hooks/useDebounce.js';
import useToast from '../../hooks/useToast.js';
import { deleteInternship, getMyInternships, updateInternship } from '../../services/internshipService.js';
import { getErrorMessage } from '../../services/api.js';
import { deadlineLabel, formatStipend } from '../../utils/format.js';
import { ROUTES } from '../../utils/routes.js';

const PAGE_SIZE = 8;
const STATUS_FILTERS = [
  { value: 'active', label: 'Open (not closed by me)' },
  { value: 'closed', label: 'Closed by me' },
];

// closed -> red, status active but deadline passed -> amber, otherwise green
const listingState = (item) => {
  if (item.status === 'closed') return { label: 'Closed', tone: 'red' };
  if (!item.isOpen) return { label: 'Expired', tone: 'amber' };
  return { label: 'Active', tone: 'green' };
};

export default function RecruiterInternshipsPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = ['active', 'closed'].includes(searchParams.get('status')) ? searchParams.get('status') : '';
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
    () => getMyInternships({ status, search, page, limit: PAGE_SIZE }),
    [status, search, page]
  );

  const [togglingId, setTogglingId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toggleStatus = async (item) => {
    const next = item.status === 'active' ? 'closed' : 'active';
    setTogglingId(item._id);
    try {
      const updated = await updateInternship(item._id, { status: next });
      // merge, so the applicantCount that only the list endpoint knows is kept
      setData((current) => ({ ...current, items: current.items.map((i) => (i._id === item._id ? { ...i, ...updated } : i)) }));
      toast.success(next === 'closed' ? 'Internship closed. Students can no longer apply.' : 'Internship reopened.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteInternship(toDelete._id);
      toast.success('Internship deleted');
      setToDelete(null);
      if (data.items.length === 1 && page > 1) update({ page: page - 1 });
      else reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const hasFilter = Boolean(status || search);

  return (
    <>
      <PageHeader
        title="My internships"
        subtitle="Create, edit, close or delete your listings and review who applied."
        actions={<Button to={ROUTES.recruiter.newInternship} icon={Plus}>Post internship</Button>}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_240px]" role="search">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <label htmlFor="my-search" className="sr-only">Search your internships</label>
          <input id="my-search" type="search" className="input pl-10" placeholder="Search by title" maxLength={100} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </div>
        <Select aria-label="Filter by status" placeholder="All listings" options={STATUS_FILTERS} value={status} onChange={(e) => update({ status: e.target.value })} />
      </div>

      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <ListSkeleton rows={4} />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={hasFilter ? 'No internships match' : 'You have not posted any internships'}
          description={hasFilter ? 'Try another search or filter.' : 'Post your first internship to start receiving applications.'}
          action={hasFilter ? <Button variant="secondary" onClick={() => { setSearchText(''); setSearchParams(new URLSearchParams()); }}>Clear filters</Button> : <Button to={ROUTES.recruiter.newInternship} icon={Plus}>Post internship</Button>}
        />
      ) : (
        <>
          <ul className={`space-y-3 transition-opacity ${loading ? 'opacity-60' : ''}`}>
            {data.items.map((item) => {
              const state = listingState(item);
              const deadlinePassed = !item.isOpen && item.status === 'active';
              const expiredButClosed = item.status === 'closed' && new Date(item.applicationDeadline) <= new Date();
              return (
                <li key={item._id} className="card p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={ROUTES.internshipDetails(item._id)} className="truncate text-base font-semibold text-white hover:text-accent">{item.title}</Link>
                        <Badge tone={state.tone}>{state.label}</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge tone="violet">{item.category}</Badge>
                        <Badge tone="cyan">{item.workMode}</Badge>
                      </div>
                      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-400">
                        <li className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" aria-hidden="true" />{item.applicantCount} applicant{item.applicantCount === 1 ? '' : 's'}</li>
                        <li className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{deadlineLabel(item.applicationDeadline)}</li>
                        <li className="inline-flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" aria-hidden="true" />{formatStipend(item.stipendMin, item.stipendMax)}</li>
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button to={ROUTES.recruiter.applicants(item._id)} size="sm" icon={Users}>Applicants</Button>
                      <Button to={ROUTES.recruiter.editInternship(item._id)} size="sm" variant="secondary" icon={Pencil}>Edit</Button>
                      {item.status === 'active' ? (
                        <Button size="sm" variant="secondary" icon={XCircle} loading={togglingId === item._id} onClick={() => toggleStatus(item)}>Close</Button>
                      ) : expiredButClosed ? (
                        <Button to={ROUTES.recruiter.editInternship(item._id)} size="sm" variant="secondary" icon={RotateCcw} title="The deadline has passed. Set a new deadline, then reopen.">Extend &amp; reopen</Button>
                      ) : (
                        <Button size="sm" variant="secondary" icon={RotateCcw} loading={togglingId === item._id} onClick={() => toggleStatus(item)}>Reopen</Button>
                      )}
                      <Button size="sm" variant="danger" icon={Trash2} aria-label={`Delete ${item.title}`} onClick={() => setToDelete(item)}>Delete</Button>
                    </div>
                  </div>
                  {deadlinePassed && (
                    <p className="mt-3 text-xs text-amber-300">The deadline has passed, so students cannot apply. Edit the listing to set a new deadline.</p>
                  )}
                </li>
              );
            })}
          </ul>
          <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={(p) => update({ page: p })} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        danger
        title="Delete this internship?"
        message={
          toDelete
            ? `"${toDelete.title}" will be permanently deleted${toDelete.applicantCount > 0 ? `, together with its ${toDelete.applicantCount} application${toDelete.applicantCount === 1 ? '' : 's'}` : ''}. This cannot be undone. To stop new applications but keep the data, use Close instead.`
            : ''
        }
        confirmLabel="Delete permanently"
        loading={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
