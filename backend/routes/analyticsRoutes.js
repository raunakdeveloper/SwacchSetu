import express from 'express';
import { getAuthorityAnalytics, getWorkerAnalytics } from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/authority', authMiddleware, checkRole('authority'), getAuthorityAnalytics);
router.get('/worker', authMiddleware, checkRole('worker'), getWorkerAnalytics);

export default router;
