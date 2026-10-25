import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export const COOKIE_NAME = 'careerhub_token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const signToken = (userId) =>
  jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

// httpOnly   -> JavaScript cannot read the cookie (protects against XSS token theft)
// secure     -> HTTPS only in production
// sameSite   -> 'lax' blocks the cookie on cross-site POSTs (basic CSRF protection)
// NOTE: if you later host the API and client on DIFFERENT sites, you would need
// sameSite: 'none' with secure: true, plus extra CSRF protection.
const cookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax',
  path: '/',
});

export const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: SEVEN_DAYS_MS });
};

export const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions());
};
