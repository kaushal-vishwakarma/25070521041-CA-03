import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Briefcase, Search, SlidersHorizontal, X } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { InternshipCardSkeleton } from '../components/ui/Skeleton.jsx';
import InternshipCard from '../components/InternshipCard.jsx';
import useFetch from '../hooks/useFetch.js';
import useDebounce from '../hooks/useDebounce.js';
import useSavedInternships from '../hooks/useSavedInternships.js';
import { listInternships } from '../services/internshipService.js';
import { CATEGORIES, DURATIONS, SORT_OPTIONS, WORK_MODES } from '../utils/constants.js';

const PAGE_SIZE = 9;
const STIPEND_OPTIONS = [
  { value: '5000', label: '\u20B95,000 or more' },
  { value: '10000', label: '\u20B910,000 or more' },
  { value: '15000', label: '\u20B915,000 or more' },
  { value: '20000', label: '\u20B920,000 or more' },
];
const SORT_VALUES = SORT_OPTIONS.map((o) => o.value);

// URL values are user-editable, so only accept values we know are valid.
const pick = (value, allowed) => (allowed.includes(value) ? value : '');

// The filters live in the URL (?category=AI/ML&page=2), so a filtered view can be
// bookmarked or shared, and the browser Back button works.
export default function InternshipsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const saved = useSavedInternships();
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo(
    () => ({
      search: (searchParams.get('search') || '').slice(0, 100),
      category: pick(searchParams.get('category') || '', CATEGORIES),
      workMode: pick(searchParams.get('workMode') || '', WORK_MODES),
      duration: pick(searchParams.get('duration') || '', DURATIONS),
      location: (searchParams.get('location') || '').slice(0, 100),
      minStipend: /^\d{1,7}$/.test(searchParams.get('minStipend') || '') ? searchParams.get('minStipend') : '',
      sort: pick(searchParams.get('sort') || '', SORT_VALUES) || 'newest',
      page: Math.max(parseInt(searchParams.get('page'), 10) || 1, 1),
    }),
    [searchParams]
  );

  const updateParams = (patch, { replace = false } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      const empty = value === '' || value === null || value === undefined;
      if (empty || (key === 'sort' && value === 'newest') || (key === 'page' && value === 1)) next.delete(key);
      else next.set(key, String(value));
    });
    if (!('page' in patch)) next.delete('page'); // any filter change goes back to page 1
    setSearchParams(next, { replace });
  };

  // Typing boxes keep their own state and update the URL after a short pause.
  const [searchText, setSearchText] = useState(filters.search);
  const [locationText, setLocationText] = useState(filters.location);
  const debouncedSearch = useDebounce(searchText, 400);
  const debouncedLocation = useDebounce(locationText, 400);

  useEffect(() => {
    const value = debouncedSearch.trim() ? debouncedSearch : '';
    if (value !== filters.search) updateParams({ search: value }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    const value = debouncedLocation.trim() ? debouncedLocation : '';
    if (value !== filters.location) updateParams({ location: value }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLocation]);

  // If the URL changes from outside (Clear all, Back button, a link), refresh the text boxes.
  useEffect(() => setSearchText(filters.search), [filters.search]);
  useEffect(() => setLocationText(filters.location), [filters.location]);

  const { data, loading, error, reload } = useFetch(
    () => listInternships({ ...filters, limit: PAGE_SIZE }),
    [searchParams.toString()]
  );

  const activeFilterCount = [filters.category, filters.workMode, filters.duration, filters.location, filters.minStipend].filter(Boolean).length;
  const hasAnyFilter = activeFilterCount > 0 || filters.search !== '';

  const clearAll = () => {
    setSearchText('');
    setLocationText('');
    setSearchParams(new URLSearchParams());
  };

  const changePage = (page) => {
    updateParams({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const meta = data?.meta;

  return (
    <div className="container-page py-8 sm:py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Browse internships</h1>
        <p className="mt-1.5 text-sm text-muted">Search and filter open internships. Closed listings and past deadlines are hidden.</p>
      </header>

      {/* Search + sort row */}
      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_220px_auto]" role="search">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <label htmlFor="listing-search" className="sr-only">Search by role, company or skill</label>
          <input
            id="listing-search"
            type="search"
            className="input pl-10"
            placeholder="Search by role, company or skill"
            maxLength={100}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <Select aria-label="Sort internships" options={SORT_OPTIONS} value={filters.sort} onChange={(e) => updateParams({ sort: e.target.value })} />
        <Button variant="secondary" icon={SlidersHorizontal} className="lg:hidden" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters} aria-controls="filters-panel">
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Button>
      </div>

      <div className="lg:grid lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-8">
        {/* Filters (always visible on large screens, toggled on small ones) */}
        <aside id="filters-panel" className={`${showFilters ? 'block' : 'hidden'} mb-6 lg:mb-0 lg:block`} aria-label="Filters">
          <div className="card space-y-5 p-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Filters</h2>
              {hasAnyFilter && (
                <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                  <X className="h-3 w-3" aria-hidden="true" /> Clear all
                </button>
              )}
            </div>
            <Select label="Category" placeholder="All categories" options={CATEGORIES} value={filters.category} onChange={(e) => updateParams({ category: e.target.value })} />
            <Select label="Work mode" placeholder="Any work mode" options={WORK_MODES} value={filters.workMode} onChange={(e) => updateParams({ workMode: e.target.value })} />
            <Select label="Duration" placeholder="Any duration" options={DURATIONS} value={filters.duration} onChange={(e) => updateParams({ duration: e.target.value })} />
            <Select label="Minimum stipend (per month)" placeholder="Any stipend" options={STIPEND_OPTIONS} value={filters.minStipend} onChange={(e) => updateParams({ minStipend: e.target.value })} />
            <Input label="Location" placeholder="e.g. Pune" maxLength={100} value={locationText} onChange={(e) => setLocationText(e.target.value)} />
          </div>
        </aside>

        {/* Results */}
        <section aria-label="Search results" className="min-w-0">
          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : loading && !data ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => <InternshipCardSkeleton key={i} />)}
            </div>
          ) : data.items.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No internships match your search"
              description={hasAnyFilter ? 'Try removing a filter or searching with different words.' : 'There are no open internships right now. Please check back soon.'}
              action={hasAnyFilter ? <Button variant="secondary" onClick={clearAll}>Clear all filters</Button> : undefined}
            />
          ) : (
            <>
              <p className="mb-4 text-sm text-muted" aria-live="polite">
                Showing <span className="font-semibold text-white">{(meta.page - 1) * meta.limit + 1}-{(meta.page - 1) * meta.limit + data.items.length}</span> of{' '}
                <span className="font-semibold text-white">{meta.total}</span> internship{meta.total === 1 ? '' : 's'}
              </p>
              <div className={`grid gap-5 sm:grid-cols-2 xl:grid-cols-3 transition-opacity ${loading ? 'opacity-60' : ''}`}>
                {data.items.map((item) => (
                  <InternshipCard
                    key={item._id}
                    internship={item}
                    saved={saved.isSaved(item._id)}
                    onToggleSave={saved.enabled ? saved.toggle : undefined}
                    saving={saved.savingId === item._id}
                  />
                ))}
              </div>
              <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={changePage} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
