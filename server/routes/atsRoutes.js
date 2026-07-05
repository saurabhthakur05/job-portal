import express from 'express';
import {
  analyzeResumeUpload, getATSReport, getMyATSReports, quickScan,
} from '../controllers/atsController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/quick-scan', quickScan);
router.use(protect);
router.post('/analyze', upload.single('resume'), analyzeResumeUpload);
router.get('/reports', getMyATSReports);
router.get('/reports/:id', getATSReport);

export default router;
