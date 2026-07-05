import express from 'express';
import {
  applyToJob, getMyApplications, getJobApplications,
  updateApplicationStatus, getApplication,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.post('/:jobId', authorize('jobseeker'), upload.single('resume'), applyToJob);
router.get('/my', authorize('jobseeker'), getMyApplications);
router.get('/job/:jobId', authorize('recruiter', 'admin'), getJobApplications);
router.get('/:id', getApplication);
router.put('/:id/status', authorize('recruiter', 'admin'), updateApplicationStatus);

export default router;
