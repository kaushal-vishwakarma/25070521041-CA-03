import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';

export const AuthContext = createContext(null);

// Keeps "who is logged in" in one place for the whole app.
// The JWT itself lives in an HttpOnly cookie that JavaScript cannot read, so on page load
// we ask the server (GET /auth/me) whether the cookie is still valid.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until the first /auth/me check finishes

  useEffect(() => {
    let active = true;
    authService
      .getMe()
      .then((me) => active && setUser(me))
      .catch(() => active && setUser(null)) // 401 simply means "not logged in"
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // api.js fires this event when a protected request returns 401 (e.g. session expired).
  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = useCallback(async (credentials) => {
    const me = await authService.login(credentials);
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (payload) => {
    const me = await authService.register(payload);
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null); // always clear the UI state, even if the request failed
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isStudent: user?.role === 'student',
      isRecruiter: user?.role === 'recruiter',
      login,
      register,
      logout,
      setUser, // used after profile edits so the navbar updates
    }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
