import User from '../models/User.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import Application from '../models/Application.js';
import ATSReport from '../models/ATSReport.js';
import { generateCoverLetter, chatbotResponse } from '../utils/aiService.js';
import { AppError } from '../middleware/errorHandler.js';

export const getDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalRecruiters, totalJobs, totalApplications, pendingJobs, pendingCompanies] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'recruiter' }),
        Job.countDocuments(),
        Application.countDocuments(),
        Job.countDocuments({ isApproved: false }),
        Company.countDocuments({ isApproved: false }),
      ]);

    const monthlyUsers = await User.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    const monthlyApplications = await Application.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    const atsDistribution = await ATSReport.aggregate([
      {
        $bucket: {
          groupBy: '$atsScore',
          boundaries: [0, 40, 60, 80, 101],
          default: 'Other',
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    const hiringFunnel = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalRecruiters, totalJobs, totalApplications, pendingJobs, pendingCompanies },
      charts: { monthlyUsers, monthlyApplications, atsDistribution, hiringFunnel },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort('-createdAt').skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({ success: true, users, pagination: { page: Number(page), total } });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { isBlocked, role, isRecruiterVerified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked, role, isRecruiterVerified },
      { new: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const moderateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { isApproved: req.body.isApproved, status: req.body.status },
      { new: true }
    );
    res.json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

export const moderateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { isApproved: req.body.isApproved, isVerified: req.body.isVerified },
      { new: true }
    );
    res.json({ success: true, company });
  } catch (error) {
    next(error);
  }
};

export const getPendingContent = async (req, res, next) => {
  try {
    const [jobs, companies] = await Promise.all([
      Job.find({ isApproved: false }).populate('company recruiter').limit(20),
      Company.find({ isApproved: false }).limit(20),
    ]);
    res.json({ success: true, jobs, companies });
  } catch (error) {
    next(error);
  }
};

export const generateCoverLetterAI = async (req, res, next) => {
  try {
    const job = await Job.findById(req.body.jobId).populate('company');
    if (!job) return next(new AppError('Job not found', 404));

    const coverLetter = generateCoverLetter({
      user: req.user,
      job,
      company: job.company,
    });

    res.json({ success: true, coverLetter });
  } catch (error) {
    next(error);
  }
};

export const chatWithAssistant = async (req, res, next) => {
  try {
    const response = chatbotResponse(req.body.message, req.user);
    res.json({ success: true, ...response });
  } catch (error) {
    next(error);
  }
};
