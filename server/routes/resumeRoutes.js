import express from 'express';
import {
  getResumes, createResume, updateResume, deleteResume,
  getResumeSuggestions, optimizeBullet, scoreResume,
} from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getResumes);
router.post('/', createResume);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);
router.post('/suggestions', getResumeSuggestions);
router.post('/optimize-bullet', optimizeBullet);
router.post('/score', scoreResume);

export default router;
