import { apiClient } from '../../../shared/api/apiClient';

export interface AdminDashboardData {
  metrics: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    todayAttendanceRate: string;
    presentToday: number;
    absentToday: number;
    lateToday: number;
    totalMarkedToday: number;
  };
  classSummaries: Array<{
    classId: string;
    className: string;
    teacherName: string;
    totalEnrolled: number;
    markedCount: number;
    presentCount: number;
    status: string;
  }>;
}

export interface TeacherDashboardData {
  managedClasses: Array<{
    classId: string;
    className: string;
    totalStudents: number;
    isAttendanceMarkedToday: boolean;
    presentToday: number;
    absentToday: number;
    monthlyAttendanceRate: string;
  }>;
}

export interface StudentDashboardData {
  profile: {
    name: string;
    rollNumber: string;
    institutionalId: string | null;
    className: string;
    classTeacher: string;
  };
  stats: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendancePercentage: number;
  };
  recentLogs: Array<{
    id: string;
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    remarks?: string | null;
  }>;
}

export const dashboardApi = {
  getAdminDashboard: async (): Promise<AdminDashboardData> => {
    const res = await apiClient.get<{ success: boolean; data: AdminDashboardData }>('/dashboard/admin');
    return res.data.data;
  },

  getTeacherDashboard: async (): Promise<TeacherDashboardData> => {
    const res = await apiClient.get<{ success: boolean; data: TeacherDashboardData }>('/dashboard/teacher');
    return res.data.data;
  },

  getStudentDashboard: async (): Promise<StudentDashboardData> => {
    const res = await apiClient.get<{ success: boolean; data: StudentDashboardData }>('/dashboard/student');
    return res.data.data;
  },
};
