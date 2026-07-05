import express from 'express';
import {
  getCompanies, getTopCompanies, getCompany, createCompany,
  updateCompany, deleteCompany, uploadCompanyLogo, addReview,
} from '../controllers/companyController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getCompanies);
router.get('/top', getTopCompanies);
router.get('/:id', optionalAuth, getCompany);

router.use(protect);
router.post('/', authorize('recruiter', 'admin'), createCompany);
router.put('/:id', authorize('recruiter', 'admin'), updateCompany);
router.delete('/:id', authorize('recruiter', 'admin'), deleteCompany);
router.post('/:id/logo', authorize('recruiter', 'admin'), upload.single('logo'), uploadCompanyLogo);
router.post('/:id/reviews', authorize('jobseeker'), addReview);

export default router;
