import Job from '../models/Job.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { calculateJobMatch } from "../utils/aiJobMatcher.js";

export const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      salaryMin,
      salaryMax,
      experience,
      skills,
      company,
      workMode,
      jobType,
      page = 1,
      limit = 12,
      sort = '-createdAt',
    } = req.query;

    const query = { status: 'active', isApproved: true };

    if (search) {
      query.$text = { $search: search };
      if (req.user) {
        await User.findByIdAndUpdate(req.user._id, {
          $push: { searchHistory: { $each: [search], $position: 0, $slice: 10 } },
        });
      }
    }
    if (location) query.location = new RegExp(location, 'i');
    if (salaryMin) query['salary.min'] = { $gte: Number(salaryMin) };
    if (salaryMax) query['salary.max'] = { $lte: Number(salaryMax) };
    if (experience) query['experience.min'] = { $lte: Number(experience) };
    if (skills) query.skills = { $in: skills.split(',').map((s) => s.trim()) };
    if (company) query.company = company;
    if (workMode) query.workMode = workMode;
    if (jobType) query.jobType = jobType;

    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find(query).populate('company').sort(sort).skip(skip).limit(Number(limit)),
      Job.countDocuments(query),
    ]);

    res.json({
      success: true,
      jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('company recruiter');
    if (!job) return next(new AppError('Job not found', 404));

    job.views += 1;
    await job.save();

    let isSaved = false;
    if (req.user) {
      const user = await User.findById(req.user._id);
      isSaved = user.savedJobs?.includes(job._id);
    }

    res.json({ success: true, job, isSaved });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: 'active', isFeatured: true })
      .populate('company')
      .limit(8)
      .sort('-createdAt');
    res.json({ success: true, jobs });
  } catch (error) {
    next(error);
  }
};

export const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const [jobs, companies] = await Promise.all([
      Job.find({ title: new RegExp(q, 'i'), status: 'active' }).select('title location').limit(5),
      Company.find({ name: new RegExp(q, 'i'), isApproved: true }).select('name').limit(3),
    ]);

    const suggestions = [
      ...jobs.map((j) => ({ type: 'job', text: j.title, sub: j.location })),
      ...companies.map((c) => ({ type: 'company', text: c.name })),
    ];

    const trending = ['Software Engineer', 'Remote', 'Data Analyst', 'Product Manager', 'UX Designer'];

    res.json({ success: true, suggestions, trending });
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const company = await Company.findById(req.body.company);

    if (!company) {
      return next(new AppError("Company not found", 404));
    }

    // Check ownership
    const isOwner =
      company.owner.toString() === req.user._id.toString();

    if (!isOwner && req.user.role !== "admin") {
      return next(new AppError("You are not authorized to post jobs for this company.", 403));
    }

    const job = await Job.create({
      ...req.body,
      recruiter: req.user._id,
      companyName: company.name,
    });

    res.status(201).json({
      success: true,
      job,
    });

  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return next(new AppError('Job not found', 404));
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return next(new AppError('Job not found', 404));
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    await job.deleteOne();
    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    next(error);
  }
};

export const getRecruiterJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).populate('company').sort('-createdAt');
    res.json({ success: true, jobs });
  } catch (error) {
    next(error);
  }
};

export const getRecruiterDashboard = async (req, res, next) => {
  try {
    const Application = (await import('../models/Application.js')).default;
    const jobs = await Job.find({ recruiter: req.user._id });
    const jobIds = jobs.map((j) => j._id);

    const [totalApplications, applications] = await Promise.all([
      Application.countDocuments({ job: { $in: jobIds } }),
      Application.find({ job: { $in: jobIds } })
        .populate('applicant job')
        .sort('-createdAt')
        .limit(10),
    ]);

    const activeJobs = jobs.filter((j) => j.status === 'active').length;

    const monthlyApps = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      stats: {
        totalJobs: jobs.length,
        activeJobs,
        totalApplications,
        pausedJobs: jobs.filter((j) => j.status === 'paused').length,
      },
      recentApplications: applications,
      monthlyApplications: monthlyApps,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};
export const getRecommendedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const jobs = await Job.find({
      status: "active",
    }).populate("company");

    const recommendations = jobs
      .map((job) => {
        const match = calculateJobMatch(user, job);

       return {
  ...job.toObject(),
  matchPercentage: match.matchPercentage,
  matchedSkills: match.matchedSkills,
  missingSkills: match.missingSkills,
  matchReason: match.matchReason,
};
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({
      success: true,
      jobs: recommendations,
    });
  } catch (error) {
    next(error);
  }
};