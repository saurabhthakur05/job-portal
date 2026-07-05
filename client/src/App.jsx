import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from './store/store';
import { SocketProvider } from './context/SocketContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { PageLoader } from './components/ui/Spinner';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AuthCallbackPage from './pages/auth/AuthCallbackPage';
import JobsPage from './pages/jobs/JobsPage';
import JobDetailsPage from './pages/jobs/JobDetailsPage';
import CompaniesPage from './pages/companies/CompaniesPage';
import CompanyDetailsPage from './pages/companies/CompanyDetailsPage';
import CreateCompanyPage from './pages/companies/CreateCompanyPage';
import ATSPage from './pages/ats/ATSPage';
import ATSReportPage from './pages/ats/ATSReportPage';
import ResumeBuilderPage from './pages/resume/ResumeBuilderPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import ApplicationsPage from './pages/dashboard/ApplicationsPage';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterJobsPage from './pages/recruiter/RecruiterJobsPage';
import RecruiterApplicationsPage from './pages/recruiter/RecruiterApplicationsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import MessagesPage from './pages/messages/MessagesPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import CareerChatbot from './components/ai/CareerChatbot';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(fetchUser());
    }
  }, [dispatch]);

  if (loading && localStorage.getItem('token')) {
    return <PageLoader />;
  }

  const content = (
    <SocketProvider user={user}>
      <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="auth/callback" element={<AuthCallbackPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/:id" element={<JobDetailsPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route
  path="companies/create"
  element={
    <ProtectedRoute roles={['recruiter', 'admin']}>
      <CreateCompanyPage />
    </ProtectedRoute>
  }
/>
        <Route path="companies/:id" element={<CompanyDetailsPage />} />
        <Route path="ats" element={<ATSPage />} />
        <Route path="ats/report/:id" element={<ProtectedRoute><ATSReportPage /></ProtectedRoute>} />
       <Route  path="resume-builder" element={<ProtectedRoute roles={["jobseeker"]}><ResumeBuilderPage /></ProtectedRoute>} />
        <Route path="dashboard" element={<ProtectedRoute roles={['jobseeker']}><DashboardPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="dashboard/applications" element={<ProtectedRoute roles={['jobseeker']}><ApplicationsPage /></ProtectedRoute>} />
        <Route path="recruiter" element={<ProtectedRoute roles={['recruiter', 'admin']}><RecruiterDashboard /></ProtectedRoute>} />
        <Route path="recruiter/jobs" element={<ProtectedRoute roles={['recruiter', 'admin']}><RecruiterJobsPage /></ProtectedRoute>} />
        <Route path="recruiter/applications/:jobId" element={<ProtectedRoute roles={['recruiter', 'admin']}><RecruiterApplicationsPage /></ProtectedRoute>} />
        <Route path="admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="messages/:userId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      </Routes>
      {isAuthenticated && <CareerChatbot />}
    </SocketProvider>
  );

  return content;
};

export default App;
