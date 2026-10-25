import { body } from 'express-validator';
import { ROLES } from '../utils/constants.js';

export const registerRules = [
  body('name')
    .isString().withMessage('Name is required').bail()
    .trim()
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('email')
    .isString().withMessage('Email is required').bail()
    .trim()
    .isEmail().withMessage('Please provide a valid email').bail()
    .customSanitizer((value) => value.toLowerCase()),
  body('password')
    .isString().withMessage('Password is required').bail()
    .isLength({ min: 8, max: 72 }).withMessage('Password must be 8-72 characters').bail()
    .matches(/[A-Za-z]/).withMessage('Password must contain at least one letter').bail()
    .matches(/\d/).withMessage('Password must contain at least one number'),
  body('confirmPassword')
    .optional()
    .custom((value, { req }) => {
      if (value !== req.body.password) throw new Error('Passwords do not match');
      return true;
    }),
  body('role')
    .isIn(ROLES).withMessage('Role must be student or recruiter'),
  // student-only (optional)
  body('college').optional().isString().bail().trim().isLength({ max: 150 }).withMessage('College is too long'),
  body('skills').optional(),
  // recruiter-only
  body('companyName')
    .if(body('role').equals('recruiter'))
    .isString().withMessage('Company name is required for recruiters').bail()
    .trim()
    .isLength({ min: 1, max: 120 }).withMessage('Company name is required (max 120 characters)'),
  body('designation')
    .optional()
    .isString().bail()
    .trim()
    .isLength({ max: 120 }).withMessage('Designation is too long'),
];

export const loginRules = [
  body('email')
    .isString().withMessage('Email is required').bail()
    .trim()
    .isEmail().withMessage('Please provide a valid email').bail()
    .customSanitizer((value) => value.toLowerCase()),
  body('password')
    .isString().withMessage('Password is required').bail()
    .notEmpty().withMessage('Password is required'),
];
