import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

const tooMany = (message) => ({ success: false, message });

// Strict limit for login/register (slows down password guessing).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.isProduction ? 20 : 100, // relaxed in development so testing is not annoying
  standardHeaders: true,
  legacyHeaders: false,
  message: tooMany('Too many attempts. Please try again in 15 minutes.'),
});

// Generous limit for the whole API (basic abuse protection).
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooMany('Too many requests. Please slow down.'),
});
