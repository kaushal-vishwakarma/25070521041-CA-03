import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Internship from '../models/Internship.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';
import { escapeRegex } from '../utils/helpers.js';
import { WITHDRAWABLE_STATUSES, APPLICATION_STATUSES } from '../utils/constants.js';

const str = (value) => (typeof value === 'string' ? value.trim() : '');

const INTERNSHIP_CARD_FIELDS =
  'title companyName location workMode category stipendMin stipendMax applicationDeadline status duration';

// POST /api/applications/:internshipId   (student)
export const applyToInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.internshipId);
  if (!internship) throw new ApiError(404, 'Internship not found');

  // Deadline + status enforcement happens on the server, not just in React.
  if (internship.status !== 'active') {
    throw new ApiError(400, 'This internship is closed and no longer accepting applications');
  }
  if (internship.applicationDeadline <= new Date()) {
    throw new ApiError(400, 'The application deadline for this internship has passed');
  }

  if (await Application.exists({ student: req.user._id, internship: internship._id })) {
    throw new ApiError(409, 'You have already applied to this internship');
  }

  // The unique compound index is the real guarantee; if two requests race,
  // the database rejects the second (error 11000 -> 409 in errorHandler).
  const application = await Application.create({
    student: req.user._id,
    internship: internship._id,
    coverLetter: req.body.coverLetter || '',
    resumeUrl: req.body.resumeUrl || req.user.resumeUrl || '',
    // status is NOT read from the body: it always starts as "Applied".
  });

  sendSuccess(res, 201, 'Application submitted successfully', application);
});

// GET /api/applications/student/mine   (student)
export const getMyApplications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 10 });

  const filter = { student: req.user._id };
  if (str(req.query.status)) filter.status = str(req.query.status);

  const [items, total] = await Promise.all([
    Application.find(filter)
      .sort({ appliedAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate('internship', INTERNSHIP_CARD_FIELDS),
    Application.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Applications fetched', items, buildMeta(total, page, limit));
});

// GET /api/applications/internship/:internshipId   (recruiter who owns it)
export const getInternshipApplicants = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.internshipId).select('recruiter title');
  if (!internship) throw new ApiError(404, 'Internship not found');
  if (!internship.recruiter.equals(req.user._id)) {
    throw new ApiError(403, 'You can only view applicants of your own internships');
  }

  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 10 });
  const filter = { internship: internship._id };
  if (str(req.query.status)) filter.status = str(req.query.status);

  // Search by student name / college / skill: find matching students first.
  const search = str(req.query.search);
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    const students = await User.find({
      role: 'student',
      $or: [{ name: rx }, { college: rx }, { skills: rx }],
    })
      .select('_id')
      .limit(500)
      .lean();
    filter.student = { $in: students.map((s) => s._id) };
  }

  const [items, total, statusRows] = await Promise.all([
    Application.find(filter)
      .sort({ appliedAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate('student', 'name email college skills resumeUrl bio'),
    Application.countDocuments(filter),
    // counts per status for the whole internship (ignores filters; used for tabs/badges)
    Application.aggregate([
      { $match: { internship: new mongoose.Types.ObjectId(String(internship._id)) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const statusCounts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0]));
  statusRows.forEach((row) => {
    statusCounts[row._id] = row.count;
  });

  sendSuccess(res, 200, 'Applicants fetched', items, {
    ...buildMeta(total, page, limit),
    statusCounts,
    internship: { _id: internship._id, title: internship.title },
  });
});

// PATCH /api/applications/:applicationId/status   (recruiter who owns the internship)
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.applicationId).populate('internship', 'recruiter');
  if (!application) throw new ApiError(404, 'Application not found');

  const ownerId = application.internship?.recruiter;
  if (!ownerId || !ownerId.equals(req.user._id)) {
    throw new ApiError(403, 'You can only update applicants of your own internships');
  }

  application.status = req.body.status;
  await application.save();

  const updated = await Application.findById(application._id)
    .populate('student', 'name email college skills resumeUrl bio')
    .populate('internship', 'title companyName');
  sendSuccess(res, 200, `Application marked as ${updated.status}`, updated);
});

// PATCH /api/applications/:applicationId/withdraw   (the student who applied)
export const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.applicationId);
  if (!application) throw new ApiError(404, 'Application not found');
  if (!application.student.equals(req.user._id)) {
    throw new ApiError(403, 'You can only withdraw your own applications');
  }
  if (!WITHDRAWABLE_STATUSES.includes(application.status)) {
    throw new ApiError(400, `An application with status "${application.status}" can no longer be withdrawn`);
  }

  // Withdrawal removes the record, so the student may re-apply later if the listing is still open.
  await application.deleteOne();
  sendSuccess(res, 200, 'Application withdrawn');
});
