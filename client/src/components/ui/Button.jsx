import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};
const SIZES = { sm: 'px-3 py-1.5 text-xs', md: '', lg: 'px-6 py-3 text-base' };

// <Button>Save</Button>                      normal button
// <Button to="/login">Log in</Button>        renders a router <Link> that looks like a button
// <Button loading>Saving...</Button>         shows a spinner and disables clicks
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  to,
  icon: Icon,
  type = 'button', // default "button" so it never submits a form by accident
  className = '',
  disabled,
  children,
  ...props
}) {
  const classes = [VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className].filter(Boolean).join(' ');

  const content = (
    <>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="h-4 w-4" aria-hidden="true" />
      )}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
}
