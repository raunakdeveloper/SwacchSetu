import React, { createContext, useState, useContext } from 'react';
import api from '../utils/api';

const ReportContext = createContext();

export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within ReportProvider');
  }
  return context;
};

export const ReportProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/reports', { params });
      setReports(response.data.reports || []);
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
      return { reports: [], totalPages: 0 };
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (formData) => {
    const response = await api.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  };

  const getReport = async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data.report;
  };

  const upvoteReport = async (id) => {
    const response = await api.post(`/reports/${id}/upvote`);
    return response.data;
  };

  const updateReportStatus = async (id, status, priority) => {
    const response = await api.put(`/reports/${id}/status`, { status, priority });
    return response.data;
  };

  const assignWorker = async (id, workerId) => {
    const response = await api.put(`/reports/${id}/assign`, { workerId });
    return response.data;
  };

  return (
    <ReportContext.Provider value={{
      reports,
      loading,
      fetchReports,
      createReport,
      getReport,
      upvoteReport,
      updateReportStatus,
      assignWorker
    }}>
      {children}
    </ReportContext.Provider>
  );
};