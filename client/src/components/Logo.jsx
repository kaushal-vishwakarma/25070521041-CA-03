import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { ROUTES } from '../utils/routes.js';

export default function Logo({ className = '' }) {
  return (
    <Link to={ROUTES.home} className={`inline-flex items-center gap-2.5 ${className}`} aria-label="CareerHub home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-accent shadow-glow">
        <Briefcase className="h-5 w-5 text-white" aria-hidden="true" />
      </span>
      <span className="text-lg font-bold tracking-tight text-white">
        Career<span className="text-accent">Hub</span>
      </span>
    </Link>
  );
}
