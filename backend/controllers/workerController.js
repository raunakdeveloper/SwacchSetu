import Report from '../models/Report.js';
import User from '../models/User.js';
import { createTimelineEntry } from '../utils/createTimelineEntry.js';
import * as emailService from '../utils/emailService.js';

export const getWorkers = async (req, res, next) => {
  try {
    const workers = await User.find({ role: 'worker' }).select('_id name email');
    res.json({ workers });
  } catch (error) {
    next(error);
  }
};

export const getAssignedReports = async (req, res, next) => {
  try {
    const reports = await Report.find({
      assignedTo: req.user.id,
      status: { $in: ['pending', 'approved'] },
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    next(error);
  }
};

export const getInProgressReports = async (req, res, next) => {
  try {
    const reports = await Report.find({
      assignedTo: req.user.id,
      status: 'inprogress',
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    next(error);
  }
};

export const getCompletedReports = async (req, res, next) => {
  try {
    const reports = await Report.find({
      assignedTo: req.user.id,
      status: { $in: ['completed', 'rejected'] },
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    next(error);
  }
};

export const acceptReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id).populate('createdBy');
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not assigned to you' });
    }

    if (!['pending', 'approved'].includes(report.status)) {
      return res.status(400).json({ error: 'Cannot accept report in current status' });
    }

    report.status = 'inprogress';

    const acceptEntry = createTimelineEntry('accepted_by_worker', 'Report accepted by worker', req.user.id);
    const inprogressEntry = createTimelineEntry(
      'inprogress',
      'Work in progress',
      req.user.id
    );

    report.timeline.push(acceptEntry);
    report.timeline.push(inprogressEntry);

    await report.save();

    await emailService.reportInProgress(report.createdBy, report);

    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const rejectReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reasonType, reasonText } = req.body;

    if (!reasonType) {
      return res.status(400).json({ error: 'Reject reason is required' });
    }

    const report = await Report.findById(id).populate('createdBy');
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not assigned to you' });
    }

    const reasonText_final = reasonType === 'Other' ? reasonText : reasonType;

    report.status = 'rejected';

    const timelineEntry = createTimelineEntry(
      'rejected_by_worker',
      `Report rejected by worker - Reason: ${reasonText_final}`,
      req.user.id,
      { reason: reasonText_final }
    );

    report.timeline.push(timelineEntry);
    await report.save();

    await emailService.reportRejectedByWorker(report.createdBy, report, reasonText_final);

    res.json(report);
  } catch (error) {
    next(error);
  }
};
