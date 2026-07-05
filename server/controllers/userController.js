import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { AppError } from '../middleware/errorHandler.js';

export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'profile'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      user: { ...user.toObject(), profileCompletion: user.getProfileCompletion() },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No file uploaded', 400));

    let avatarUrl = '';
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await uploadToCloudinary(req.file.buffer, 'avatars', 'image');
      avatarUrl = result.secure_url;
    } else {
      avatarUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true });
    res.json({ success: true, avatar: user.avatar });
  } catch (error) {
    next(error);
  }
};

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No file uploaded', 400));

    let resumeUrl = '';
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await uploadToCloudinary(req.file.buffer, 'resumes', 'raw');
      resumeUrl = result.secure_url;
    }

    const { extractTextFromFile } = await import('../utils/atsAnalyzer.js');
    const resumeText = await extractTextFromFile(req.file.buffer, req.file.mimetype);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.resumeUrl': resumeUrl, 'profile.resumeText': resumeText },
      { new: true }
    );

    res.json({ success: true, resumeUrl, resumeText });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedJobs');

    const applications = await Application.find({ applicant: req.user._id })
      .populate('job')
      .sort('-createdAt')
      .limit(10);
      const validApplications = applications.filter(app => app.job != null);

    const userSkills = user.profile?.skills || [];
    let recommendedJobs = [];

    if (userSkills.length > 0) {
      recommendedJobs = await Job.find({
        status: 'active',
        skills: { $in: userSkills },
        _id: { $nin: user.savedJobs },
      })
        .populate('company')
        .limit(6)
        .sort('-createdAt');
    } else {
      recommendedJobs = await Job.find({ status: 'active', isFeatured: true })
        .populate('company')
        .limit(6);
    }

    const stats = {
      savedJobs: user.savedJobs?.length || 0,
      applications: await Application.countDocuments({ applicant: req.user._id }),
      profileCompletion: user.getProfileCompletion(),
    };

    res.json({
      success: true,
      stats,
      recommendedJobs,
     recentApplications: validApplications,
      savedJobs: user.savedJobs,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleSaveJob = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const jobId = req.params.jobId;
    const index = user.savedJobs.indexOf(jobId);

    if (index > -1) {
      user.savedJobs.splice(index, 1);
    } else {
      user.savedJobs.push(jobId);
    }

    await user.save();
    res.json({ success: true, saved: index === -1, savedJobs: user.savedJobs });
  } catch (error) {
    next(error);
  }
};

export const addSearchHistory = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) return res.json({ success: true });

    const user = await User.findById(req.user._id);
    user.searchHistory = [query, ...user.searchHistory.filter((s) => s !== query)].slice(0, 10);
    await user.save();

    res.json({ success: true, searchHistory: user.searchHistory });
  } catch (error) {
    next(error);
  }
};
