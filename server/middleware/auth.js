import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { COOKIE_NAME, clearAuthCookie } from '../utils/token.js';
import { isValidObjectId } from '../utils/helpers.js';

// Verifies the JWT and returns the matching user, or throws ApiError(401).
const resolveUser = async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new ApiError(401, 'Authentication required. Please log in.');

  let decoded;
  try {
    // Only accept the algorithm we sign with (blocks "alg" tampering tricks).
    decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    clearAuthCookie(res);
    const message =
      err.name === 'TokenExpiredError'
        ? 'Your session has expired. Please log in again.'
        : 'Invalid authentication token. Please log in again.';
    throw new ApiError(401, message);
  }

  if (!isValidObjectId(decoded.id)) {
    clearAuthCookie(res);
    throw new ApiError(401, 'Invalid authentication token. Please log in again.');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    clearAuthCookie(res);
    throw new ApiError(401, 'This account no longer exists.');
  }
  return user;
};

// Requires a logged-in user. Sets req.user.
export const protect = asyncHandler(async (req, res, next) => {
  req.user = await resolveUser(req, res);
  next();
});

// For public routes that can show extra info to a logged-in viewer.
// Never fails: if there is no valid token, the request continues as anonymous.
export const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    req.user = await resolveUser(req, res);
  } catch (err) {
    if (!(err instanceof ApiError)) throw err; // real server error -> bubble up
    req.user = undefined;
  }
  next();
});

// Role-based authorization. Use AFTER protect: authorize('recruiter')
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action.');
    }
    next();
  };
