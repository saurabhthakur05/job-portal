import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema({
  stage: {
    type: String,
    enum: ['applied', 'viewed', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'],
    required: true,
  },
  note: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resumeUrl: String,
    resumeText: String,
    coverLetter: String,
    status: {
      type: String,
      enum: ['applied', 'viewed', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'],
      default: 'applied',
    },
    atsScore: { type: Number, default: 0 },
    matchPercentage: { type: Number, default: 0 },
    ranking: { type: Number, default: 0 },
    timeline: [timelineSchema],
    notes: String,
    interviewDate: Date,

interviewTime: String,

interviewMode: {
  type: String,
  enum: ["Online", "Offline"],
},

interviewLink: String,

interviewLocation: String,
    isShortlisted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

applicationSchema.pre('save', function (next) {
  if (this.isNew) {
    this.timeline.push({ stage: 'applied', note: 'Application submitted' });
  }
  next();
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;
