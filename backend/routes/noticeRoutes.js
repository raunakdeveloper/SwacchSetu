import express from 'express';
import {
  createNotice,
  getPublicNotices,
  getWorkerNotices,
  getAllNotices,
  viewNoticePdf,
  downloadNoticePdf,
  deleteNotice,
} from '../controllers/noticeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/roleMiddleware.js';
import { uploadPDF } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Multer error handler
const handleMulterError = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'PDF file size must be less than 1MB' });
    }
    if (err.message === 'Only PDF files are allowed for notices') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(400).json({ error: err.message || 'File upload error' });
  }
  next();
};

// PDF view and download must come before other parameter-less paths
router.get('/:id.pdf', viewNoticePdf);
router.get('/:id/download', downloadNoticePdf);

router.post('/', authMiddleware, checkRole('authority'), uploadPDF, handleMulterError, createNotice);
router.get('/public', getPublicNotices);
router.get('/worker', authMiddleware, checkRole('worker'), getWorkerNotices);
router.get('/all', authMiddleware, checkRole('authority'), getAllNotices);
router.delete('/:id', authMiddleware, checkRole('authority'), deleteNotice);

export default router;
