import express from 'express';
import {
  createReport,
  getReports,
  getMyReports,
  getReportById,
  updateReportStatus,
  assignWorker,
  completeReport,
  upvoteReport,
} from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/roleMiddleware.js';
import { uploadImage, uploadCompletion } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, uploadImage, createReport);
router.get('/', getReports);
router.get('/my', authMiddleware, getMyReports);
router.get('/:id', getReportById);
router.patch('/:id/status', authMiddleware, checkRole('authority'), updateReportStatus);
router.patch('/:id/assign', authMiddleware, checkRole('authority'), assignWorker);
router.patch('/:id/complete', authMiddleware, checkRole('worker'), uploadCompletion, completeReport);
router.post('/:id/upvote', authMiddleware, upvoteReport);

export default router;
