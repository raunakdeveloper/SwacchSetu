import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar';
import api from '../../utils/api';
import Loader from '../../components/loader';

const WorkerAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics/worker');
      const data = response.data || {};
      // If API returns zeros across the board, compute a fallback from worker endpoints
      const isZero = !data || ((data.completedCount || 0) === 0
        && (data.pendingAssignedCount || 0) === 0
        && (data.inprogressCount || 0) === 0
        && (data.rejectedCount || 0) === 0);

      if (!isZero) {
        setAnalytics(data);
        return;
      }

      // Fallback: derive counts from worker report lists
      try {
        const [assignedRes, inprogRes, completedRes] = await Promise.all([
          api.get('/worker/reports/assigned'),
          api.get('/worker/reports/inprogress'),
          api.get('/worker/reports/completed'),
        ]);

        const assigned = assignedRes?.data?.reports || assignedRes?.data || [];
        const inprog = inprogRes?.data?.reports || inprogRes?.data || [];
        const completedOrRejected = completedRes?.data?.reports || completedRes?.data || [];

        const completedCount = completedOrRejected.filter(r => r.status === 'completed').length;
        const rejectedCount = completedOrRejected.filter(r => r.status === 'rejected').length;
        const inprogressCount = inprog.length;
        const pendingAssignedCount = assigned.length;

        setAnalytics({
          completedCount,
          rejectedCount,
          inprogressCount,
          pendingAssignedCount,
        });
      } catch (e) {
        // If fallback also fails, at least show zeros on UI
        setAnalytics({});
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Ensure UI renders with zeros instead of showing a loader forever
      setAnalytics({});
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar role="worker" />
        <div className="flex-1 p-8">
          <Loader />
        </div>
      </div>
    );
  }

  const completed = analytics?.completedCount || 0;
  const pending = analytics?.pendingAssignedCount || 0;
  const inprogress = analytics?.inprogressCount || 0;
  const rejected = analytics?.rejectedCount || 0;
  const totalAssigned = completed + pending + inprogress + rejected;
  const completionRate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;
  const rejectionRate = (completed + rejected) > 0 ? Math.round((rejected / (completed + rejected)) * 100) : 0;

  return (
    <div className="flex">
        <Sidebar role="worker" />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">My Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Total Assigned</h3>
            <p className="text-4xl font-bold">{totalAssigned}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Pending Action</h3>
            <p className="text-4xl font-bold text-yellow-600">{pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">In Progress</h3>
            <p className="text-4xl font-bold text-orange-600">{inprogress}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Completed</h3>
            <p className="text-4xl font-bold text-green-600">{completed}</p>
          </div>
        </div>

        {/* Stats render with zeros even if analytics is empty */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Rejected</h3>
            <p className="text-4xl font-bold text-red-600">{rejected}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">In Progress + Pending</h3>
            <p className="text-4xl font-bold text-blue-600">{inprogress + pending}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-semibold">{completionRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rejection Rate</span>
              <span className="font-semibold">{rejectionRate}%</span>
            </div>
          </div>
        </div>
      </div>
      </div>
  );
};

export default WorkerAnalytics;