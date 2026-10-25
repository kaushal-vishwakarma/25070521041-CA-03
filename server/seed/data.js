// Demo data used by seed.js. Kept separate from the DB code so it is easy to read and edit.
// All companies, people and internships below are FICTIONAL demo content.
// DEVELOPMENT ONLY: these accounts share a known password and must never exist in production.

export const DEMO_EMAIL_DOMAIN = 'careerhub.demo';
export const DEMO_PASSWORD = 'Demo@12345';

// End of the day, `days` from today (UTC). Negative numbers give a past date.
const daysFromNow = (days) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(23, 59, 59, 999);
  return d;
};

export const recruiters = [
  { key: 'nimbus', name: 'Riya Kapoor', email: `recruiter1@${DEMO_EMAIL_DOMAIN}`, companyName: 'Nimbus Labs', designation: 'Engineering Hiring Lead' },
  { key: 'dataharbor', name: 'Karan Mehta', email: `recruiter2@${DEMO_EMAIL_DOMAIN}`, companyName: 'DataHarbor Analytics', designation: 'Talent Acquisition Manager' },
  { key: 'pixelforge', name: 'Sana Sheikh', email: `recruiter3@${DEMO_EMAIL_DOMAIN}`, companyName: 'Pixelforge Studio', designation: 'Design Lead' },
  { key: 'cipher', name: 'Vikram Rao', email: `recruiter4@${DEMO_EMAIL_DOMAIN}`, companyName: 'Cipher Shield Security', designation: 'Security Team Lead' },
];

export const students = [
  {
    key: 'student1',
    name: 'Aarav Sharma',
    email: `student1@${DEMO_EMAIL_DOMAIN}`,
    college: 'Demo Institute of Technology, Pune',
    skills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Tailwind CSS', 'Git'],
    resumeUrl: 'https://example.com/demo-resume-aarav.pdf',
    bio: 'Third-year BTech CSE student who enjoys building full-stack web apps.',
  },
  {
    key: 'student2',
    name: 'Diya Patel',
    email: `student2@${DEMO_EMAIL_DOMAIN}`,
    college: 'Demo College of Engineering, Mumbai',
    skills: ['Python', 'Machine Learning', 'SQL', 'Pandas', 'NumPy'],
    resumeUrl: 'https://example.com/demo-resume-diya.pdf',
    bio: 'BTech CSE student interested in data science and machine learning.',
  },
];

