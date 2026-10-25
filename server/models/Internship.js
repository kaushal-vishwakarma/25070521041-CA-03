import mongoose from 'mongoose';
import {
  CATEGORIES,
  WORK_MODES,
  INTERNSHIP_TYPES,
  DURATIONS,
  INTERNSHIP_STATUSES,
} from '../utils/constants.js';

const internshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title must be at most 120 characters'],
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: 5000,
    },
    responsibilities: { type: [{ type: String, trim: true, maxlength: 300 }], default: [] },
    requiredSkills: { type: [{ type: String, trim: true, maxlength: 60 }], default: [] },
    category: {
      type: String,
      enum: { values: CATEGORIES, message: 'Invalid category' },
      required: [true, 'Category is required'],
    },
    location: { type: String, required: [true, 'Location is required'], trim: true, maxlength: 120 },
    workMode: {
      type: String,
      enum: { values: WORK_MODES, message: 'Work mode must be Remote, Hybrid, or On-site' },
      required: [true, 'Work mode is required'],
    },
    internshipType: {
      type: String,
      enum: { values: INTERNSHIP_TYPES, message: 'Invalid internship type' },
      default: 'Full-time',
    },
    duration: {
      type: String,
      enum: { values: DURATIONS, message: 'Invalid duration' },
      required: [true, 'Duration is required'],
    },
    stipendMin: { type: Number, min: [0, 'Stipend cannot be negative'], default: 0 },
    stipendMax: {
      type: Number,
      min: [0, 'Stipend cannot be negative'],
      default: 0,
      validate: {
        validator: function (value) {
          // On document save, `this` is the document. On update queries it is not,
          // so the controller/validator also checks this rule (Part 2).
          return this.stipendMin === undefined || value >= this.stipendMin;
        },
        message: 'Maximum stipend must be greater than or equal to minimum stipend',
      },
    },
    applicationDeadline: { type: Date, required: [true, 'Application deadline is required'] },
    vacancies: { type: Number, min: [1, 'At least 1 vacancy is required'], default: 1 },
    status: {
      type: String,
      enum: { values: INTERNSHIP_STATUSES, message: 'Status must be active or closed' },
      default: 'active',
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes (each one supports a real query in the app):
// 1. Public listing: active internships whose deadline has not passed.
internshipSchema.index({ status: 1, applicationDeadline: 1 });
// 2. Category and work-mode filters on the listing page.
internshipSchema.index({ category: 1, workMode: 1 });
// 3. Recruiter dashboard: "my internships", newest first.
internshipSchema.index({ recruiter: 1, createdAt: -1 });

// A listing is open only if status is active AND the deadline is in the future.
internshipSchema.methods.isOpenForApplications = function () {
  return this.status === 'active' && this.applicationDeadline > new Date();
};

const Internship = mongoose.model('Internship', internshipSchema);
export default Internship;
