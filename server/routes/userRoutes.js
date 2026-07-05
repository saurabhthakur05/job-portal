import express from 'express';
import {
  updateProfile, uploadAvatar, uploadResume, getDashboard, toggleSaveJob, addSearchHistory,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.put('/profile', updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.post('/resume', upload.single('resume'), uploadResume);
router.get('/dashboard', authorize('jobseeker'), getDashboard);
router.post('/saved-jobs/:jobId', authorize('jobseeker'), toggleSaveJob);
router.post('/search-history', addSearchHistory);

export default router;
