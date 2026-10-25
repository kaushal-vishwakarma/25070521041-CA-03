import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, Menu, UserCircle, X } from 'lucide-react';
import Logo from './Logo.jsx';
import Avatar from './ui/Avatar.jsx';
import Button from './ui/Button.jsx';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';
import { ROUTES, dashboardPathFor, profilePathFor } from '../utils/routes.js';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-white/10 text-white' : 'text-muted hover:bg-white/5 hover:text-white'
  }`;

const menuItemClass =
  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5';

// Role-aware top navigation:
//   visitors -> Login / Register
//   students and recruiters -> "Dashboard" link and an account menu (their own profile + logout)
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menus whenever the page changes.
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Close the account menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('You have been logged out.');
    } finally {
      navigate(ROUTES.home);
    }
  };

  const dashboardPath = user ? dashboardPathFor(user.role) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/80 backdrop-blur-lg">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            <NavLink to={ROUTES.home} end className={linkClass}>
              Home
            </NavLink>
            <NavLink to={ROUTES.internships} className={linkClass}>
              Internships
            </NavLink>
            {isAuthenticated && (
              <NavLink to={dashboardPath} className={linkClass}>
                Dashboard
              </NavLink>
            )}
          </nav>
        </div>

        {/* Desktop right side */}
        <div className="hidden items-center gap-2 md:flex">
          {!isAuthenticated ? (
            <>
              <Button to={ROUTES.login} variant="ghost">
                Log in
              </Button>
              <Button to={ROUTES.register}>Sign up</Button>
            </>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3 hover:bg-white/10"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <Avatar name={user.name} size="sm" rounded="rounded-lg" />
                <span className="max-w-[9rem] truncate text-sm font-medium text-white">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
              </button>

              {menuOpen && (
                <div role="menu" className="card absolute right-0 mt-2 w-60 p-2">
                  <div className="border-b border-white/10 px-3 pb-2 pt-1">
                    <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                    <p className="mt-1 text-xs capitalize text-accent">{user.role}</p>
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <Link to={dashboardPath} role="menuitem" className={menuItemClass}>
                      <LayoutDashboard className="h-4 w-4 text-muted" aria-hidden="true" /> Dashboard
                    </Link>
                    <Link to={profilePathFor(user.role)} role="menuitem" className={menuItemClass}>
                      <UserCircle className="h-4 w-4 text-muted" aria-hidden="true" /> My profile
                    </Link>
                    <button type="button" role="menuitem" onClick={handleLogout} className={`${menuItemClass} text-red-300`}>
                      <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="rounded-lg p-2 text-slate-200 hover:bg-white/5 md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-white/10 bg-ink md:hidden">
          <nav className="container-page flex flex-col gap-1 py-3" aria-label="Mobile">
            <NavLink to={ROUTES.home} end className={linkClass}>
              Home
            </NavLink>
            <NavLink to={ROUTES.internships} className={linkClass}>
              Internships
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to={dashboardPath} className={linkClass}>
                  Dashboard
                </NavLink>
                <NavLink to={profilePathFor(user.role)} className={linkClass}>
                  My profile
                </NavLink>
                <div className="mt-2 flex items-center gap-3 border-t border-white/10 pt-3">
                  <Avatar name={user.name} size="sm" rounded="rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{user.name}</p>
                    <p className="truncate text-xs capitalize text-muted">{user.role}</p>
                  </div>
                  <Button variant="secondary" size="sm" icon={LogOut} onClick={handleLogout}>
                    Log out
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
                <Button to={ROUTES.login} variant="secondary">
                  Log in
                </Button>
                <Button to={ROUTES.register}>Sign up</Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
