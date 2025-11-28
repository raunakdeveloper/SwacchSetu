import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar';
import Sidebar from '../../components/sidebar';
import api from '../../utils/api';
import Loader from '../../components/loader';

const AuthorityAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics/authority');
      setAnalytics(response.data || {});
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex">
          <Sidebar role="authority" />
          <div className="flex-1 p-8">
            <Loader />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar role="authority" />
        <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Total Reports</h3>
            <p className="text-4xl font-bold">{analytics?.totalReports || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Pending</h3>
            <p className="text-4xl font-bold text-yellow-600">{analytics?.statusCounts?.pending || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Approved</h3>
            <p className="text-4xl font-bold text-blue-600">{analytics?.statusCounts?.approved || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">In Progress</h3>
            <p className="text-4xl font-bold text-orange-600">{analytics?.statusCounts?.inprogress || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Completed</h3>
            <p className="text-4xl font-bold text-green-600">{analytics?.statusCounts?.completed || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Rejected</h3>
            <p className="text-4xl font-bold text-red-600">{analytics?.statusCounts?.rejected || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Report Statistics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-semibold">
                {analytics?.totalReports > 0
                  ? Math.round(((analytics?.statusCounts?.completed || 0) / analytics.totalReports) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Workers</span>
              <span className="font-semibold">{analytics?.workerPerformance?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default AuthorityAnalytics;