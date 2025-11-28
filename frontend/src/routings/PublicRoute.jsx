import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/loader';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (user) {
    if (user.role === 'authority') {
      return <Navigate to="/dashboard/authority" replace />;
    }
    if (user.role === 'worker') {
      return <Navigate to="/dashboard/worker" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;