import User from '../models/User.js';
import Internship from '../models/Internship.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { normalizeList } from '../utils/helpers.js';
import { withOpenFlag } from './internshipController.js';

// GET /api/users/profile
export const getProfile = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'Profile fetched', { user: req.user });
});

// PUT /api/users/profile
// Each role may edit only its own fields. role/email/password cannot be changed here.
export const updateProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const b = req.body;

  const allowed =
    user.role === 'student'
      ? ['name', 'college', 'resumeUrl', 'bio']
      : ['name', 'companyName', 'designation', 'bio'];

  allowed.forEach((field) => {
    if (b[field] !== undefined) user[field] = b[field];
  });
  if (user.role === 'student' && b.skills !== undefined) user.skills = normalizeList(b.skills);

  if (user.role === 'recruiter' && !user.companyName) {
    throw new ApiError(400, 'Company name cannot be empty');
  }

  await user.save();
  sendSuccess(res, 200, 'Profile updated', { user });
});

// GET /api/users/saved-internships   (student)
export const getSavedInternships = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'savedInternships',
    select: 'title companyName location workMode category stipendMin stipendMax applicationDeadline status duration requiredSkills',
  });
  sendSuccess(res, 200, 'Saved internships fetched', user.savedInternships.map(withOpenFlag));
});

// POST /api/users/saved-internships/:internshipId   (student)
export const saveInternship = asyncHandler(async (req, res) => {
  const { internshipId } = req.params;
  if (!(await Internship.exists({ _id: internshipId }))) {
    throw new ApiError(404, 'Internship not found');
  }
  // $addToSet never inserts the same id twice.
  await User.updateOne({ _id: req.user._id }, { $addToSet: { savedInternships: internshipId } });
  sendSuccess(res, 200, 'Internship saved', { internshipId });
});

// DELETE /api/users/saved-internships/:internshipId   (student)
export const unsaveInternship = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $pull: { savedInternships: req.params.internshipId } });
  sendSuccess(res, 200, 'Internship removed from saved', { internshipId: req.params.internshipId });
});
