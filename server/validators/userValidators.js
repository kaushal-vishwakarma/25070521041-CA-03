import { body } from 'express-validator';

const optionalText = (name, max, label) =>
  body(name)
    .optional()
    .isString().withMessage(`${label} must be text`).bail()
    .trim()
    .isLength({ max }).withMessage(`${label} must be at most ${max} characters`);

export const updateProfileRules = [
  body('name')
    .optional()
    .isString().withMessage('Name must be text').bail()
    .trim()
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  optionalText('college', 150, 'College'),
  optionalText('bio', 1000, 'Bio'),
  optionalText('companyName', 120, 'Company name'),
  optionalText('designation', 120, 'Designation'),
  body('skills')
    .optional()
    .custom((value) => {
      if (!Array.isArray(value) && typeof value !== 'string') throw new Error('Skills must be a list');
      return true;
    }),
  body('resumeUrl')
    .optional()
    .isString().withMessage('Resume URL must be text').bail()
    .trim()
    .if(body('resumeUrl').notEmpty())
    .isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Resume URL must be a valid http(s) link')
    .isLength({ max: 500 }).withMessage('Resume URL is too long'),
];
