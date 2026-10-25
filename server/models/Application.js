import mongoose from 'mongoose';
import { APPLICATION_STATUSES } from '../utils/constants.js';

const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
    coverLetter: { type: String, trim: true, maxlength: 2000, default: '' },
    resumeUrl: { type: String, trim: true, maxlength: 500, default: '' },
    status: {
      type: String,
      enum: { values: APPLICATION_STATUSES, message: 'Invalid application status' },
      default: 'Applied',
    },
    appliedAt: { type: Date, default: Date.now },
  },
  {
    // The spec asks for appliedAt + updatedAt, so we disable createdAt.
    timestamps: { createdAt: false, updatedAt: true },
  }
);

// KEY INDEX: one student can apply to one internship only once.
// The database itself rejects a duplicate (error code 11000), even if two
// requests arrive at the same instant.
applicationSchema.index({ student: 1, internship: 1 }, { unique: true });
// Student's "My Applications" page, newest first.
applicationSchema.index({ student: 1, appliedAt: -1 });
// Recruiter's applicant list, filtered by status.
applicationSchema.index({ internship: 1, status: 1 });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
