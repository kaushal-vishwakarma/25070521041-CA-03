import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { PageLoader } from './ui/Spinner.jsx';
import { ROUTES, dashboardPathFor } from '../utils/routes.js';

// Guards a group of routes:
//   <Route element={<ProtectedRoute roles={['student']} />}> ...student pages... </Route>
// - still checking the session -> spinner (prevents a flash of the login page)
// - not logged in              -> /login (remembers where the user wanted to go)
// - wrong role                 -> sent to their own dashboard
// This only improves the experience. The REAL protection is on the server (middleware).
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Checking your session..." />;
  if (!user) return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={dashboardPathFor(user.role)} replace />;
  return <Outlet />;
}
