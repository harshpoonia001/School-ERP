import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './shared/ui/Toast/ToastContext';
import { AuthProvider } from './features/auth/state/auth.context';
import { DashboardProvider } from './features/dashboard/state/dashboard.context';
import { TeachersProvider } from './features/teachers/state/teachers.context';
import { ClassesProvider } from './features/classes/state/classes.context';
import { StudentsProvider } from './features/students/state/students.context';
import { AttendanceProvider } from './features/attendance/state/attendance.context';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <DashboardProvider>
            <TeachersProvider>
              <ClassesProvider>
                <StudentsProvider>
                  <AttendanceProvider>
                    <AppRoutes />
                  </AttendanceProvider>
                </StudentsProvider>
              </ClassesProvider>
            </TeachersProvider>
          </DashboardProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
