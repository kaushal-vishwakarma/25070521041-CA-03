import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../utils/constants.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name must be at most 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // creates a unique index -> prevents duplicate registrations
      lowercase: true, // normalized: "A@B.com" and "a@b.com" are the same account
      trim: true,
      match: [EMAIL_REGEX, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned by queries unless explicitly requested
    },
    role: {
      type: String,
      enum: { values: ROLES, message: 'Role must be student or recruiter' },
      required: [true, 'Role is required'],
    },

    // Student fields
    college: { type: String, trim: true, maxlength: 150, default: '' },
    skills: { type: [{ type: String, trim: true, maxlength: 60 }], default: [] },
    resumeUrl: { type: String, trim: true, maxlength: 500, default: '' },
    bio: { type: String, trim: true, maxlength: 1000, default: '' },

    // Recruiter fields
    companyName: { type: String, trim: true, maxlength: 120, default: '' },
    designation: { type: String, trim: true, maxlength: 120, default: '' },

    // Needed for the "Saved internships" feature (students).
    // Stored as references so we can populate full internship details.
    savedInternships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Internship' }],
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Hash the password only when it is new or changed.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safety net: even if a document is serialized by mistake, never expose the hash.
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);
export default User;
