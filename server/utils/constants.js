// Single source of truth for allowed values, used by models, validators, and the seed script.

export const ROLES = ['student', 'recruiter'];

export const CATEGORIES = [
  'Frontend Development',
  'Backend Development',
  'Full-Stack Development',
  'AI/ML',
  'Data Science',
  'Cybersecurity',
  'UI/UX Design',
];

export const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];

export const INTERNSHIP_TYPES = ['Full-time', 'Part-time', 'Project-based'];

export const DURATIONS = ['1 month', '2 months', '3 months', '4 months', '6 months'];

export const INTERNSHIP_STATUSES = ['active', 'closed'];

export const APPLICATION_STATUSES = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Rejected',
  'Accepted',
];

// A student may withdraw only while the recruiter has not made a decision.
export const WITHDRAWABLE_STATUSES = ['Applied', 'Under Review'];
