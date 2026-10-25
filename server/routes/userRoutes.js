import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getSavedInternships,
  saveInternship,
  unsaveInternship,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { idParam } from '../validators/commonValidators.js';
import { updateProfileRules } from '../validators/userValidators.js';

const router = Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfileRules, validate, updateProfile);

router.get('/saved-internships', authorize('student'), getSavedInternships);
router.post('/saved-internships/:internshipId', authorize('student'), idParam('internshipId'), validate, saveInternship);
router.delete('/saved-internships/:internshipId', authorize('student'), idParam('internshipId'), validate, unsaveInternship);

export default router;
