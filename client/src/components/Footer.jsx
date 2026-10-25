import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { ROUTES } from '../utils/routes.js';

const linkClass = 'text-sm text-muted transition hover:text-white';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-black/20">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">
            Discover internships that match your skills, apply in minutes and track every application in one place.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">For students</h2>
          <ul className="mt-4 space-y-2.5">
            <li><Link to={ROUTES.internships} className={linkClass}>Browse internships</Link></li>
            <li><Link to={ROUTES.register} className={linkClass}>Create an account</Link></li>
            <li><Link to={ROUTES.login} className={linkClass}>Log in</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">For recruiters</h2>
          <ul className="mt-4 space-y-2.5">
            <li><Link to={ROUTES.register} className={linkClass}>Post an internship</Link></li>
            <li><Link to={ROUTES.login} className={linkClass}>Recruiter login</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">About this project</h2>
          <p className="mt-4 text-sm text-muted">
            CareerHub is a BTech CSE academic project built with React, Express and MongoDB. Companies, testimonials
            and sample listings are fictional demo content.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} CareerHub. Academic project.</p>
          <p>Built with React, Node.js, Express and MongoDB.</p>
        </div>
      </div>
    </footer>
  );
}
