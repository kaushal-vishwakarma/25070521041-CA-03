import { param, query } from 'express-validator';
import { isValidObjectId } from '../utils/helpers.js';

// Rejects malformed MongoDB ids with a clean 400 instead of a database error.
export const idParam = (name = 'id') =>
  param(name).custom((value) => {
    if (!isValidObjectId(value)) throw new Error('Invalid ID format');
    return true;
  });

export const paginationQuery = [
  query('page').optional().isInt({ min: 1, max: 100000 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
];
