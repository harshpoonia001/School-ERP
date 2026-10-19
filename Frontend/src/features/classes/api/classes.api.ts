import { apiClient } from '../../../shared/api/apiClient';
import { SchoolClass, Student } from '../../../shared/types/index';

export interface CreateClassDto {
  name: string;
  section: string;
  academicYear?: string;
  classTeacherId?: string | null;
}

export interface UpdateClassDto {
  name?: string;
  section?: string;
  academicYear?: string;
  classTeacherId?: string | null;
}

export const classesApi = {
  getAll: async (): Promise<SchoolClass[]> => {
    const res = await apiClient.get<{ success: boolean; data: SchoolClass[] }>('/classes');
    return res.data.data;
  },

  getById: async (id: string): Promise<SchoolClass> => {
    const res = await apiClient.get<{ success: boolean; data: SchoolClass }>(`/classes/${id}`);
    return res.data.data;
  },

  getClassStudents: async (classId: string): Promise<Student[]> => {
    const res = await apiClient.get<{ success: boolean; data: Student[] }>(`/classes/${classId}/students`);
    return res.data.data;
  },

  create: async (dto: CreateClassDto): Promise<SchoolClass> => {
    const res = await apiClient.post<{ success: boolean; data: SchoolClass }>('/classes', dto);
    return res.data.data;
  },

  update: async (id: string, dto: UpdateClassDto): Promise<SchoolClass> => {
    const res = await apiClient.put<{ success: boolean; data: SchoolClass }>(`/classes/${id}`, dto);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/classes/${id}`);
  },
};
