import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: String,
    description: { type: String, required: true },
    requirements: [String],
    responsibilities: [String],
    skills: [String],
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    companyName: String,
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: String, required: true },
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' },
      period: { type: String, enum: ['hourly', 'monthly', 'yearly'], default: 'yearly' },
    },
    experience: {
      min: { type: Number, default: 0 },
      max: Number,
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
      default: 'full-time',
    },
    workMode: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite'],
      default: 'onsite',
    },
    category: String,
    benefits: [String],
    applicationDeadline: Date,
    status: {
      type: String,
      enum: ['active', 'paused', 'closed', 'draft', 'pending'],
      default: 'active',
    },
    isApproved: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    applicationCount: { type: Number, default: 0 },
    tags: [String],
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', skills: 'text', companyName: 'text' });
jobSchema.index({ location: 1, status: 1, workMode: 1, jobType: 1 });

jobSchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = `${this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString(36)}`;
  }
  next();
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
