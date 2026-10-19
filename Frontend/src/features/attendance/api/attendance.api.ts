import { apiClient } from '../../../shared/api/apiClient';
import {
  AttendanceRecord,
  ClassAttendanceData,
  AttendanceStatus,
} from '../../../shared/types/index';

export interface MarkAttendanceDto {
  classId: string;
  date: string; // YYYY-MM-DD
  records: Array<{
    studentId: string;
    status: AttendanceStatus;
    remarks?: string | null;
  }>;
}

export const attendanceApi = {
  markAttendance: async (dto: MarkAttendanceDto): Promise<{ success: boolean; count: number; message: string }> => {
    const res = await apiClient.post<{ success: boolean; count: number; message: string }>('/attendance/mark', dto);
    return res.data;
  },

  getClassAttendanceByDate: async (classId: string, date: string): Promise<ClassAttendanceData> => {
    const res = await apiClient.get<{ success: boolean; data: ClassAttendanceData }>(`/attendance/class/${classId}`, {
      params: { date },
    });
    return res.data.data;
  },

  getHistory: async (params?: {
    classId?: string;
    studentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AttendanceRecord[]> => {
    const res = await apiClient.get<{ success: boolean; data: AttendanceRecord[] }>('/attendance/history', {
      params,
    });
    return res.data.data;
  },

  downloadCsv: async (params?: { classId?: string; startDate?: string; endDate?: string }): Promise<void> => {
    const response = await apiClient.get('/attendance/export', {
      params,
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance-${params?.classId || 'all'}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  launchDay: async (): Promise<{ success: boolean; message: string; date: string }> => {
    const res = await apiClient.post<{ success: boolean; message: string; date: string }>('/attendance/day/launch');
    return res.data;
  },

  getDayStatus: async (date?: string): Promise<{ success: boolean; isLaunched: boolean; date: string; openedAt?: string; openedBy?: string }> => {
    const res = await apiClient.get<{ success: boolean; isLaunched: boolean; date: string; openedAt?: string; openedBy?: string }>('/attendance/day/status', {
      params: { date },
    });
    return res.data;
  },
};
