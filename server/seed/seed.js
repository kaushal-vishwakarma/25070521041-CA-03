import mongoose from 'mongoose';
import env from '../config/env.js';
import User from '../models/User.js';
import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import {
  DEMO_EMAIL_DOMAIN,
  DEMO_PASSWORD,
  recruiters,
  students,
  buildInternships,
  applicationPlan,
} from './data.js';

// Removes ONLY previous demo data (accounts ending in @careerhub.demo and everything linked to them),
// so accounts you registered yourself are never touched.
const removeOldDemoData = async () => {
  const domain = DEMO_EMAIL_DOMAIN.replace('.', '\\.');
  const demoUsers = await User.find({ email: new RegExp(`@${domain}$`) }).select('_id').lean();
  const demoUserIds = demoUsers.map((u) => u._id);

  const demoInternships = await Internship.find({ recruiter: { $in: demoUserIds } }).select('_id').lean();
  const demoInternshipIds = demoInternships.map((i) => i._id);

  await Application.deleteMany({
    $or: [{ student: { $in: demoUserIds } }, { internship: { $in: demoInternshipIds } }],
  });
  await User.updateMany(
    { savedInternships: { $in: demoInternshipIds } },
    { $pull: { savedInternships: { $in: demoInternshipIds } } }
  );
  await Internship.deleteMany({ _id: { $in: demoInternshipIds } });
  await User.deleteMany({ _id: { $in: demoUserIds } });
};

const run = async () => {
  if (env.isProduction) {
    console.error('Refusing to seed demo data when NODE_ENV=production.');
    process.exit(1);
  }

  await mongoose.connect(env.MONGODB_URI);
  console.log(`Connected to database "${mongoose.connection.name}"`);

  // Make sure collections and indexes exist (so they show up in Compass).
  await Promise.all([User.init(), Internship.init(), Application.init()]);

  await removeOldDemoData();

  // Users: create() runs the pre-save hook, so passwords are hashed with bcrypt.
  const recruiterDocs = {};
  for (const r of recruiters) {
    const { key, ...fields } = r;
    recruiterDocs[key] = await User.create({ ...fields, password: DEMO_PASSWORD, role: 'recruiter' });
  }
  const studentDocs = {};
  for (const s of students) {
    const { key, ...fields } = s;
    studentDocs[key] = await User.create({ ...fields, password: DEMO_PASSWORD, role: 'student' });
  }

  // Internships
  const internshipsByTitle = {};
  for (const item of buildInternships()) {
    const { recruiterKey, ...fields } = item;
    const recruiter = recruiterDocs[recruiterKey];
    internshipsByTitle[item.title] = await Internship.create({
      ...fields,
      companyName: recruiter.companyName,
      recruiter: recruiter._id,
    });
  }

  // Applications
  for (const plan of applicationPlan) {
    await Application.create({
      student: studentDocs[plan.student]._id,
      internship: internshipsByTitle[plan.internshipTitle]._id,
      coverLetter: plan.coverLetter,
      resumeUrl: studentDocs[plan.student].resumeUrl,
      status: plan.status,
    });
  }

  const [userCount, internshipCount, applicationCount] = await Promise.all([
    User.countDocuments(),
    Internship.countDocuments(),
    Application.countDocuments(),
  ]);

  console.log('\nSeed complete. Documents now in the database:');
  console.table({ users: userCount, internships: internshipCount, applications: applicationCount });

  console.log('\nDEVELOPMENT-ONLY demo logins (password for all: %s)', DEMO_PASSWORD);
  console.table([
    ...recruiters.map((r) => ({ role: 'recruiter', email: r.email, company: r.companyName })),
    ...students.map((s) => ({ role: 'student', email: s.email, company: '-' })),
  ]);
  console.log('Never use these accounts or this password in a deployed app.\n');
};

run()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
