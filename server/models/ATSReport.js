import mongoose from 'mongoose';

const atsReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    jobDescription: String,
    originalFileUrl: String,
    originalText: String,
    optimizedText: String,
    atsScore: { type: Number, required: true },
    matchPercentage: Number,
    keywordScore: Number,
    skillsScore: Number,
    experienceScore: Number,
    educationScore: Number,
    matchedKeywords: [String],
    missingKeywords: [String],
    matchedSkills: [String],
    missingSkills: [String],
    weakSections: [String],
    /*recommendations: [{
      type: String,
      priority: String,
      title: String,
      description: String,
    }]*/
   recommendations: [
  {
    type: {
      type: String,
    },
    priority: {
      type: String,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
  },
],
    skillsGap: [String],
  },
  { timestamps: true }
);

const ATSReport = mongoose.model('ATSReport', atsReportSchema);
export default ATSReport;
