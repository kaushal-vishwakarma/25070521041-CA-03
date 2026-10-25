import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Internship from '../models/Internship.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { escapeRegex } from '../utils/helpers.js';
import { APPLICATION_STATUSES } from '../utils/constants.js';
import { withOpenFlag } from './internshipController.js';

// Turns aggregate rows [{_id:'Applied', count:2}] into {Applied:2, 'Under Review':0, ...}
const countsByStatus = (rows) => {
  const counts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0]));
  rows.forEach((row) => {
    counts[row._id] = row.count;
  });
  return counts;
};

const toBreakdown = (counts) => APPLICATION_STATUSES.map((status) => ({ name: status, value: counts[status] }));

// GET /api/dashboard/student
// Every number below is calculated from real database records.
export const getStudentDashboard = asyncHandler(async (req, res) => {
  const student = req.user;

  const [rows, recentActivity, appliedIds] = await Promise.all([
    Application.aggregate([
      { $match: { student: student._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Application.find({ student: student._id })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('internship', 'title companyName'),
    Application.distinct('internship', { student: student._id }),
  ]);

  const counts = countsByStatus(rows);
  const total = APPLICATION_STATUSES.reduce((sum, s) => sum + counts[s], 0);

  // Recommendations: open internships sharing at least one skill with the student.
  const openFilter = {
    status: 'active',
    applicationDeadline: { $gt: new Date() },
    _id: { $nin: appliedIds },
  };
  const mySkills = student.skills.map((s) => s.toLowerCase());
  let recommended = [];
  let recommendedBySkills = false;

  if (mySkills.length > 0) {
    const regexes = student.skills.map((s) => new RegExp(`^${escapeRegex(s)}$`, 'i'));
    const candidates = await Internship.find({ ...openFilter, requiredSkills: { $in: regexes } })
      .sort({ applicationDeadline: 1 })
      .limit(50)
      .lean();

    recommended = candidates
      .map((item) => {
        const matchedSkills = item.requiredSkills.filter((s) => mySkills.includes(s.toLowerCase()));
        return { ...withOpenFlag(item), matchedSkills, matchCount: matchedSkills.length };
      })
      .sort((a, b) => b.matchCount - a.matchCount)
      .slice(0, 6);
    recommendedBySkills = recommended.length > 0;
  }

  if (recommended.length === 0) {
    // No skills on the profile (or no matches): fall back to the newest open internships.
    const latest = await Internship.find(openFilter).sort({ createdAt: -1 }).limit(6).lean();
    recommended = latest.map((item) => ({ ...withOpenFlag(item), matchedSkills: [], matchCount: 0 }));
  }

  sendSuccess(res, 200, 'Student dashboard fetched', {
    profile: {
      name: student.name,
      email: student.email,
      college: student.college,
      skills: student.skills,
      resumeUrl: student.resumeUrl,
    },
    stats: {
      total,
      applied: counts.Applied,
      underReview: counts['Under Review'],
      pending: counts.Applied + counts['Under Review'],
      shortlisted: counts.Shortlisted,
      rejected: counts.Rejected,
      accepted: counts.Accepted,
      saved: student.savedInternships.length,
    },
    statusBreakdown: toBreakdown(counts),
    recentActivity,
    recommended,
    recommendedBySkills,
  });
});

// GET /api/dashboard/recruiter
export const getRecruiterDashboard = asyncHandler(async (req, res) => {
  const internships = await Internship.find({ recruiter: req.user._id })
    .select('title status applicationDeadline')
    .lean();
  const ids = internships.map((i) => i._id);
  const now = new Date();

  // "Active" = status active AND deadline in the future. Everything else counts as closed
  // (manually closed or deadline passed).
  const active = internships.filter((i) => i.status === 'active' && i.applicationDeadline > now).length;

  let counts = countsByStatus([]);
  let topInternships = [];
  let recentApplicants = [];

  if (ids.length > 0) {
    const [rows, perInternship, recent] = await Promise.all([
      Application.aggregate([
        { $match: { internship: { $in: ids } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Application.aggregate([
        { $match: { internship: { $in: ids } } },
        { $group: { _id: '$internship', applicants: { $sum: 1 } } },
        { $sort: { applicants: -1 } },
        { $limit: 5 },
      ]),
      Application.find({ internship: { $in: ids } })
        .sort({ appliedAt: -1 })
        .limit(5)
        .populate('student', 'name college')
        .populate('internship', 'title'),
    ]);
    counts = countsByStatus(rows);
    recentApplicants = recent;
    const titleMap = new Map(internships.map((i) => [String(i._id), i.title]));
    topInternships = perInternship.map((row) => ({
      internshipId: row._id,
      title: titleMap.get(String(row._id)) || 'Untitled',
      applicants: row.applicants,
    }));
  }

  const totalApplicants = APPLICATION_STATUSES.reduce((sum, s) => sum + counts[s], 0);

  sendSuccess(res, 200, 'Recruiter dashboard fetched', {
    stats: {
      totalInternships: internships.length,
      activeInternships: active,
      closedInternships: internships.length - active,
      totalApplicants,
      shortlisted: counts.Shortlisted,
      accepted: counts.Accepted,
    },
    statusBreakdown: toBreakdown(counts),
    topInternships,
    recentApplicants,
  });
});
