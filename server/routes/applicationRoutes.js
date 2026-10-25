import { Router } from 'express';
import {
  applyToInternship,
  getMyApplications,
  getInternshipApplicants,
  updateApplicationStatus,
  withdrawApplication,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { idParam } from '../validators/commonValidators.js';
import {
  applyRules,
  updateStatusRules,
  applicantListRules,
  studentApplicationListRules,
} from '../validators/applicationValidators.js';

const router = Router();

router.use(protect); // every application route requires login

// Static paths first, then parameterized ones.
router.get('/student/mine', authorize('student'), studentApplicationListRules, validate, getMyApplications);
router.get(
  '/internship/:internshipId',
  authorize('recruiter'),
  idParam('internshipId'),
  applicantListRules,
  validate,
  getInternshipApplicants
);

router.post('/:internshipId', authorize('student'), idParam('internshipId'), applyRules, validate, applyToInternship);
router.patch(
  '/:applicationId/status',
  authorize('recruiter'),
  idParam('applicationId'),
  updateStatusRules,
  validate,
  updateApplicationStatus
);
router.patch('/:applicationId/withdraw', authorize('student'), idParam('applicationId'), validate, withdrawApplication);

export default router;
