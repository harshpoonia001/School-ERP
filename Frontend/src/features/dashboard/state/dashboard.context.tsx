import React, { createContext, useContext, useState } from 'react';
import type {
  AdminDashboardData,
  TeacherDashboardData,
  StudentDashboardData,
} from '../api/dashboard.api';

interface DashboardState {
  adminData: AdminDashboardData | null;
  teacherData: TeacherDashboardData | null;
  studentData: StudentDashboardData | null;
  isLoading: boolean;
  setAdminData: (data: AdminDashboardData | null) => void;
  setTeacherData: (data: TeacherDashboardData | null) => void;
  setStudentData: (data: StudentDashboardData | null) => void;
  setIsLoading: (loading: boolean) => void;
}

const DashboardContext = createContext<DashboardState | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminData, setAdminData] = useState<AdminDashboardData | null>(null);
  const [teacherData, setTeacherData] = useState<TeacherDashboardData | null>(null);
  const [studentData, setStudentData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <DashboardContext.Provider
      value={{
        adminData,
        teacherData,
        studentData,
        isLoading,
        setAdminData,
        setTeacherData,
        setStudentData,
        setIsLoading,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardState = (): DashboardState => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardState must be used within a DashboardProvider');
  }
  return context;
};
