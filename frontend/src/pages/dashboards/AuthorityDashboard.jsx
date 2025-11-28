import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/sidebar';
import api from '../../utils/api';
import Loader from '../../components/loader';

const AuthorityDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/analytics/authority');
      const data = response.data || {};
      const sc = data.statusCounts || {};
      setStats({
        totalReports: data.totalReports || 0,
        pendingReports: sc.pending || 0,
        inProgressReports: sc.inprogress || 0,
        completedReports: sc.completed || 0,
        approvedReports: sc.approved || 0,
        rejectedReports: sc.rejected || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex">
        <Sidebar role="authority" />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Authority Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Total Reports</h3>
            <p className="text-3xl font-bold">{stats?.totalReports || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats?.pendingReports || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">In Progress</h3>
            <p className="text-3xl font-bold text-orange-600">{stats?.inProgressReports || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{stats?.completedReports || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/dashboard/authority/manage"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">Manage Reports</h3>
            <p className="text-gray-600">Review, approve, and assign reports to workers</p>
          </Link>
          <Link
            to="/dashboard/authority/analytics"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600">View detailed statistics and performance metrics</p>
          </Link>
        </div>
      </div>
      </div>
  );
};

export default AuthorityDashboard;