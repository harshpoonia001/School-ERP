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
  isAttendanceDayLaunched: boolean;
  activeAttendanceDate: string;
  rankedAbsenceHighlights: Array<{
    classId: string;
    className: string;
    roomNumber?: string | null;
    absentCount: number;
    lateCount?: number;
    totalEnrolled: number;
  }>;
  recentSubmissions: Array<{
    classId: string;
    className: string;
    teacherName: string;
    time: string;
    presentCount: number;
    totalCount: number;
  }>;
  classSummaries: Array<{
    classId: string;
    className: string;
    roomNumber?: string | null;
    teacherName: string;
    totalEnrolled: number;
    markedCount: number;
    presentCount: number;
    absentCount: number;
    lateCount?: number;
    attendanceRate?: number;
    status: string;
  }>;
}

export interface TeacherDashboardData {
  isAttendanceDayLaunched: boolean;
  managedClasses: Array<{
    classId: string;
    className: string;
    roomNumber?: string | null;
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
    roomNumber?: string | null;
    classTeacher: string;
    advisorSubject?: string | null;
    guardianPhone?: string | null;
  };
  stats: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendancePercentage: number;
  };
  thirtyDaysTimeline: Array<{
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'UNRECORDED';
    remarks?: string | null;
  }>;
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
