import { body, query } from 'express-validator';
import { APPLICATION_STATUSES } from '../utils/constants.js';
import { paginationQuery } from './commonValidators.js';

export const applyRules = [
  body('coverLetter')
    .optional()
    .isString().withMessage('Cover letter must be text').bail()
    .trim()
    .isLength({ max: 2000 }).withMessage('Cover letter must be at most 2000 characters'),
  body('resumeUrl')
    .optional()
    .isString().withMessage('Resume URL must be text').bail()
    .trim()
    .if(body('resumeUrl').notEmpty())
    .isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Resume URL must be a valid http(s) link')
    .isLength({ max: 500 }).withMessage('Resume URL is too long'),
];

export const updateStatusRules = [
  body('status').isIn(APPLICATION_STATUSES).withMessage(`Status must be one of: ${APPLICATION_STATUSES.join(', ')}`),
];

export const applicantListRules = [
  ...paginationQuery,
  query('status').optional().isIn(APPLICATION_STATUSES).withMessage('Invalid status filter'),
  query('search').optional().isString().bail().isLength({ max: 100 }).withMessage('search is too long'),
];

export const studentApplicationListRules = [
  ...paginationQuery,
  query('status').optional().isIn(APPLICATION_STATUSES).withMessage('Invalid status filter'),
];
