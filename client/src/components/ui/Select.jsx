import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

// options can be plain strings ['Remote','Hybrid'] or objects [{ value, label }].
// placeholder adds a first empty option (value "") such as "All categories".
const Select = forwardRef(function Select(
  { label, error, hint, id, required, options = [], placeholder, className = '', ...props },
  ref
) {
  const autoId = useId();
  const selectId = id || autoId;
  const describedBy = error || hint ? `${selectId}-desc` : undefined;
  const normalized = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));

  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="label">
          {label}
          {required && (
            <span className="text-red-400" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy}
          className={['input appearance-none pr-10', error && 'input-error'].filter(Boolean).join(' ')}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {normalized.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
      </div>
      {error ? (
        <p id={describedBy} className="field-error" role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={describedBy} className="mt-1.5 text-xs text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
});

export default Select;
