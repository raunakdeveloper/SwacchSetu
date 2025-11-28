import cloudinary from '../config/cloudinary.js';
import Notice from '../models/Notice.js';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import https from 'https';

// 👇 yahan naya import:
import {
  sendPublicNoticeEmails,
  sendWorkerNoticeEmails,
} from '../utils/emailService.js';

// yeh line ab nahi chahiye:
// import { sendEmail } from '../utils/emailService.js';

// Generic uploader (images etc.) remains auto
const uploadToCloudinary = async (fileBuffer, folder, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: `garbage-reporting/${folder}`, resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const createNotice = async (req, res, next) => {
  try {
    const { title, description, audience } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    let pdfUrl = null;
    if (req.file) {
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: 'Only PDF files are allowed' });
      }
      // Store PDFs in dedicated folder with raw resource type for reliable access
      pdfUrl = await uploadToCloudinary(req.file.buffer, 'pdfs', 'raw');
    }

    const notice = new Notice({
      title,
      description: description || null,
      pdfUrl,
      audience: audience || 'public',
      createdBy: req.user.id,
    });

    await notice.save();
    await notice.populate('createdBy', 'name email');

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Send email notifications based on audience
    try {
      if (audience === 'public' || !audience) {
        // Send to all users
        const users = await User.find({
          role: 'user',
          isActive: true,
        }).select('email name');

        await sendPublicNoticeEmails(users, notice, frontendUrl);
      } else if (audience === 'worker') {
        // Send to all workers
        const workers = await Worker.find({
          isActive: true,
        }).select('email name');

        await sendWorkerNoticeEmails(workers, notice, frontendUrl);
      }
    } catch (emailError) {
      console.error('Error sending notice emails:', emailError);
      // Don't fail the notice creation if emails fail
    }

    res.status(201).json({
      message: 'Notice created successfully',
      notice,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find({ audience: 'public', isActive: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ notices });
  } catch (error) {
    next(error);
  }
};

export const getWorkerNotices = async (req, res, next) => {
  try {
      
    // Only return notices specifically for workers, not public notices
    const notices = await Notice.find({
      audience: 'worker',
      isActive: true,
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
      
    res.json({ notices });
  } catch (error) {
    console.error('Error in getWorkerNotices:', error);
    next(error);
  }
};

export const getAllNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ notices });
  } catch (error) {
    next(error);
  }
};

// Download / redirect endpoint for a notice's PDF
// Stream helper
const streamRemotePdf = (pdfUrl, res, headers = {}) => {
  try {
    const url = new URL(pdfUrl);
    https
      .get(url, (remoteRes) => {
        if (remoteRes.statusCode !== 200) {
          res
            .status(remoteRes.statusCode || 500)
            .json({ error: 'Failed to fetch PDF' });
          return;
        }
        res.set({ 'Content-Type': 'application/pdf', ...headers });
        remoteRes.pipe(res);
      })
      .on('error', () => {
        res.status(500).json({ error: 'Error streaming PDF' });
      });
  } catch (e) {
    res.status(500).json({ error: 'Invalid PDF URL' });
  }
};

export const viewNoticePdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findById(id);
    if (!notice) return res.status(404).json({ error: 'Notice not found' });
    if (!notice.pdfUrl)
      return res.status(404).json({ error: 'No PDF attached to this notice' });
    streamRemotePdf(notice.pdfUrl, res);
  } catch (error) {
    next(error);
  }
};

export const downloadNoticePdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findById(id);
    if (!notice) return res.status(404).json({ error: 'Notice not found' });
    if (!notice.pdfUrl)
      return res.status(404).json({ error: 'No PDF attached to this notice' });
    const filename = `notice-${id}.pdf`;
    streamRemotePdf(notice.pdfUrl, res, {
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    // Delete the notice
    await Notice.findByIdAndDelete(id);

    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    next(error);
  }
};
