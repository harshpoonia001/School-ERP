import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { Role } from '../shared/types/index';

// Layout
import { DashboardLayout } from '../shared/ui/Layout/DashboardLayout';

// Auth
import { LoginPage } from '../features/auth/ui/pages/LoginPage';

// Dashboards
import { AdminDashboardPage } from '../features/dashboard/ui/pages/AdminDashboardPage';
import { TeacherDashboardPage } from '../features/dashboard/ui/pages/TeacherDashboardPage';
import { StudentDashboardPage } from '../features/dashboard/ui/pages/StudentDashboardPage';

// Management
import { TeachersPage } from '../features/teachers/ui/pages/TeachersPage';
import { ClassesPage } from '../features/classes/ui/pages/ClassesPage';
import { StudentsPage } from '../features/students/ui/pages/StudentsPage';

// Attendance
import { MarkAttendancePage } from '../features/attendance/ui/pages/MarkAttendancePage';
import { AttendanceHistoryPage } from '../features/attendance/ui/pages/AttendanceHistoryPage';
import { StudentAttendancePage } from '../features/attendance/ui/pages/StudentAttendancePage';

interface ProtectedRouteProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && !allowedRoles.includes(role)) {
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'TEACHER') return <Navigate to="/teacher" replace />;
    if (role === 'STUDENT') return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        Loading SchoolFlow ERP...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'TEACHER') return <Navigate to="/teacher" replace />;
  if (role === 'STUDENT') return <Navigate to="/student" replace />;
  return <Navigate to="/login" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="attendance" element={<AttendanceHistoryPage />} />
      </Route>

      {/* Teacher Protected Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['TEACHER']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeacherDashboardPage />} />
        <Route path="attendance/mark" element={<MarkAttendancePage />} />
        <Route path="attendance/history" element={<AttendanceHistoryPage />} />
        <Route path="students" element={<StudentsPage />} />
      </Route>

      {/* Student Protected Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboardPage />} />
        <Route path="attendance" element={<StudentAttendancePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
