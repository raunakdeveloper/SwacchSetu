import express from 'express';
import {
  getWorkers,
  getAssignedReports,
  getInProgressReports,
  getCompletedReports,
  acceptReport,
  rejectReport,
} from '../controllers/workerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Authority-only: list all workers
router.get('/workers', authMiddleware, checkRole('authority'), getWorkers);

// Worker-only routes
router.get('/reports/assigned', authMiddleware, checkRole('worker'), getAssignedReports);
router.get('/reports/inprogress', authMiddleware, checkRole('worker'), getInProgressReports);
router.get('/reports/completed', authMiddleware, checkRole('worker'), getCompletedReports);
router.patch('/reports/:id/accept', authMiddleware, checkRole('worker'), acceptReport);
router.patch('/reports/:id/reject', authMiddleware, checkRole('worker'), rejectReport);

export default router;
