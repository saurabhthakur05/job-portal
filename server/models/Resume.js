import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'My Resume' },
    template: {
      type: String,
      enum: ['modern', 'classic', 'minimal', 'professional', 'creative'],
      default: 'modern',
    },
    content: {
      summary: String,
      experience: [{
        company: String,
        title: String,
        startDate: String,
        endDate: String,
        current: Boolean,
        bullets: [String],
      }],
      education: [{
        institution: String,
        degree: String,
        field: String,
        year: String,
      }],
      skills: [String],
      certifications: [String],
      projects: [{
        name: String,
        description: String,
        url: String,
      }],
    },
    fileUrl: String,
    isDefault: { type: Boolean, default: false },
    atsScore: Number,
  },
  { timestamps: true }
);

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
