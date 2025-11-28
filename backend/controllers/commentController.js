import Comment from '../models/Comment.js';
import Report from '../models/Report.js';
import User from '../models/User.js';

const determineRoleTag = (userRole) => {
  if (userRole === 'authority') return 'authority';
  if (userRole === 'worker') return 'worker';
  return null;
};

export const getComments = async (req, res, next) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const comments = await Comment.find({ report: reportId })
      .populate('author', 'name email role avatar')
      .sort({ createdAt: -1 });

    res.json({ comments });
  } catch (error) {
    next(error);
  }
};

export const createComment = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { content, parentComment, parentCommentId } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const user = await User.findById(req.user.id);
    const roleTag = determineRoleTag(user.role);

    // Enforce limits for non-authority users:
    // - Max 1 top-level comment per report
    // - Max 1 reply (any parent) per report
    if (user.role !== 'authority') {
      const isReply = Boolean(parentComment || parentCommentId);
      if (isReply) {
        const replyCount = await Comment.countDocuments({
          report: reportId,
          author: req.user.id,
          parentComment: { $ne: null },
        });
        if (replyCount >= 1) {
          return res.status(403).json({ error: 'Only one reply allowed per report' });
        }
      } else {
        const topLevelCount = await Comment.countDocuments({
          report: reportId,
          author: req.user.id,
          parentComment: null,
        });
        if (topLevelCount >= 1) {
          return res.status(403).json({ error: 'Only one comment allowed per report' });
        }
      }
    }

    const comment = new Comment({
      report: reportId,
      author: req.user.id,
      authorRoleTag: roleTag,
      parentComment: parentComment || parentCommentId || null,
      content,
    });

    await comment.save();
    await comment.populate('author', 'name email role avatar');

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};
