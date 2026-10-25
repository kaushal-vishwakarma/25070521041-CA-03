import axios from 'axios';

// One shared Axios instance for the whole app.
// - baseURL '/api'      -> in development Vite proxies this to the Express server
// - withCredentials     -> the browser sends/receives the HttpOnly auth cookie
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
});

// If a protected request comes back 401 (for example an expired session), tell the
// AuthContext so it can log the user out in the UI. Auth endpoints are excluded,
// because GET /auth/me legitimately returns 401 for visitors who are not logged in.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    if (status === 401 && !url.startsWith('/auth/')) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

// Turns any Axios error into a message that is safe and useful to show in a toast.
export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (error?.request) return 'Cannot reach the server. Please check that the backend is running.';
  return fallback;
};

// Converts the server's validation errors [{field, message}] into { field: message }
// so forms can show each message under the right input.
export const getFieldErrors = (error) => {
  const list = error?.response?.data?.errors;
  if (!Array.isArray(list)) return {};
  return Object.fromEntries(list.map((item) => [item.field, item.message]));
};

// Removes empty filters so we never send things like ?category=&search=
export const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );

export default api;
