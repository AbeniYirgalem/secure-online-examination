import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Examination Management Pages
import ExaminationsPage from '../pages/instructor/ExaminationsPage';
import ExamEditorPage from '../pages/instructor/ExamEditorPage';
import ExamDetailsPage from '../pages/instructor/ExamDetailsPage';
import AvailableExamsPage from '../pages/student/AvailableExamsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages Layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Student Available Examinations Route */}
        <Route
          path="/examinations/available"
          element={
            <ProtectedRoute>
              <AvailableExamsPage />
            </ProtectedRoute>
          }
        />

        {/* Instructor Examination Management Routes */}
        <Route
          path="/examinations"
          element={
            <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
              <ExaminationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/examinations/create"
          element={
            <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
              <ExamEditorPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/examinations/:id"
          element={
            <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
              <ExamDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/examinations/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
              <ExamEditorPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
