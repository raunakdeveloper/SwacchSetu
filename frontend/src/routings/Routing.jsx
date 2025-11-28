import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import RoleRoute from './RoleRoute';
import Loader from '../components/loader';

// Lazy load all pages
const HomePage = lazy(() => import('../pages/HomePage'));
const AboutPage = lazy(() => import('../pages/AboutPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const NoticePage = lazy(() => import('../pages/NoticePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ReportsListPage = lazy(() => import('../pages/ReportsListPage'));
const ReportFormPage = lazy(() => import('../pages/ReportFormPage'));
const ReportViewPage = lazy(() => import('../pages/ReportViewPage'));

const AuthorityDashboard = lazy(() => import('../pages/dashboards/AuthorityDashboard'));
const AuthorityReportManagement = lazy(() => import('../pages/dashboards/AuthorityReportManagement'));
const AuthorityAnalytics = lazy(() => import('../pages/dashboards/AuthorityAnalytics'));
const AuthorityNotice = lazy(() => import('../pages/dashboards/AuthorityNotice'));

const WorkerDashboard = lazy(() => import('../pages/dashboards/WorkerDashboard'));
const WorkerReportManagement = lazy(() => import('../pages/dashboards/WorkerReportManagement'));
const WorkerAnalytics = lazy(() => import('../pages/dashboards/WorkerAnalytics'));
const WorkerNotice = lazy(() => import('../pages/dashboards/WorkerNotice'));

const UserProfile = lazy(() => import('../pages/dashboards/UserProfile'));
const NotFoundPage = lazy(() => import('../pages/error/NotFoundPage'));

const Routing = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/notices" element={<NoticePage />} />
      
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      
      <Route path="/reports" element={<ReportsListPage />} />
      <Route path="/reports/new" element={<ReportFormPage />} />
      <Route path="/reports/:id" element={<ReportViewPage />} />
      
      <Route 
        path="/dashboard/authority" 
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={['authority']}>
              <AuthorityDashboard />
            </RoleRoute>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/dashboard/authority/manage" 
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={['authority']}>
              <AuthorityReportManagement />
            </RoleRoute>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/dashboard/authority/analytics" 
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={['authority']}>
              <AuthorityAnalytics />
            </RoleRoute>
          </PrivateRoute>
        } 
      />

      <Route 
        path="/dashboard/authority/notices" 
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={['authority']}>
              <AuthorityNotice />
            </RoleRoute>
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/dashboard/worker" 
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={['worker']}>
              <WorkerDashboard />
            </RoleRoute>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/dashboard/worker/manage" 
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={['worker']}>
              <WorkerReportManagement />
            </RoleRoute>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/dashboard/worker/analytics" 
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={['worker']}>
              <WorkerAnalytics />
            </RoleRoute>
          </PrivateRoute>
        } 
      />

        <Route 
        path="/dashboard/worker/notices" 
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={['worker']}>
              <WorkerNotice />
            </RoleRoute>
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <PrivateRoute>
            <UserProfile />
          </PrivateRoute>
        } 
      />
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
  );
};

export default Routing;