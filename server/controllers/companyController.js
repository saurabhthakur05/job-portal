import Company from '../models/Company.js';
import Job from '../models/Job.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { AppError } from '../middleware/errorHandler.js';
import Application from "../models/Application.js";
import Interview from "../models/Interview.js";

export const getCompanies = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;
    const query = { };
    if (search) query.name = new RegExp(search, 'i');

    const skip = (Number(page) - 1) * Number(limit);
    const [companies, total] = await Promise.all([
      Company.find(query).sort('-averageRating').skip(skip).limit(Number(limit)),
      Company.countDocuments(query),
    ]);

    res.json({ success: true, companies, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

export const getTopCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find({ isApproved: true })
      .sort('-averageRating -totalReviews')
      .limit(8);
    res.json({ success: true, companies });
  } catch (error) {
    next(error);
  }
};

export const getCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
    }).populate('owner recruiters');

    if (!company) return next(new AppError('Company not found', 404));

    const jobs = await Job.find({ company: company._id, status: 'active' }).sort('-createdAt');

    res.json({ success: true, company, jobs });
  } catch (error) {
    next(error);
  }
};

export const createCompany = async (req, res, next) => {
  try { 
    const existingCompany = await Company.findOne({
  owner: req.user._id,
});

if (existingCompany) {
  return next(
    new AppError("You already own a company. You cannot create another one.", 400)
  );
}
    const company = await Company.create({
      ...req.body,
      owner: req.user._id,
      recruiters: [req.user._id],
       isApproved: true,
       isVerified: true,
    });

    await (await import('../models/User.js')).default.findByIdAndUpdate(req.user._id, { company: company._id });

    res.status(201).json({ success: true, company });
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return next(new AppError('Company not found', 404));

    const isOwner = company.owner?.toString() === req.user._id.toString();
    const isRecruiter = company.recruiters?.some((r) => r.toString() === req.user._id.toString());
    if (!isOwner && !isRecruiter && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    const updated = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, company: updated });
  } catch (error) {
    next(error);
  }
};
export const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return next(new AppError("Company not found", 404));
    }

    const isOwner = company.owner.toString() === req.user._id.toString();

    if (!isOwner && req.user.role !== "admin") {
      return next(new AppError("Not authorized", 403));
    }

   // Find all jobs of this company
const jobs = await Job.find({ company: company._id });

// Get their IDs
const jobIds = jobs.map((job) => job._id);

// Delete all interviews related to those jobs
await Interview.deleteMany({
  job: { $in: jobIds },
});

// Delete all applications related to those jobs
await Application.deleteMany({
  job: { $in: jobIds },
});

// Delete all jobs
await Job.deleteMany({
  company: company._id,
});

// Finally delete the company
await company.deleteOne();

    res.json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const uploadCompanyLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError("No file uploaded", 400));
    }

    const company = await Company.findById(req.params.id);

    if (!company) {
      return next(new AppError("Company not found", 404));
    }

    const isOwner =
      company.owner.toString() === req.user._id.toString();

    if (!isOwner && req.user.role !== "admin") {
      return next(new AppError("Not authorized", 403));
    }

    let logoUrl = company.logo;

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "companies",
        "image"
      );

      logoUrl = result.secure_url;
    }

    company.logo = logoUrl;
    await company.save();

    res.json({
      success: true,
      logo: company.logo,
    });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return next(new AppError('Company not found', 404));

    company.reviews.push({ user: req.user._id, ...req.body });
    company.updateRating();
    await company.save();

    res.json({ success: true, company });
  } catch (error) {
    next(error);
  }
};
