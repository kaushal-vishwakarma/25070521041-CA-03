import { Router } from 'express';
import { getStudentDashboard, getRecruiterDashboard } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/student', protect, authorize('student'), getStudentDashboard);
router.get('/recruiter', protect, authorize('recruiter'), getRecruiterDashboard);

export default router;
