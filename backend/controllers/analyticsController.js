import Report from '../models/Report.js';
import User from '../models/User.js';

export const getAuthorityAnalytics = async (req, res, next) => {
  try {
    const totalReports = await Report.countDocuments();

    const statusCounts = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusMap = {
      pending: 0,
      approved: 0,
      inprogress: 0,
      completed: 0,
      rejected: 0,
    };

    statusCounts.forEach((item) => {
      statusMap[item._id] = item.count;
    });

    const workers = await User.find({ role: 'worker' }).select('_id name');

    const workerPerformance = await Promise.all(
      workers.map(async (worker) => {
        const completed = await Report.countDocuments({
          assignedTo: worker._id,
          status: 'completed',
        });
        const rejected = await Report.countDocuments({
          assignedTo: worker._id,
          status: 'rejected',
        });
        const inprogress = await Report.countDocuments({
          assignedTo: worker._id,
          status: 'inprogress',
        });

        return {
          workerId: worker._id,
          workerName: worker.name,
          completedCount: completed,
          rejectedCount: rejected,
          inprogressCount: inprogress,
          rejectionRate: completed + rejected > 0 ? (rejected / (completed + rejected)) * 100 : 0,
        };
      })
    );

    const locationStats = await Report.aggregate([
      {
        $group: {
          _id: '$location.address',
          count: { $sum: 1 },
          priority: { $push: '$priority' },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    res.json({
      totalReports,
      statusCounts: statusMap,
      workerPerformance,
      locationStats,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkerAnalytics = async (req, res, next) => {
  try {
    const workerId = req.user.id;

    const completedCount = await Report.countDocuments({
      assignedTo: workerId,
      status: 'completed',
    });

    const pendingAssignedCount = await Report.countDocuments({
      assignedTo: workerId,
      status: { $in: ['pending', 'approved'] },
    });

    const inprogressCount = await Report.countDocuments({
      assignedTo: workerId,
      status: 'inprogress',
    });

    const rejectedCount = await Report.countDocuments({
      assignedTo: workerId,
      status: 'rejected',
    });

    const totalAssigned = completedCount + rejectedCount;
    const rejectionRate = totalAssigned > 0 ? (rejectedCount / totalAssigned) * 100 : 0;

    res.json({
      completedCount,
      pendingAssignedCount,
      inprogressCount,
      rejectedCount,
      rejectionRate,
    });
  } catch (error) {
    next(error);
  }
};
