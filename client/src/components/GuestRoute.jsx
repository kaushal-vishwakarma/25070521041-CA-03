import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { PageLoader } from './ui/Spinner.jsx';
import { canAccessPath, dashboardPathFor } from '../utils/routes.js';

// For /login and /register.
// A logged-in user is redirected away. Right after a successful login this is also what moves them on:
// to the page they originally wanted (saved by ProtectedRoute), or else to their own dashboard.
export default function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Loading..." />;
  if (user) {
    const from = location.state?.from?.pathname;
    const target = from && canAccessPath(user.role, from) ? from : dashboardPathFor(user.role);
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}
