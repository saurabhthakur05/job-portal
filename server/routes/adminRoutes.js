import express from 'express';
import {
  getDashboard, getUsers, updateUser, moderateJob, moderateCompany,
  getPendingContent, generateCoverLetterAI, chatWithAssistant,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/ai/cover-letter', generateCoverLetterAI);
router.post('/ai/chat', chatWithAssistant);

router.use(authorize('admin'));
router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.put('/jobs/:id', moderateJob);
router.put('/companies/:id', moderateCompany);
router.get('/pending', getPendingContent);

export default router;
