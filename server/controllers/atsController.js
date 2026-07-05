import ATSReport from '../models/ATSReport.js';
import { analyzeResume, extractTextFromFile, generateOptimizedResume } from '../utils/atsAnalyzer.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { createNotification } from '../utils/notifications.js';
import { AppError } from '../middleware/errorHandler.js';

export const analyzeResumeUpload = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('Please upload a resume file', 400));

    const resumeText = await extractTextFromFile(req.file.buffer, req.file.mimetype);
    const jobDescription = req.body.jobDescription || '';

    const analysis = analyzeResume(resumeText, jobDescription);
    const optimizedText = generateOptimizedResume(resumeText, analysis);

    let fileUrl = '';
    /*if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await uploadToCloudinary(req.file.buffer, 'ats-reports', 'raw');
      fileUrl = result.secure_url;
    }*/

    const report = await ATSReport.create({
      user: req.user._id,
      jobDescription,
      originalFileUrl: fileUrl,
      originalText: resumeText,
      optimizedText,
      ...analysis,
      recommendations: analysis.recommendations,
    });

    const io = req.app.get('io');
    await createNotification(io, {
      userId: req.user._id,
      type: 'ats_report_ready',
      title: 'ATS Report Ready',
      message: `Your resume scored ${analysis.atsScore}/100`,
      link: `/ats/report/${report._id}`,
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
     console.error("ATS Error:", error);
    next(error);
  }
};

export const getATSReport = async (req, res, next) => {
  try {
    const report = await ATSReport.findById(req.params.id);
    if (!report) return next(new AppError('Report not found', 404));
    if (report.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

export const getMyATSReports = async (req, res, next) => {
  try {
    const reports = await ATSReport.find({ user: req.user._id }).sort('-createdAt').limit(20);
    res.json({ success: true, reports });
  } catch (error) {
    next(error);
  }
};

export const quickScan = async (req, res, next) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText) return next(new AppError('Resume text is required', 400));

    const analysis = analyzeResume(resumeText, jobDescription || '');
    const optimizedText = generateOptimizedResume(resumeText, analysis);

    res.json({ success: true, analysis, optimizedText });
  } catch (error) {
    next(error);
  }
};
