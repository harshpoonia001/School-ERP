import { apiClient } from '../../../shared/api/apiClient';
import type { Teacher } from '../../../shared/types/index';

export interface CreateTeacherDto {
  name: string;
  email: string;
  password?: string;
  phone?: string | null;
  subject: string;
  employeeId?: string | null;
  classId?: string | null;
}

export interface UpdateTeacherDto {
  name?: string;
  phone?: string | null;
  subject?: string;
  employeeId?: string | null;
  classId?: string | null;
}

export const teachersApi = {
  getAll: async (search?: string): Promise<Teacher[]> => {
    const params = search ? { search } : {};
    const res = await apiClient.get<{ success: boolean; data: Teacher[] }>('/teachers', { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Teacher> => {
    const res = await apiClient.get<{ success: boolean; data: Teacher }>(`/teachers/${id}`);
    return res.data.data;
  },

  create: async (dto: CreateTeacherDto): Promise<Teacher> => {
    const res = await apiClient.post<{ success: boolean; data: Teacher }>('/teachers', dto);
    return res.data.data;
  },

  update: async (id: string, dto: UpdateTeacherDto): Promise<Teacher> => {
    const res = await apiClient.put<{ success: boolean; data: Teacher }>(`/teachers/${id}`, dto);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/teachers/${id}`);
  },
};
