import cloudinary from '../config/cloudinary.js';
import mongoose from 'mongoose';
import Report from '../models/Report.js';
import Counter from '../models/Counter.js';
import User from '../models/User.js';
import { createTimelineEntry } from '../utils/createTimelineEntry.js';
import * as emailService from '../utils/emailService.js';
import { generateIssueId } from '../utils/generateId.js';

const uploadToCloudinary = async (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: `garbage-reporting/${folder}` },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const createReport = async (req, res, next) => {
  try {
    const { title, description, location } = req.body;
    const locationData =
      typeof location === 'string' ? JSON.parse(location) : location;

    if (!title || !description || !locationData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, 'reports');

    // Get next sequential issue id (GRS-1, GRS-2, ...)
    const issueId = await generateIssueId();

    const timelineEntry = createTimelineEntry(
      'pending',
      'Report submitted',
      req.user.id
    );

    const report = new Report({
      issueId,
      title,
      description,
      image: imageUrl,
      location: {
        address: locationData.address,
        latitude: locationData.latitude || null,
        longitude: locationData.longitude || null,
      },
      createdBy: req.user.id,
      timeline: [timelineEntry],
    });

    await report.save();
    await report.populate('createdBy', 'name email role');

    const user = await User.findById(req.user.id);
    await emailService.reportSubmitted(user, report);

    return res.status(201).json({
      message: 'Report submitted successfully',
      report,
    });
  } catch (error) {
    next(error);
  }
};

// GET /reports?status=&priority=&createdBy=&page=&limit=&search=&sortBy=&order=
export const getReports = async (req, res, next) => {
  try {
    let {
      status,
      priority,
      createdBy,
      page = 1,
      limit = 12,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      reportId,
    } = req.query;

    const filter = {};

    if (status) {
      if (status === 'assigned') {
        // Special filter: show reports that have been assigned to a worker
        filter.assignedTo = { $ne: null };
      } else if (typeof status === 'string' && status.includes(',')) {
        filter.status = { $in: status.split(',').map(s => s.trim()).filter(Boolean) };
      } else {
        filter.status = status;
      }
    }
    if (priority) filter.priority = priority;
    if (createdBy) filter.createdBy = createdBy;
    if (reportId) {
      const idInput = String(reportId).trim();
      if (idInput.startsWith('GRS-')) {
        const parts = idInput.split('-');
        if (parts.length === 2) {
            const seqPart = parts[1];
            filter.issueId = { $regex: `^GRS-${seqPart}(?:-[A-Z0-9]{6})?$` };
        } else {
          // Full format provided
          filter.issueId = idInput;
        }
      } else {
        filter.issueId = { $regex: `^(?:${idInput}|GRS-${idInput}(?:-[A-Z0-9]{6})?)$` };
      }
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;
    const total = await Report.countDocuments(filter);

    const sortOrder = order === 'asc' ? 1 : -1;
    let sortStage = {};

    if (sortBy === 'upvotesCount') {
      sortStage = { upvotesCount: sortOrder, createdAt: -1 };
    } else if (sortBy === 'title') {
      sortStage = { title: sortOrder };
    } else {
      sortStage = { createdAt: sortOrder };
    }

    const pipeline = [
      { $match: filter },
      {
        $addFields: {
          upvotesCount: {
            $size: { $ifNull: ['$upvotedBy', []] },
          },
        },
      },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: limit },
    ];

    let reports = await Report.aggregate(pipeline);

    reports = await Report.populate(reports, [
      { path: 'createdBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email' },
    ]);

    return res.json({
      reports,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReports: total,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ createdBy: req.user.id })
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    return res.json(reports);
  } catch (error) {
    next(error);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .select('+completionNote')
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email')
      .populate({
        path: 'timeline.by',
        select: 'name email role',
      });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Get comments count
    const Comment = mongoose.model('Comment');
    const commentsCount = await Comment.countDocuments({ report: id });

    const reportData = report.toJSON();
    reportData.upvotes = report.upvotedBy.length;
    reportData.commentsCount = commentsCount;

    return res.json({ report: reportData });
  } catch (error) {
    next(error);
  }
};

export const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority, reasonType, reasonText } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Authority must not directly mark a report as completed
    if (req.user?.role === 'authority' && status === 'completed') {
      return res.status(403).json({ error: 'Authority cannot mark report as completed. Workers complete with proof.' });
    }

    if (status === 'rejected' && !reasonType) {
      return res.status(400).json({ error: 'Reject reason is required' });
    }

    const report = await Report.findById(id).populate('createdBy');
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const reasonText_final = reasonType === 'Other' ? reasonText : reasonType;

    const timelineEntry = createTimelineEntry(
      status === 'rejected' ? 'rejected_by_authority' : status,
      `Status updated to ${status}${
        reasonText_final ? ` - Reason: ${reasonText_final}` : ''
      }`,
      req.user.id,
      reasonText_final ? { reason: reasonText_final } : null
    );

    report.status = status;
    if (priority) report.priority = priority;
    report.timeline.push(timelineEntry);

    await report.save();
    await report.populate('createdBy', 'name email');

    if (status === 'rejected') {
      await emailService.reportRejected(
        report.createdBy,
        report,
        reasonText_final
      );
    } else {
      await emailService.reportStatusUpdated(
        report.createdBy,
        report,
        status
      );
    }

    return res.json(report);
  } catch (error) {
    next(error);
  }
};

export const assignWorker = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({ error: 'Worker ID is required' });
    }

    const report = await Report.findById(id).populate('createdBy');
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const worker = await User.findById(workerId);
    if (!worker || worker.role !== 'worker') {
      return res.status(404).json({ error: 'Worker not found' });
    }

    report.assignedTo = workerId;

    const timelineEntry = createTimelineEntry(
      'assigned_to_worker',
      `Assigned to worker ${worker.name}`,
      req.user.id,
      { workerId }
    );

    report.timeline.push(timelineEntry);
    await report.save();

    const authority = await User.findById(req.user.id);
    await emailService.reportAssignedToWorker(report.createdBy, report, worker);
    await emailService.newAssignmentToWorker(worker, report);

    await report.populate('createdBy assignedTo', 'name email');

    return res.json(report);
  } catch (error) {
    next(error);
  }
};

export const completeReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { completionNote } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Completion image is required' });
    }

    const report = await Report.findById(id).populate('createdBy');
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.assignedTo.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: 'Only assigned worker can complete this report' });
    }

    const completionImageUrl = await uploadToCloudinary(
      req.file.buffer,
      'completions'
    );

    report.completionImage = completionImageUrl;
    if (completionNote) {
      report.completionNote = completionNote;
    }
    report.status = 'completed';

    const worker = await User.findById(req.user.id);
    const message = `Work completed by ${worker.name}`;

    const timelineEntry = createTimelineEntry(
      'completed',
      message,
      req.user.id
    );
    report.timeline.push(timelineEntry);

    await report.save();

    await emailService.reportCompleted(report.createdBy, report);

    return res.json(report);
  } catch (error) {
    next(error);
  }
};

export const upvoteReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const upvoteIndex = report.upvotedBy.indexOf(userId);

    if (upvoteIndex > -1) {
      report.upvotedBy.splice(upvoteIndex, 1);
    } else {
      report.upvotedBy.push(userId);
    }

    await report.save();

    return res.json({
      upvoted: upvoteIndex === -1,
      upvotes: report.upvotedBy.length,
    });
  } catch (error) {
    next(error);
  }
};
