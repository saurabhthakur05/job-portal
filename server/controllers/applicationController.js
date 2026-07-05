import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { analyzeResume } from '../utils/atsAnalyzer.js';
import { createNotification } from '../utils/notifications.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { AppError } from '../middleware/errorHandler.js';

export const applyToJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('company');
    if (!job || job.status !== 'active') {
      return next(new AppError('Job not available', 404));
    }

    const existing = await Application.findOne({ job: job._id, applicant: req.user._id });
    if (existing) return next(new AppError('Already applied to this job', 400));

    let resumeText = req.user.profile?.resumeText || '';
    let resumeUrl = req.user.profile?.resumeUrl || '';

    if (req.file) {
      const { extractTextFromFile } = await import('../utils/atsAnalyzer.js');
      resumeText = await extractTextFromFile(req.file.buffer, req.file.mimetype);
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await uploadToCloudinary(req.file.buffer, 'resumes', 'raw');
        resumeUrl = result.secure_url;
      }
    }

    const analysis = analyzeResume(resumeText, job.description + ' ' + job.skills.join(' '));

    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      recruiter: job.recruiter,
      resumeUrl,
      resumeText,
      coverLetter: req.body.coverLetter || '',
      atsScore: analysis.atsScore,
      matchPercentage: analysis.matchPercentage,
    });

    job.applicationCount += 1;
    await job.save();

    const io = req.app.get('io');
    await createNotification(io, {
      userId: job.recruiter,
      type: 'application_update',
      title: 'New Application',
      message: `${req.user.name} applied for ${job.title}`,
      link: `/recruiter/applications/${application._id}`,
    });

    res.status(201).json({ success: true, application, analysis });
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
   const applications = await Application.find({
  applicant: req.user._id,
})
  .populate({
    path: "job",
    populate: { path: "company" },
  })
  .sort("-createdAt");

// Remove applications whose jobs no longer exist
const validApplications = applications.filter(
  (app) => app.job !== null
);
   res.json({
  success: true,
  applications: validApplications,
});
  } catch (error) {
    next(error);
  }
};

export const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return next(new AppError('Job not found', 404));
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    const applications = await Application.find({ job: job._id })
      .populate('applicant')
      .sort('-atsScore -matchPercentage');

    applications.forEach((app, index) => {
      app.ranking = index + 1;
    });

    res.json({ success: true, applications, job });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id).populate('job applicant');
    if (!application) return next(new AppError('Application not found', 404));

    const job = await Job.findById(application.job._id);
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    application.status = status;
    application.isShortlisted = status === 'shortlisted';
    application.timeline.push({
      stage: status,
      note: note || `Status updated to ${status}`,
      updatedBy: req.user._id,
    });
    await application.save();

    const io = req.app.get('io');
    await createNotification(io, {
      userId: application.applicant._id,
      type: 'application_update',
      title: 'Application Update',
      message: `Your application for ${application.job.title} is now: ${status.replace('_', ' ')}`,
      link: `/dashboard/applications`,
      data: { applicationId: application._id, status },
    });

    res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

export const getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant job');

    if (!application) return next(new AppError('Application not found', 404));

    const isOwner = application.applicant._id.toString() === req.user._id.toString();
    const isRecruiter = application.recruiter?.toString() === req.user._id.toString();
    if (!isOwner && !isRecruiter && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
};
