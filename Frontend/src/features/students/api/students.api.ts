import { apiClient } from '../../../shared/api/apiClient';
import { Student } from '../../../shared/types/index';

export interface CreateStudentDto {
  name: string;
  rollNumber: string;
  classId: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string | null;
  dateOfBirth?: string | null;
  studentId?: string | null;
  email?: string | null;
  password?: string;
}

export interface UpdateStudentDto {
  name?: string;
  rollNumber?: string;
  classId?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string | null;
  dateOfBirth?: string | null;
  studentId?: string | null;
  portalEmail?: string | null;
  portalPassword?: string | null;
  portalAction?: 'grant' | 'update' | 'revoke' | 'toggle_active' | 'suspend' | 'reactivate';
  portalActive?: boolean;
  user?: {
    email?: string | null;
    password?: string | null;
    isActive?: boolean;
  };
}

export const studentsApi = {
  getAll: async (classId?: string, search?: string): Promise<Student[]> => {
    const params: any = {};
    if (classId && classId !== 'all') params.classId = classId;
    if (search) params.search = search;

    const res = await apiClient.get<{ success: boolean; data: Student[] }>('/students', { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Student> => {
    const res = await apiClient.get<{ success: boolean; data: Student }>(`/students/${id}`);
    return res.data.data;
  },

  create: async (dto: CreateStudentDto): Promise<Student> => {
    const res = await apiClient.post<{ success: boolean; data: Student }>('/students', dto);
    return res.data.data;
  },

  update: async (id: string, dto: UpdateStudentDto): Promise<Student> => {
    const res = await apiClient.put<{ success: boolean; data: Student }>(`/students/${id}`, dto);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/students/${id}`);
  },
};
