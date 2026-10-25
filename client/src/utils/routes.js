// One place for every URL in the app, so links never get out of sync with App.jsx.
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  internships: '/internships',
  internshipDetails: (id) => `/internships/${id}`,

  student: {
    dashboard: '/student',
    applications: '/student/applications',
    saved: '/student/saved',
    profile: '/student/profile',
  },

  recruiter: {
    dashboard: '/recruiter',
    internships: '/recruiter/internships',
    newInternship: '/recruiter/internships/new',
    editInternship: (id) => `/recruiter/internships/${id}/edit`,
    applicants: (id) => `/recruiter/internships/${id}/applicants`,
    profile: '/recruiter/profile',
  },
};

export const dashboardPathFor = (role) =>
  role === 'recruiter' ? ROUTES.recruiter.dashboard : ROUTES.student.dashboard;

export const profilePathFor = (role) =>
  role === 'recruiter' ? ROUTES.recruiter.profile : ROUTES.student.profile;

// Can this role open this URL? (Used to decide where to send a user after login.)
export const canAccessPath = (role, path = '') => {
  if (path.startsWith('/student')) return role === 'student';
  if (path.startsWith('/recruiter')) return role === 'recruiter';
  return true;
};
