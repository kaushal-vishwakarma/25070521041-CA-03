import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';
import { escapeRegex, normalizeList } from '../utils/helpers.js';

// Adds a computed `isOpen` flag (status active AND deadline in the future).
export const withOpenFlag = (doc) => {
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    ...obj,
    isOpen: obj.status === 'active' && new Date(obj.applicationDeadline) > new Date(),
  };
};

// Only plain strings are accepted from the query string; objects such as
// ?category[$ne]=x are ignored (prevents NoSQL operator injection).
const str = (value) => (typeof value === 'string' ? value.trim() : '');

const toLines = (value, max = 15) =>
  normalizeList(Array.isArray(value) ? value : String(value ?? '').split(/\r?\n/), { max, maxLength: 300 });

const SORTS = {
  newest: { createdAt: -1, _id: -1 },
  deadline: { applicationDeadline: 1, _id: 1 },
  stipend_high: { stipendMax: -1, _id: -1 },
  stipend_low: { stipendMin: 1, _id: 1 },
};

// Loads an internship and makes sure the logged-in recruiter owns it.
const getOwnedInternship = async (id, user) => {
  const internship = await Internship.findById(id);
  if (!internship) throw new ApiError(404, 'Internship not found');
  if (!internship.recruiter.equals(user._id)) {
    throw new ApiError(403, 'You can only manage your own internships');
  }
  return internship;
};

// GET /api/internships   (public) - open listings only
export const listInternships = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 9 });
  const q = req.query;

  const filter = { status: 'active', applicationDeadline: { $gt: new Date() } };

  const search = str(q.search);
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: rx }, { companyName: rx }, { requiredSkills: rx }];
  }
  if (str(q.category)) filter.category = str(q.category);
  if (str(q.workMode)) filter.workMode = str(q.workMode);
  if (str(q.duration)) filter.duration = str(q.duration);
  if (str(q.location)) filter.location = new RegExp(escapeRegex(str(q.location)), 'i');
  if (str(q.minStipend)) filter.stipendMax = { $gte: parseInt(q.minStipend, 10) };
  if (str(q.maxStipend)) filter.stipendMin = { $lte: parseInt(q.maxStipend, 10) };

  const sort = SORTS[str(q.sort)] || SORTS.newest;

  const [items, total] = await Promise.all([
    Internship.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Internship.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Internships fetched', items.map(withOpenFlag), buildMeta(total, page, limit));
});

// GET /api/internships/:id   (public; extra `viewer` info when logged in)
export const getInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id).populate(
    'recruiter',
    'name companyName designation'
  );
  if (!internship) throw new ApiError(404, 'Internship not found');

  const data = withOpenFlag(internship);
  data.viewer = { loggedIn: false, hasApplied: false, applicationStatus: null, isSaved: false, isOwner: false };

  if (req.user) {
    const ownerId = internship.recruiter?._id;
    data.viewer.loggedIn = true;
    data.viewer.isOwner = Boolean(ownerId && ownerId.equals(req.user._id));

    if (req.user.role === 'student') {
      const application = await Application.findOne({
        student: req.user._id,
        internship: internship._id,
      }).select('status');
      data.viewer.hasApplied = Boolean(application);
      data.viewer.applicationStatus = application ? application.status : null;
      data.viewer.isSaved = req.user.savedInternships.some((id) => id.equals(internship._id));
    }
  }

  sendSuccess(res, 200, 'Internship fetched', data);
});

// POST /api/internships   (recruiter)
export const createInternship = asyncHandler(async (req, res) => {
  const b = req.body;
  const companyName = b.companyName || req.user.companyName;
  if (!companyName) throw new ApiError(400, 'Company name is required');

  const stipendMin = b.stipendMin ?? 0;
  const internship = await Internship.create({
    title: b.title,
    companyName,
    description: b.description,
    responsibilities: toLines(b.responsibilities),
    requiredSkills: normalizeList(b.requiredSkills),
    category: b.category,
    location: b.location,
    workMode: b.workMode,
    internshipType: b.internshipType,
    duration: b.duration,
    stipendMin,
    stipendMax: b.stipendMax ?? stipendMin,
    applicationDeadline: new Date(b.applicationDeadline),
    vacancies: b.vacancies ?? 1,
    recruiter: req.user._id, // ownership comes from the token, never from the request body
  });

  sendSuccess(res, 201, 'Internship created', withOpenFlag(internship));
});

// PUT /api/internships/:id   (owner only; partial updates allowed)
export const updateInternship = asyncHandler(async (req, res) => {
  const internship = await getOwnedInternship(req.params.id, req.user);
  const b = req.body;

  const SIMPLE_FIELDS = [
    'title', 'companyName', 'description', 'category', 'location', 'workMode',
    'internshipType', 'duration', 'stipendMin', 'stipendMax', 'vacancies', 'status',
  ];
  SIMPLE_FIELDS.forEach((field) => {
    if (b[field] !== undefined) internship[field] = b[field];
  });
  if (b.responsibilities !== undefined) internship.responsibilities = toLines(b.responsibilities);
  if (b.requiredSkills !== undefined) internship.requiredSkills = normalizeList(b.requiredSkills);

  if (b.applicationDeadline !== undefined) {
    const newDeadline = new Date(b.applicationDeadline);
    const changed = newDeadline.getTime() !== internship.applicationDeadline.getTime();
    if (changed && newDeadline <= new Date()) {
      throw new ApiError(400, 'Application deadline must be in the future');
    }
    internship.applicationDeadline = newDeadline;
  }

  if (internship.stipendMax < internship.stipendMin) {
    throw new ApiError(400, 'Maximum stipend must be greater than or equal to minimum stipend');
  }
  // Reopening a closed internship requires a future deadline.
  if (
    internship.isModified('status') &&
    internship.status === 'active' &&
    internship.applicationDeadline <= new Date()
  ) {
    throw new ApiError(400, 'Extend the application deadline before reopening this internship');
  }

  await internship.save(); // runs schema validators
  sendSuccess(res, 200, 'Internship updated', withOpenFlag(internship));
});

// DELETE /api/internships/:id   (owner only)
export const deleteInternship = asyncHandler(async (req, res) => {
  const internship = await getOwnedInternship(req.params.id, req.user);

  // Clean up everything that points to this internship.
  await Promise.all([
    Application.deleteMany({ internship: internship._id }),
    User.updateMany({ savedInternships: internship._id }, { $pull: { savedInternships: internship._id } }),
  ]);
  await internship.deleteOne();

  sendSuccess(res, 200, 'Internship deleted');
});

// GET /api/internships/recruiter/mine   (recruiter)
export const getMyInternships = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 10 });

  const filter = { recruiter: req.user._id };
  if (str(req.query.status)) filter.status = str(req.query.status);
  const search = str(req.query.search);
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: rx }, { companyName: rx }];
  }

  const [items, total] = await Promise.all([
    Internship.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean(),
    Internship.countDocuments(filter),
  ]);

  // One aggregate query for all applicant counts (avoids N+1 queries).
  const counts = items.length
    ? await Application.aggregate([
        { $match: { internship: { $in: items.map((i) => i._id) } } },
        { $group: { _id: '$internship', count: { $sum: 1 } } },
      ])
    : [];
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  const data = items.map((item) => ({
    ...withOpenFlag(item),
    applicantCount: countMap.get(String(item._id)) || 0,
  }));

  sendSuccess(res, 200, 'Your internships fetched', data, buildMeta(total, page, limit));
});
