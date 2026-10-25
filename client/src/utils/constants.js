// Must match server/utils/constants.js.
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
export const APPLICATION_STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Accepted'];
export const WITHDRAWABLE_STATUSES = ['Applied', 'Under Review'];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'deadline', label: 'Deadline (soonest)' },
  { value: 'stipend_high', label: 'Stipend (high to low)' },
  { value: 'stipend_low', label: 'Stipend (low to high)' },
];

// Complete class names (Tailwind only keeps classes it can see as full strings).
export const STATUS_STYLES = {
  Applied: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  'Under Review': 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  Shortlisted: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
  Rejected: 'border-red-500/30 bg-red-500/10 text-red-300',
  Accepted: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
};

// Chart colors for Recharts (same order as APPLICATION_STATUSES).
export const STATUS_CHART_COLORS = {
  Applied: '#38BDF8',
  'Under Review': '#FBBF24',
  Shortlisted: '#8B5CF6',
  Rejected: '#F87171',
  Accepted: '#34D399',
};
