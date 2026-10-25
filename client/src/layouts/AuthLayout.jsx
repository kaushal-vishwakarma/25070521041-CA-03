import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { ROUTES } from '../utils/routes.js';

// Centered card for the login and register pages.
export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-8 sm:py-12">
      <div className="flex w-full max-w-lg items-center justify-between">
        <Logo />
        <Link to={ROUTES.home} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to home
        </Link>
      </div>
      <main id="main" className="mt-8 w-full max-w-lg flex-1 sm:mt-12">
        <Outlet />
      </main>
      <p className="mt-8 text-xs text-slate-500">CareerHub is an academic demo project.</p>
    </div>
  );
}
