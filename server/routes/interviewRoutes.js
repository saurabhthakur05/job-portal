import express from 'express';
import { scheduleInterview, getMyInterviews, updateInterview } from '../controllers/interviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', scheduleInterview);
router.get('/', getMyInterviews);
router.put('/:id', updateInterview);

export default router;
