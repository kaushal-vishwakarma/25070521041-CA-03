import { Router } from 'express';
import {
  listInternships,
  getInternship,
  createInternship,
  updateInternship,
  deleteInternship,
  getMyInternships,
} from '../controllers/internshipController.js';
import { protect, optionalAuth, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { idParam } from '../validators/commonValidators.js';
import {
  createInternshipRules,
  updateInternshipRules,
  listInternshipRules,
  myInternshipRules,
} from '../validators/internshipValidators.js';

const router = Router();

// Public
router.get('/', listInternshipRules, validate, listInternships);

// IMPORTANT: this static route must be declared BEFORE '/:id',
// otherwise Express would treat the word "recruiter" as an id.
router.get('/recruiter/mine', protect, authorize('recruiter'), myInternshipRules, validate, getMyInternships);

router.get('/:id', optionalAuth, idParam('id'), validate, getInternship);

// Recruiter only
router.post('/', protect, authorize('recruiter'), createInternshipRules, validate, createInternship);
router.put('/:id', protect, authorize('recruiter'), idParam('id'), updateInternshipRules, validate, updateInternship);
router.delete('/:id', protect, authorize('recruiter'), idParam('id'), validate, deleteInternship);

export default router;
