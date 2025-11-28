// src/context/WorkerContext.jsx
import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../utils/api';

const WorkerContext = createContext();

export const useWorker = () => {
  const context = useContext(WorkerContext);
  if (!context) {
    throw new Error('useWorker must be used within WorkerProvider');
  }
  return context;
};

export const WorkerProvider = ({ children }) => {
  const [workerReports, setWorkerReports] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignedReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/worker/reports/assigned');
      const list = response.data.reports || response.data || [];
      setWorkerReports(list);
      return list;
    } catch (error) {
      console.error('Error fetching assigned reports:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchInprogressReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/worker/reports/inprogress');
      const list = response.data.reports || response.data || [];
      setWorkerReports(list);
      return list;
    } catch (error) {
      console.error('Error fetching inprogress reports:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/worker/reports/completed');
      const list = response.data.reports || response.data || [];
      setWorkerReports(list);
      return list;
    } catch (error) {
      console.error('Error fetching completed reports:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const acceptReport = async (reportId) => {
    const response = await api.patch(`/worker/reports/${reportId}/accept`);
    return response.data;
  };

  const rejectReport = async (reportId, reason) => {
    // backend expects { reasonType, reasonText }, use 'Other' + text
    const response = await api.patch(`/worker/reports/${reportId}/reject`, { reasonType: 'Other', reasonText: reason });
    return response.data;
  };

  const completeReport = async (reportId, formData) => {
    const response = await api.patch(`/reports/${reportId}/complete`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  };

  // =============================
  // WORKER NOTICES
  // =============================
  const fetchAllNotices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/notices/worker');
      const list = response.data.notices || [];
      setNotices(list);
      return list;
    } catch (error) {
      console.error('Error fetching worker notices:', error);
      setNotices([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <WorkerContext.Provider
      value={{
        workerReports,
        notices,
        loading,
        fetchAssignedReports,
        fetchInprogressReports,
        fetchCompletedReports,
        acceptReport,
        rejectReport,
        completeReport,
        fetchAllNotices,
      }}
    >
      {children}
    </WorkerContext.Provider>
  );
};
