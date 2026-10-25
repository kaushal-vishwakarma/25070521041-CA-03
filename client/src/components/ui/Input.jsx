import { forwardRef, useId } from 'react';

// Labelled text input with error + hint text, wired for screen readers
// (label <-> input via htmlFor, errors via aria-describedby / aria-invalid).
// NOTE: we do not set the HTML "required" attribute; forms use noValidate and our own messages.
const Input = forwardRef(function Input(
  { label, error, hint, id, required, icon: Icon, rightSlot, className = '', inputClassName = '', ...props },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;
  const describedBy = error || hint ? `${inputId}-desc` : undefined;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="label">
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
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy}
          className={['input', Icon && 'pl-10', rightSlot && 'pr-11', error && 'input-error', inputClassName]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {rightSlot && <div className="absolute inset-y-0 right-0 flex items-center pr-2">{rightSlot}</div>}
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

export default Input;
