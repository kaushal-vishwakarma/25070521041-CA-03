import { Route, Routes } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import GuestRoute from './components/GuestRoute.jsx';
import PublicLayout from './layouts/PublicLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import InternshipsPage from './pages/InternshipsPage.jsx';
import InternshipDetailsPage from './pages/InternshipDetailsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ComponentPreview from './pages/ComponentPreview.jsx';

import StudentDashboardPage from './pages/student/StudentDashboardPage.jsx';
import MyApplicationsPage from './pages/student/MyApplicationsPage.jsx';
import SavedInternshipsPage from './pages/student/SavedInternshipsPage.jsx';
import StudentProfilePage from './pages/student/StudentProfilePage.jsx';

import RecruiterDashboardPage from './pages/recruiter/RecruiterDashboardPage.jsx';
import RecruiterInternshipsPage from './pages/recruiter/RecruiterInternshipsPage.jsx';
import InternshipFormPage from './pages/recruiter/InternshipFormPage.jsx';
import ApplicantsPage from './pages/recruiter/ApplicantsPage.jsx';
import RecruiterProfilePage from './pages/recruiter/RecruiterProfilePage.jsx';

// Route map of the whole application.
//   <PublicLayout>      anyone
//   <GuestRoute>        only visitors (logged-in users are sent to their dashboard)
//   <ProtectedRoute>    only the listed role(s); everyone else is redirected
// These guards improve the experience only. The Express API enforces the same rules again.
export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/internships" element={<InternshipsPage />} />
          <Route path="/internships/:id" element={<InternshipDetailsPage />} />
          {import.meta.env.DEV && <Route path="/preview" element={<ComponentPreview />} />}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['student']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/student" element={<StudentDashboardPage />} />
            <Route path="/student/applications" element={<MyApplicationsPage />} />
            <Route path="/student/saved" element={<SavedInternshipsPage />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route path="/student/*" element={<NotFoundPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['recruiter']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/recruiter" element={<RecruiterDashboardPage />} />
            <Route path="/recruiter/internships" element={<RecruiterInternshipsPage />} />
            <Route path="/recruiter/internships/new" element={<InternshipFormPage />} />
            <Route path="/recruiter/internships/:id/edit" element={<InternshipFormPage />} />
            <Route path="/recruiter/internships/:id/applicants" element={<ApplicantsPage />} />
            <Route path="/recruiter/profile" element={<RecruiterProfilePage />} />
            <Route path="/recruiter/*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
