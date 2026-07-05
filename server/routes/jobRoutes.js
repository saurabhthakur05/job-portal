import express from 'express';
import {
  getJobs, getJob, getFeaturedJobs, getSearchSuggestions,
  createJob, updateJob, deleteJob, getRecruiterJobs, getRecruiterDashboard,getRecommendedJobs,
} from '../controllers/jobController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getJobs);
router.get('/featured', getFeaturedJobs);
router.get('/suggestions', getSearchSuggestions);

router.use(protect);
router.get('/recommended', getRecommendedJobs);
router.get('/recruiter/mine', authorize('recruiter', 'admin'), getRecruiterJobs);
router.get('/recruiter/dashboard', authorize('recruiter', 'admin'), getRecruiterDashboard);
router.post('/', authorize('recruiter', 'admin'), createJob);
router.put('/:id', authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', authorize('recruiter', 'admin'), deleteJob);

router.get('/:id', optionalAuth, getJob);

export default router;
