import Interview from '../models/Interview.js';
import Application from '../models/Application.js';
import { createNotification } from '../utils/notifications.js';
import { AppError } from '../middleware/errorHandler.js';

export const scheduleInterview = async (req, res, next) => {
  try {
    const application = await Application.findById(req.body.applicationId).populate('job applicant');
    if (!application) return next(new AppError('Application not found', 404));

    const interview = await Interview.create({
      application: application._id,
      job: application.job._id,
      candidate: application.applicant._id,
      recruiter: req.user._id,
      ...req.body,
    });

   application.status = "interview_scheduled";

application.interviewDate = req.body.scheduledAt;

application.interviewTime = req.body.interviewTime;

application.interviewMode = req.body.interviewMode;

application.interviewLink = req.body.interviewLink;

application.interviewLocation = req.body.location;

application.timeline.push({
  stage: "interview_scheduled",
  note: `Interview scheduled for ${new Date(req.body.scheduledAt).toLocaleString()}`,
  updatedBy: req.user._id,
});

await application.save();

    const io = req.app.get('io');
    await createNotification(io, {
      userId: application.applicant._id,
      type: 'interview_scheduled',
      title: 'Interview Scheduled',
     message: `Interview for ${application.job.title}
📅 ${new Date(req.body.scheduledAt).toLocaleDateString()}
📍 ${req.body.location}`,
      link: '/dashboard/applications',
    });

    res.status(201).json({ success: true, interview });
  } catch (error) {
    next(error);
  }
};

export const getMyInterviews = async (req, res, next) => {
  try {
    const query =
      req.user.role === 'recruiter'
        ? { recruiter: req.user._id }
        : { candidate: req.user._id };

    const interviews = await Interview.find(query)
      .populate('job candidate recruiter')
      .sort('scheduledAt');

    res.json({ success: true, interviews });
  } catch (error) {
    next(error);
  }
};

export const updateInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!interview) return next(new AppError('Interview not found', 404));
    res.json({ success: true, interview });
  } catch (error) {
    next(error);
  }
};
