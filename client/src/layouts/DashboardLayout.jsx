import { NavLink, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import useAuth from '../hooks/useAuth.js';
import { STUDENT_NAV, RECRUITER_NAV } from '../utils/navigation.js';

const itemClass = ({ isActive }) =>
  `flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-brand/15 text-white ring-1 ring-brand/40'
      : 'text-muted hover:bg-white/5 hover:text-white'
  }`;

// Sidebar on large screens, horizontally scrollable tabs on phones/tablets.
// Which links appear depends on the logged-in user's role.
export default function DashboardLayout() {
  const { user } = useAuth();
  const items = user.role === 'recruiter' ? RECRUITER_NAV : STUDENT_NAV;
  const subtitle = user.role === 'recruiter' ? user.companyName : user.college;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container-page flex-1 py-6 lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8 lg:py-8">
        <aside className="mb-6 lg:sticky lg:top-24 lg:mb-0 lg:self-start">
          <div className="card hidden p-4 lg:block">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{user.name}</p>
                <p className="truncate text-xs capitalize text-accent">{user.role}</p>
              </div>
            </div>
            {subtitle && <p className="mt-3 truncate text-xs text-muted">{subtitle}</p>}
          </div>

          <nav
            aria-label="Dashboard"
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:mt-4 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
          >
            {items.map(({ label, to, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={itemClass}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main id="main" className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
