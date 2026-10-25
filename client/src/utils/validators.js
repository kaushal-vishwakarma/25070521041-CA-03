import { CATEGORIES, DURATIONS, INTERNSHIP_TYPES, WORK_MODES } from './constants.js';
import { splitList } from './format.js';

// Client-side form checks. They mirror the server rules so users get instant feedback,
// but the SERVER still validates everything again (never trust the browser).

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const emailError = (value = '') => {
  if (!value.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(value.trim())) return 'Please enter a valid email address';
  return '';
};

export const passwordError = (value = '') => {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (value.length > 72) return 'Password must be at most 72 characters';
  if (!/[A-Za-z]/.test(value)) return 'Password must contain at least one letter';
  if (!/\d/.test(value)) return 'Password must contain at least one number';
  return '';
};

// Each validate function returns an object { fieldName: 'message' }. Empty object = valid.
export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (emailError(email)) errors.email = emailError(email);
  if (!password) errors.password = 'Password is required';
  return errors;
};

export const validateRegister = (values) => {
  const errors = {};
  const name = values.name.trim();
  if (name.length < 2 || name.length > 80) errors.name = 'Name must be 2-80 characters';
  if (emailError(values.email)) errors.email = emailError(values.email);
  if (passwordError(values.password)) errors.password = passwordError(values.password);
  if (!values.confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match';
  if (!['student', 'recruiter'].includes(values.role)) errors.role = 'Please choose a role';

  if (values.role === 'student' && values.college.trim().length > 150) {
    errors.college = 'College name is too long (max 150 characters)';
  }
  if (values.role === 'recruiter') {
    const company = values.companyName.trim();
    if (!company) errors.companyName = 'Company name is required';
    else if (company.length > 120) errors.companyName = 'Company name is too long (max 120 characters)';
    if (values.designation.trim().length > 120) errors.designation = 'Designation is too long (max 120 characters)';
  }
  return errors;
};

export const validateApplication = ({ coverLetter, resumeUrl }) => {
  const errors = {};
  if (coverLetter.length > 2000) errors.coverLetter = 'Cover letter must be at most 2000 characters';
  if (resumeUrl.trim() && !isHttpUrl(resumeUrl.trim())) errors.resumeUrl = 'Resume link must start with http:// or https://';
  return errors;
};

export const validateProfile = ({ name, college, bio, resumeUrl }) => {
  const errors = {};
  if (name.trim().length < 2 || name.trim().length > 80) errors.name = 'Name must be 2-80 characters';
  if (college.trim().length > 150) errors.college = 'College name must be at most 150 characters';
  if (bio.length > 1000) errors.bio = 'Bio must be at most 1000 characters';
  if (resumeUrl.trim() && !isHttpUrl(resumeUrl.trim())) errors.resumeUrl = 'Resume link must start with http:// or https://';
  return errors;
};

// ---------- Recruiter: internship form ----------
export const todayUtc = () => new Date().toISOString().slice(0, 10);

const isWholeNumber = (value) => /^\d+$/.test(String(value).trim());
const isRealDate = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value; // rejects 2026-02-31

export const splitLines = (text = '') =>
  text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

// originalDeadline: when editing, the existing deadline (YYYY-MM-DD) may stay unchanged even if it is in the past.
export const validateInternship = (v, { originalDeadline = '' } = {}) => {
  const errors = {};
  const title = v.title.trim();
  if (title.length < 3 || title.length > 120) errors.title = 'Title must be 3-120 characters';
  if (v.companyName.trim().length > 120) errors.companyName = 'Company name must be at most 120 characters';

  const description = v.description.trim();
  if (description.length < 20 || description.length > 5000) errors.description = 'Description must be 20-5000 characters';

  const lines = splitLines(v.responsibilities);
  if (lines.length > 15) errors.responsibilities = 'Add at most 15 responsibilities';
  else if (lines.some((line) => line.length > 300)) errors.responsibilities = 'Each responsibility must be at most 300 characters';

  if (splitList(v.requiredSkills).length === 0) errors.requiredSkills = 'Add at least one required skill';
  if (!CATEGORIES.includes(v.category)) errors.category = 'Please choose a category';
  const location = v.location.trim();
  if (location.length < 2 || location.length > 120) errors.location = 'Location must be 2-120 characters';
  if (!WORK_MODES.includes(v.workMode)) errors.workMode = 'Please choose a work mode';
  if (!DURATIONS.includes(v.duration)) errors.duration = 'Please choose a duration';
  if (!INTERNSHIP_TYPES.includes(v.internshipType)) errors.internshipType = 'Please choose an internship type';

  const minGiven = String(v.stipendMin).trim() !== '';
  const maxGiven = String(v.stipendMax).trim() !== '';
  const badMoney = (x) => !isWholeNumber(x) || Number(x) > 1000000;
  if (minGiven && badMoney(v.stipendMin)) errors.stipendMin = 'Enter a whole number from 0 to 1,000,000';
  if (maxGiven && badMoney(v.stipendMax)) errors.stipendMax = 'Enter a whole number from 0 to 1,000,000';
  if (!errors.stipendMin && !errors.stipendMax && minGiven && maxGiven && Number(v.stipendMax) < Number(v.stipendMin)) {
    errors.stipendMax = 'Maximum stipend must be at least the minimum';
  }

  if (!isWholeNumber(v.vacancies) || Number(v.vacancies) < 1 || Number(v.vacancies) > 1000) {
    errors.vacancies = 'Vacancies must be a whole number from 1 to 1000';
  }

  if (!v.applicationDeadline) errors.applicationDeadline = 'Application deadline is required';
  else if (!isRealDate(v.applicationDeadline)) errors.applicationDeadline = 'Enter a valid date';
  else if (v.applicationDeadline < todayUtc() && v.applicationDeadline !== originalDeadline) {
    errors.applicationDeadline = 'The deadline must be today or a later date';
  }
  return errors;
};

// ---------- Recruiter: profile ----------
export const validateRecruiterProfile = ({ name, companyName, designation, bio }) => {
  const errors = {};
  if (name.trim().length < 2 || name.trim().length > 80) errors.name = 'Name must be 2-80 characters';
  if (!companyName.trim()) errors.companyName = 'Company name is required';
  else if (companyName.trim().length > 120) errors.companyName = 'Company name must be at most 120 characters';
  if (designation.trim().length > 120) errors.designation = 'Designation must be at most 120 characters';
  if (bio.length > 1000) errors.bio = 'Bio must be at most 1000 characters';
  return errors;
};
