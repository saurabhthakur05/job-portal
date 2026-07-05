import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  field: String,
  startDate: Date,
  endDate: Date,
  current: { type: Boolean, default: false },
  description: String,
});

const experienceSchema = new mongoose.Schema({
  company: String,
  title: String,
  location: String,
  startDate: Date,
  endDate: Date,
  current: { type: Boolean, default: false },
  description: String,
});

const certificationSchema = new mongoose.Schema({
  name: String,
  issuer: String,
  date: Date,
  url: String,
});

const profileSchema = new mongoose.Schema({
  summary: String,
  phone: String,
  location: String,
  education: [educationSchema],
  experience: [experienceSchema],
  skills: [String],
  certifications: [certificationSchema],
  portfolioLinks: [String],
  github: String,
  linkedin: String,
  designation: String,
companyName: String,
companyWebsite: String,
companyDescription: String,
  resumeUrl: String,
  resumeText: String,
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['jobseeker', 'recruiter', 'admin'],
      default: 'jobseeker',
    },
    avatar: { type: String, default: '' },
    googleId: String,
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isRecruiterVerified: { type: Boolean, default: false },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    profile: { type: profileSchema, default: () => ({}) },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    searchHistory: [String],
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getProfileCompletion = function () {
  const fields = [
    this.name,
    this.email,
    this.avatar,
    this.profile?.summary,
    this.profile?.phone,
    this.profile?.location,
    this.profile?.skills?.length > 0,
    this.profile?.education?.length > 0,
    this.profile?.experience?.length > 0,
    this.profile?.resumeUrl,
  ];
  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
};

userSchema.methods.getEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

userSchema.methods.getResetPasswordToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
  return token;
};

const User = mongoose.model('User', userSchema);
export default User;
