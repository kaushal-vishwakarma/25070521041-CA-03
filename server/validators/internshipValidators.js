import { body, query } from 'express-validator';
import {
  CATEGORIES,
  WORK_MODES,
  INTERNSHIP_TYPES,
  DURATIONS,
  INTERNSHIP_STATUSES,
} from '../utils/constants.js';
import { normalizeList } from '../utils/helpers.js';
import { paginationQuery } from './commonValidators.js';

// "2026-12-31" from a date input becomes the END of that day (UTC),
// so a listing stays open for the whole last day.
const toEndOfDay = (value) => (/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T23:59:59.999Z` : value);

const mustBeListInput = (value) => {
  if (!Array.isArray(value) && typeof value !== 'string') {
    throw new Error('Must be a list of text values');
  }
  return true;
};

// Builds the rules for create (everything required) or update (everything optional).
const buildRules = (isCreate) => {
  const field = (name) => (isCreate ? body(name) : body(name).optional());

  const rules = [
    field('title')
      .isString().withMessage('Title is required').bail()
      .trim()
      .isLength({ min: 3, max: 120 }).withMessage('Title must be 3-120 characters'),
    field('description')
      .isString().withMessage('Description is required').bail()
      .trim()
      .isLength({ min: 20, max: 5000 }).withMessage('Description must be 20-5000 characters'),
    field('category').isIn(CATEGORIES).withMessage('Please choose a valid category'),
    field('location')
      .isString().withMessage('Location is required').bail()
      .trim()
      .isLength({ min: 2, max: 120 }).withMessage('Location must be 2-120 characters'),
    field('workMode').isIn(WORK_MODES).withMessage('Work mode must be Remote, Hybrid, or On-site'),
    field('duration').isIn(DURATIONS).withMessage('Please choose a valid duration'),
    body('internshipType').optional().isIn(INTERNSHIP_TYPES).withMessage('Invalid internship type'),
    // companyName is optional on create: the controller falls back to the recruiter's company.
    body('companyName')
      .optional()
      .isString().bail()
      .trim()
      .isLength({ min: 1, max: 120 }).withMessage('Company name must be 1-120 characters'),
    body('stipendMin').optional().isInt({ min: 0, max: 1000000 }).withMessage('Minimum stipend must be 0-1,000,000').toInt(),
    body('stipendMax')
      .optional()
      .isInt({ min: 0, max: 1000000 }).withMessage('Maximum stipend must be 0-1,000,000')
      .toInt()
      .custom((value, { req }) => {
        if (req.body.stipendMin !== undefined && value < req.body.stipendMin) {
          throw new Error('Maximum stipend must be greater than or equal to minimum stipend');
        }
        return true;
      }),
    body('vacancies').optional().isInt({ min: 1, max: 1000 }).withMessage('Vacancies must be 1-1000').toInt(),
    body('responsibilities').optional().custom(mustBeListInput),
    isCreate
      ? body('requiredSkills')
          .custom(mustBeListInput)
          .custom((value) => {
            const list = normalizeList(Array.isArray(value) ? value : String(value));
            if (list.length === 0) throw new Error('Add at least one required skill');
            return true;
          })
      : body('requiredSkills').optional().custom(mustBeListInput),
  ];

  if (isCreate) {
    rules.push(
      body('applicationDeadline')
        .isISO8601({ strict: true }).withMessage('Application deadline is required and must be a valid date').bail()
        .customSanitizer(toEndOfDay)
        .custom((value) => {
          if (new Date(value) <= new Date()) throw new Error('Application deadline must be in the future');
          return true;
        })
    );
  } else {
    rules.push(
      body('applicationDeadline')
        .optional()
        .isISO8601({ strict: true }).withMessage('Application deadline must be a valid date').bail()
        .customSanitizer(toEndOfDay),
      body('status').optional().isIn(INTERNSHIP_STATUSES).withMessage('Status must be active or closed')
    );
  }
  return rules;
};

export const createInternshipRules = buildRules(true);
export const updateInternshipRules = buildRules(false);

// Public listing filters: GET /api/internships
export const listInternshipRules = [
  ...paginationQuery,
  query('search').optional().isString().withMessage('search must be text').bail().isLength({ max: 100 }).withMessage('search is too long'),
  query('location').optional().isString().withMessage('location must be text').bail().isLength({ max: 100 }).withMessage('location is too long'),
  query('category').optional().isIn(CATEGORIES).withMessage('Invalid category'),
  query('workMode').optional().isIn(WORK_MODES).withMessage('Invalid work mode'),
  query('duration').optional().isIn(DURATIONS).withMessage('Invalid duration'),
  query('minStipend').optional().isInt({ min: 0, max: 1000000 }).withMessage('minStipend must be a non-negative integer'),
  query('maxStipend').optional().isInt({ min: 0, max: 1000000 }).withMessage('maxStipend must be a non-negative integer'),
  query('sort').optional().isIn(['newest', 'deadline', 'stipend_high', 'stipend_low']).withMessage('Invalid sort option'),
];

// Recruiter "my internships": GET /api/internships/recruiter/mine
export const myInternshipRules = [
  ...paginationQuery,
  query('search').optional().isString().bail().isLength({ max: 100 }),
  query('status').optional().isIn(INTERNSHIP_STATUSES).withMessage('Status must be active or closed'),
];
