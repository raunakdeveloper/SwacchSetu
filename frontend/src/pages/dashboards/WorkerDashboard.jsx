import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/sidebar';
import { useWorker } from '../../context/WorkerContext';
import ReportTable from '../../components/ReportTable';
import Loader from '../../components/loader';

const WorkerDashboard = () => {
  const { fetchAssignedReports, fetchInprogressReports, fetchCompletedReports, workerReports, loading } = useWorker();
  const [stats, setStats] = useState({
    assigned: 0,
    inprogress: 0,
    completed: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Fetch counts from context endpoints
      const [inprog, completed] = await Promise.all([
        fetchInprogressReports(),
        fetchCompletedReports(),
      ]);
      const assigned = await fetchAssignedReports(); // fetch last so table shows assigned list

      setStats({
        assigned: assigned?.length || 0,
        inprogress: inprog?.length || 0,
        completed: completed?.length || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({ assigned: 0, inprogress: 0, completed: 0 });
    }
  };

  return (
    <div className="flex">
        <Sidebar role="worker" />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Worker Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Assigned to Me</h3>
            <p className="text-4xl font-bold text-blue-600">{stats.assigned}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">In Progress</h3>
            <p className="text-4xl font-bold text-orange-600">{stats.inprogress}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Completed</h3>
            <p className="text-4xl font-bold text-green-600">{stats.completed}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Assigned Reports Pending Action</h2>
          {loading ? (
            <Loader />
          ) : !workerReports || workerReports.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending reports</p>
          ) : (
            <ReportTable
              reports={(workerReports || []).slice(0, 5)}
              columns={{ assignedBy: true }}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/dashboard/worker/manage"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">Report Management</h3>
            <p className="text-gray-600">Accept, reject, and complete assigned reports</p>
          </Link>
          <Link
            to="/dashboard/worker/analytics"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600">View your performance statistics</p>
          </Link>
        </div>
      </div>
      </div>
  );
};

export default WorkerDashboard;