// `recruiterKey` links each internship to a recruiter above. Deadlines are relative to the day you seed.
export const buildInternships = () => [
  // ---------- Nimbus Labs ----------
  {
    recruiterKey: 'nimbus',
    title: 'React Frontend Intern',
    description:
      'Join the Nimbus Labs product team and help build responsive dashboards used by small businesses. You will work with senior engineers, take part in code reviews and ship real features during the internship.',
    responsibilities: [
      'Build reusable React components from Figma designs',
      'Integrate frontend screens with REST APIs',
      'Fix UI bugs and improve accessibility',
      'Take part in code reviews and sprint planning',
    ],
    requiredSkills: ['React', 'JavaScript', 'Tailwind CSS', 'Git', 'REST APIs'],
    category: 'Frontend Development', location: 'Pune', workMode: 'Hybrid', internshipType: 'Full-time',
    duration: '3 months', stipendMin: 10000, stipendMax: 15000, deadlineDays: 21, vacancies: 3,
  },
  {
    recruiterKey: 'nimbus',
    title: 'Node.js Backend Intern',
    description:
      'Work on the APIs that power the Nimbus Labs platform. You will design endpoints, write database queries and learn how production backend systems are tested, monitored and deployed.',
    responsibilities: [
      'Build and document REST API endpoints with Express',
      'Design MongoDB schemas and queries',
      'Write validation and error-handling logic',
      'Help debug production issues with your mentor',
    ],
    requiredSkills: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'Git'],
    category: 'Backend Development', location: 'Pune', workMode: 'On-site', internshipType: 'Full-time',
    duration: '6 months', stipendMin: 12000, stipendMax: 18000, deadlineDays: 28, vacancies: 2,
  },
  {
    recruiterKey: 'nimbus',
    title: 'MERN Full-Stack Intern',
    description:
      'Build features end to end on a small, fast-moving team: database, API and user interface. This remote internship suits students who already have one or two MERN projects to show.',
    responsibilities: [
      'Develop features across the React frontend and Express backend',
      'Model data in MongoDB with Mongoose',
      'Implement authentication and role-based access',
      'Write clear documentation for the features you ship',
    ],
    requiredSkills: ['MongoDB', 'Express', 'React', 'Node.js', 'JavaScript'],
    category: 'Full-Stack Development', location: 'Remote', workMode: 'Remote', internshipType: 'Full-time',
    duration: '4 months', stipendMin: 15000, stipendMax: 20000, deadlineDays: 14, vacancies: 2,
  },
  {
    // Deliberately CLOSED with a past deadline, so you can demonstrate that applications are blocked.
    recruiterKey: 'nimbus',
    title: 'Python Backend Intern (Closed Demo)',
    description:
      'This listing is closed on purpose. It lets you demonstrate that the server refuses applications once the status is closed and the deadline has passed.',
    responsibilities: ['Maintain internal Python services', 'Write unit tests', 'Support the on-call engineer'],
    requiredSkills: ['Python', 'SQL', 'Git'],
    category: 'Backend Development', location: 'Pune', workMode: 'On-site', internshipType: 'Full-time',
    duration: '3 months', stipendMin: 8000, stipendMax: 12000, deadlineDays: -5, vacancies: 1, status: 'closed',
  },

  // ---------- DataHarbor Analytics ----------
  {
    recruiterKey: 'dataharbor',
    title: 'Data Analyst Intern',
    description:
      'Turn raw business data into clear insights for DataHarbor clients. You will clean datasets, write SQL queries and present findings to the analytics team every week.',
    responsibilities: [
      'Clean and prepare datasets using Python and Pandas',
      'Write SQL queries to answer business questions',
      'Create charts and dashboards for client reports',
      'Present weekly findings to the team',
    ],
    requiredSkills: ['Python', 'SQL', 'Pandas', 'Excel', 'Data Visualization'],
    category: 'Data Science', location: 'Bengaluru', workMode: 'Hybrid', internshipType: 'Full-time',
    duration: '3 months', stipendMin: 12000, stipendMax: 16000, deadlineDays: 18, vacancies: 3,
  },
  {
    recruiterKey: 'dataharbor',
    title: 'Machine Learning Intern',
    description:
      'Help the data science team build and evaluate predictive models for demand forecasting. You will experiment with features, track results and learn how models move from notebooks to production.',
    responsibilities: [
      'Prepare features and train baseline models',
      'Evaluate models with cross-validation and metrics',
      'Document experiments and results',
      'Assist with model deployment tasks',
    ],
    requiredSkills: ['Python', 'Machine Learning', 'scikit-learn', 'NumPy', 'Pandas'],
    category: 'AI/ML', location: 'Bengaluru', workMode: 'On-site', internshipType: 'Full-time',
    duration: '6 months', stipendMin: 20000, stipendMax: 25000, deadlineDays: 25, vacancies: 2,
  },
  {
    recruiterKey: 'dataharbor',
    title: 'NLP Research Intern',
    description:
      'Explore text classification and summarization for customer support data. This is a project-based, remote role for students who are comfortable reading papers and running experiments.',
    responsibilities: [
      'Fine-tune and evaluate transformer-based models',
      'Build text preprocessing pipelines',
      'Compare approaches and report findings',
      'Share a short research summary at the end',
    ],
    requiredSkills: ['Python', 'NLP', 'PyTorch', 'Transformers', 'Git'],
    category: 'AI/ML', location: 'Remote', workMode: 'Remote', internshipType: 'Project-based',
    duration: '4 months', stipendMin: 15000, stipendMax: 22000, deadlineDays: 30, vacancies: 1,
  },
  {
    recruiterKey: 'dataharbor',
    title: 'Business Intelligence Intern',
    description:
      'Support the BI team in building self-service dashboards. A part-time schedule makes this a good fit for students who still have classes during the week.',
    responsibilities: [
      'Build dashboards in Power BI from SQL data sources',
      'Validate numbers against source systems',
      'Document metrics and definitions',
    ],
    requiredSkills: ['SQL', 'Power BI', 'Excel', 'Statistics'],
    category: 'Data Science', location: 'Bengaluru', workMode: 'Hybrid', internshipType: 'Part-time',
    duration: '2 months', stipendMin: 8000, stipendMax: 10000, deadlineDays: 10, vacancies: 2,
  },

  // ---------- Pixelforge Studio ----------
  {
    recruiterKey: 'pixelforge',
    title: 'UI/UX Design Intern',
    description:
      'Design clean, usable interfaces for mobile and web products alongside the Pixelforge design team. You will go from sketches to clickable prototypes and test them with real users.',
    responsibilities: [
      'Create wireframes and high-fidelity mockups in Figma',
      'Build clickable prototypes',
      'Contribute components to the design system',
      'Join user feedback sessions',
    ],
    requiredSkills: ['Figma', 'Wireframing', 'Prototyping', 'Design Systems'],
    category: 'UI/UX Design', location: 'Mumbai', workMode: 'Hybrid', internshipType: 'Full-time',
    duration: '3 months', stipendMin: 10000, stipendMax: 14000, deadlineDays: 20, vacancies: 2,
  },
  {
    recruiterKey: 'pixelforge',
    title: 'UX Research Intern',
    description:
      'Learn how to plan and run user research studies. You will interview users, analyse the feedback and turn it into recommendations the design team can act on.',
    responsibilities: [
      'Plan and run user interviews and surveys',
      'Run usability tests on prototypes',
      'Summarize insights in short research reports',
    ],
    requiredSkills: ['User Research', 'Figma', 'Usability Testing', 'Surveys'],
    category: 'UI/UX Design', location: 'Remote', workMode: 'Remote', internshipType: 'Part-time',
    duration: '2 months', stipendMin: 6000, stipendMax: 9000, deadlineDays: 12, vacancies: 1,
  },
  {
    recruiterKey: 'pixelforge',
    title: 'Vue.js Frontend Intern',
    description:
      'Turn Pixelforge designs into polished, accessible interfaces using Vue.js. You will work closely with designers and learn how a design handoff works in practice.',
    responsibilities: [
      'Implement pixel-accurate screens in Vue.js',
      'Write responsive layouts with Tailwind CSS',
      'Review designs for accessibility issues',
      'Fix UI bugs reported by the QA team',
    ],
    requiredSkills: ['Vue.js', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'],
    category: 'Frontend Development', location: 'Mumbai', workMode: 'On-site', internshipType: 'Full-time',
    duration: '3 months', stipendMin: 9000, stipendMax: 13000, deadlineDays: 16, vacancies: 2,
  },

  // ---------- Cipher Shield Security ----------
  {
    recruiterKey: 'cipher',
    title: 'SOC Analyst Intern',
    description:
      'Learn how a security operations centre works. You will monitor alerts, investigate suspicious activity and help write incident reports under the guidance of senior analysts.',
    responsibilities: [
      'Monitor and triage security alerts in a SIEM',
      'Investigate logs and network traffic',
      'Write short incident reports',
      'Help improve detection rules',
    ],
    requiredSkills: ['Networking', 'Linux', 'SIEM', 'Security Fundamentals'],
    category: 'Cybersecurity', location: 'Gurugram', workMode: 'On-site', internshipType: 'Full-time',
    duration: '6 months', stipendMin: 15000, stipendMax: 20000, deadlineDays: 22, vacancies: 2,
  },
  {
    recruiterKey: 'cipher',
    title: 'Application Security Intern',
    description:
      'Test web applications for common vulnerabilities in a safe, authorised environment. You will learn the OWASP Top 10 hands-on and write clear remediation advice for developers.',
    responsibilities: [
      'Test web apps against the OWASP Top 10',
      'Use Burp Suite to find and verify issues',
      'Write remediation guidance for developers',
      'Build small scripts to automate repeated checks',
    ],
    requiredSkills: ['OWASP Top 10', 'Burp Suite', 'JavaScript', 'Python', 'Linux'],
    category: 'Cybersecurity', location: 'Remote', workMode: 'Remote', internshipType: 'Project-based',
    duration: '3 months', stipendMin: 12000, stipendMax: 18000, deadlineDays: 26, vacancies: 1,
  },
  {
    recruiterKey: 'cipher',
    title: 'Secure API Developer Intern',
    description:
      'Build backend services where security is part of the design from day one. You will implement authentication, input validation and rate limiting for internal APIs.',
    responsibilities: [
      'Implement JWT-based authentication and authorization',
      'Add input validation and rate limiting',
      'Write tests for security-sensitive endpoints',
      'Review code for common security mistakes',
    ],
    requiredSkills: ['Node.js', 'JWT', 'REST APIs', 'MongoDB', 'Security Fundamentals'],
    category: 'Backend Development', location: 'Gurugram', workMode: 'Hybrid', internshipType: 'Full-time',
    duration: '4 months', stipendMin: 14000, stipendMax: 19000, deadlineDays: 19, vacancies: 2,
  },
].map(({ deadlineDays, ...rest }) => ({ ...rest, applicationDeadline: daysFromNow(deadlineDays) }));

// A few demo applications so the dashboards are not empty the first time you log in.
// These are real database records created by the seed script (not fake statistics).
export const applicationPlan = [
  { student: 'student1', internshipTitle: 'React Frontend Intern', status: 'Under Review', coverLetter: 'I have built two React projects and would love to learn from your team.' },
  { student: 'student1', internshipTitle: 'MERN Full-Stack Intern', status: 'Shortlisted', coverLetter: 'My final-year project uses the full MERN stack with JWT authentication.' },
  { student: 'student1', internshipTitle: 'UI/UX Design Intern', status: 'Applied', coverLetter: 'I enjoy turning designs into working interfaces and want to learn more about design.' },
  { student: 'student2', internshipTitle: 'Machine Learning Intern', status: 'Shortlisted', coverLetter: 'I completed a demand-forecasting mini project using scikit-learn.' },
  { student: 'student2', internshipTitle: 'Data Analyst Intern', status: 'Applied', coverLetter: 'I am comfortable with Python, Pandas and SQL and enjoy finding patterns in data.' },
  { student: 'student2', internshipTitle: 'NLP Research Intern', status: 'Rejected', coverLetter: 'I want to explore NLP and have completed an introductory course.' },
];
