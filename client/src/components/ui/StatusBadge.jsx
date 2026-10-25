import { STATUS_STYLES } from '../../utils/constants.js';

// Colored pill for an application status: Applied, Under Review, Shortlisted, Rejected, Accepted.
export default function StatusBadge({ status, className = '' }) {
  return (
    <span className={['badge', STATUS_STYLES[status] || 'border-white/10 bg-white/5 text-slate-300', className].join(' ')}>
      {status}
    </span>
  );
}
