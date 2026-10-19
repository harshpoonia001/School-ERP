import { useCallback } from 'react';
import { useTeachersState } from '../state/teachers.context';
import { teachersApi } from '../api/teachers.api';
import type { CreateTeacherDto, UpdateTeacherDto } from '../api/teachers.api';
import { useToast } from '../../../shared/ui/Toast/ToastContext';

export const useTeachers = () => {
  const { teachers, isLoading, search, setTeachers, setIsLoading, setSearch } = useTeachersState();
  const toast = useToast();

  const fetchTeachers = useCallback(
    async (searchTerm?: string) => {
      setIsLoading(true);
      try {
        const query = searchTerm !== undefined ? searchTerm : search;
        const data = await teachersApi.getAll(query);
        setTeachers(data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to fetch teachers');
      } finally {
        setIsLoading(false);
      }
    },
    [search, setTeachers, setIsLoading, toast]
  );

  const addTeacher = useCallback(
    async (dto: CreateTeacherDto) => {
      setIsLoading(true);
      try {
        const created = await teachersApi.create(dto);
        setTeachers((prev) => [created, ...prev]);
        toast.success(`Teacher "${created.name}" created successfully`);
        return created;
      } catch (err: any) {
        toast.error(err.message || 'Failed to create teacher');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setTeachers, setIsLoading, toast]
  );

  const updateTeacher = useCallback(
    async (id: string, dto: UpdateTeacherDto) => {
      setIsLoading(true);
      try {
        const updated = await teachersApi.update(id, dto);
        setTeachers((prev) => prev.map((t) => (t.id === id ? updated : t)));
        toast.success(`Teacher "${updated.name}" updated successfully`);
        return updated;
      } catch (err: any) {
        toast.error(err.message || 'Failed to update teacher');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setTeachers, setIsLoading, toast]
  );

  const deleteTeacher = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        await teachersApi.delete(id);
        setTeachers((prev) => prev.filter((t) => t.id !== id));
        toast.success('Teacher deleted successfully');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete teacher');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setTeachers, setIsLoading, toast]
  );

  return {
    teachers,
    isLoading,
    search,
    setSearch,
    fetchTeachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
  };
};
