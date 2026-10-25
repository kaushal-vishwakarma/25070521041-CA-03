import { forwardRef, useId } from 'react';

// Pass `value` and `maxLength` together to get a live character counter.
const Textarea = forwardRef(function Textarea(
  { label, error, hint, id, required, rows = 4, className = '', value, maxLength, ...props },
  ref
) {
  const autoId = useId();
  const areaId = id || autoId;
  const describedBy = error || hint ? `${areaId}-desc` : undefined;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={areaId} className="label">
          {label}
          {required && (
            <span className="text-red-400" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      <textarea
        ref={ref}
        id={areaId}
        rows={rows}
        value={value}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy}
        className={['input resize-y', error && 'input-error'].filter(Boolean).join(' ')}
        {...props}
      />
      <div className="mt-1.5 flex items-start justify-between gap-3">
        {error ? (
          <p id={describedBy} className="field-error !mt-0" role="alert">
            {error}
          </p>
        ) : (
          <p id={describedBy} className="text-xs text-muted">
            {hint}
          </p>
        )}
        {maxLength && typeof value === 'string' && (
          <span className="shrink-0 text-xs text-slate-500">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

export default Textarea;
