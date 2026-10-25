import { splitLines } from './validators.js';
import { splitList } from './format.js';

// The form keeps every value as a string (that is what <input> gives us).
export const EMPTY_INTERNSHIP_FORM = {
  title: '',
  companyName: '',
  description: '',
  responsibilities: '',
  requiredSkills: '',
  category: '',
  location: '',
  workMode: '',
  internshipType: 'Full-time',
  duration: '',
  stipendMin: '',
  stipendMax: '',
  applicationDeadline: '',
  vacancies: '1',
};

// API internship -> form strings (used when editing)
export const toFormValues = (internship) => ({
  title: internship.title || '',
  companyName: internship.companyName || '',
  description: internship.description || '',
  responsibilities: (internship.responsibilities || []).join('\n'),
  requiredSkills: (internship.requiredSkills || []).join(', '),
  category: internship.category || '',
  location: internship.location || '',
  workMode: internship.workMode || '',
  internshipType: internship.internshipType || 'Full-time',
  duration: internship.duration || '',
  stipendMin: String(internship.stipendMin ?? ''),
  stipendMax: String(internship.stipendMax ?? ''),
  applicationDeadline: internship.applicationDeadline ? String(internship.applicationDeadline).slice(0, 10) : '',
  vacancies: String(internship.vacancies ?? 1),
});

// Form strings -> JSON body for POST/PUT /api/internships
export const buildInternshipPayload = (v) => {
  const stipendMin = v.stipendMin.trim() === '' ? 0 : Number(v.stipendMin);
  const stipendMax = v.stipendMax.trim() === '' ? stipendMin : Number(v.stipendMax); // only a minimum given -> same maximum
  const payload = {
    title: v.title.trim(),
    description: v.description.trim(),
    responsibilities: splitLines(v.responsibilities),
    requiredSkills: splitList(v.requiredSkills),
    category: v.category,
    location: v.location.trim(),
    workMode: v.workMode,
    internshipType: v.internshipType,
    duration: v.duration,
    stipendMin,
    stipendMax,
    applicationDeadline: v.applicationDeadline, // "YYYY-MM-DD": the server treats it as the END of that day
    vacancies: Number(v.vacancies),
  };
  // An empty company name must be omitted: the server then uses the recruiter's company.
  if (v.companyName.trim()) payload.companyName = v.companyName.trim();
  return payload;
};
