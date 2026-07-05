import Resume from '../models/Resume.js';
import { generateResumeSuggestions, rewriteBulletPoint } from '../utils/aiService.js';
import { analyzeResume } from '../utils/atsAnalyzer.js';
import { AppError } from '../middleware/errorHandler.js';

export const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort('-updatedAt');
    res.json({ success: true, resumes });
  } catch (error) {
    next(error);
  }
};

export const createResume = async (req, res, next) => {
  try {
    if (req.body.isDefault) {
      await Resume.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const resume = await Resume.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, resume });
  } catch (error) {
    next(error);
  }
};

export const updateResume = async (req, res, next) => {
  try {
    let resume = await Resume.findById(req.params.id);
    if (!resume) return next(new AppError('Resume not found', 404));
    if (resume.user.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized', 403));
    }

    if (req.body.isDefault) {
      await Resume.updateMany({ user: req.user._id }, { isDefault: false });
    }

    resume = await Resume.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, resume });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return next(new AppError('Resume not found', 404));
    if (resume.user.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized', 403));
    }
    await resume.deleteOne();
    res.json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    next(error);
  }
};

export const getResumeSuggestions = async (req, res, next) => {
  try {
    const suggestions = generateResumeSuggestions(req.user.profile, req.body.jobDescription);
    res.json({ success: true, suggestions });
  } catch (error) {
    next(error);
  }
};

export const optimizeBullet = async (req, res, next) => {
  try {
    const { bullet, context } = req.body;
    const improved = rewriteBulletPoint(bullet, context);
    res.json({ success: true, improved });
  } catch (error) {
    next(error);
  }
};

export const scoreResume = async (req, res, next) => {
  try {
    const resumeText = JSON.stringify(req.body.content || req.user.profile);
    const analysis = analyzeResume(resumeText, req.body.jobDescription || '');
    res.json({ success: true, analysis });
  } catch (error) {
    next(error);
  }
};
