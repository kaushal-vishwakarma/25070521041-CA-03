import { ChevronLeft, ChevronRight } from 'lucide-react';

// Shows 1, last, and the current page +/- 1; gaps become "...".
const buildPages = (page, total) => {
  const wanted = [...new Set([1, total, page - 1, page, page + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const items = [];
  wanted.forEach((p, i) => {
    if (i > 0 && p - wanted[i - 1] > 1) items.push(`gap-${p}`);
    items.push(p);
  });
  return items;
};

const pageButton =
  'grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        className={`${pageButton} border-white/10 bg-white/5 text-slate-200 hover:bg-white/10`}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      {buildPages(page, totalPages).map((item) =>
        typeof item === 'string' ? (
          <span key={item} className="px-1 text-slate-500" aria-hidden="true">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            className={`${pageButton} ${
              item === page
                ? 'border-brand bg-brand/20 text-white'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        className={`${pageButton} border-white/10 bg-white/5 text-slate-200 hover:bg-white/10`}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
