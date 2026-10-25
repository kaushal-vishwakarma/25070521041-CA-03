import Internship from '../models/Internship.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

// GET /api/stats   (public)
// Numbers for the landing page. Every value is counted from real database records.
// Only counts are returned: no names, emails or other personal data.
export const getPublicStats = asyncHandler(async (req, res) => {
  const open = { status: 'active', applicationDeadline: { $gt: new Date() } };

  const [openInternships, companies, students, applications] = await Promise.all([
    Internship.countDocuments(open),
    Internship.distinct('companyName', open),
    User.countDocuments({ role: 'student' }),
    Application.countDocuments(),
  ]);

  sendSuccess(res, 200, 'Platform statistics', {
    openInternships,
    companies: companies.length,
    students,
    applications,
  });
});
