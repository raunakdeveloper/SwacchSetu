// src/context/NoticeContext.jsx
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
} from 'react';
import api from '../utils/api';

const NoticeContext = createContext();

export const useNotice = () => {
  const context = useContext(NoticeContext);
  if (!context) {
    throw new Error('useNotice must be used within NoticeProvider');
  }
  return context;
};

export const NoticeProvider = ({ children }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  // =============================
  // PUBLIC NOTICES
  // =============================
  const fetchPublicNotices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/notices/public');
      const list = response.data.notices || [];
      setNotices(list);
      return list;
    } catch (error) {
      console.error('Error fetching public notices:', error);
      setNotices([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // =============================
  // WORKER NOTICES  (public + worker)
  // =============================
  const fetchWorkerNotices = useCallback(async () => {
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

  // =============================
  // AUTHORITY — FETCH ALL NOTICES
  // =============================
  const fetchAllNotices = useCallback(async () => {
    setLoading(true);
    try {
      // Yaha dhyaan do: api base URL agar /api hai to
      // backend route /api/notices/all hoga,
      // lekin api instance me baseURL already /api ho sakta hai.
      // Tumne public/worker ke liye bhi '/notices/public' use kiya hai,
      // isliye yaha bhi sahi hai:
      const response = await api.get('/notices/all'); // authority only
      const list = response.data.notices || [];
      setNotices(list);
      return list;
    } catch (error) {
      console.error('Error fetching all notices:', error);
      setNotices([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // =============================
  // AUTHORITY — CREATE NOTICE
  // =============================
  const createNotice = useCallback(async (formData) => {
    try {
      const response = await api.post('/notices', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (err) {
      console.error('Error creating notice:', err);
      throw err;
    }
  }, []);

  // =============================
  // AUTHORITY — DELETE NOTICE (optional)
  // =============================
  const deleteNotice = useCallback(async (id) => {
    try {
      const response = await api.delete(`/notices/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notice:', error);
      throw error;
    }
  }, []);

  return (
    <NoticeContext.Provider
      value={{
        notices,
        loading,

        // public + worker
        fetchPublicNotices,
        fetchWorkerNotices,

        // authority
        fetchAllNotices,
        createNotice,
        deleteNotice,
      }}
    >
      {children}
    </NoticeContext.Provider>
  );
};
