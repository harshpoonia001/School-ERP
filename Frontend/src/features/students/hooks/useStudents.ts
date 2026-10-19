import { useCallback } from 'react';
import { useStudentsState } from '../state/students.context';
import { studentsApi, CreateStudentDto, UpdateStudentDto } from '../api/students.api';
import { useToast } from '../../../shared/ui/Toast/ToastContext';

export const useStudents = () => {
  const {
    students,
    isLoading,
    selectedClassId,
    search,
    setStudents,
    setIsLoading,
    setSelectedClassId,
    setSearch,
  } = useStudentsState();

  const toast = useToast();

  const fetchStudents = useCallback(
    async (classIdParam?: string, searchParam?: string) => {
      setIsLoading(true);
      try {
        const cId = classIdParam !== undefined ? classIdParam : selectedClassId;
        const q = searchParam !== undefined ? searchParam : search;
        const data = await studentsApi.getAll(cId, q);
        setStudents(data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to fetch students');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedClassId, search, setStudents, setIsLoading, toast]
  );

  const addStudent = useCallback(
    async (dto: CreateStudentDto) => {
      setIsLoading(true);
      try {
        const created = await studentsApi.create(dto);
        setStudents((prev) => [created, ...prev]);
        toast.success(`Student "${created.name}" enrolled successfully`);
        return created;
      } catch (err: any) {
        toast.error(err.message || 'Failed to enroll student');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setStudents, setIsLoading, toast]
  );

  const updateStudent = useCallback(
    async (id: string, dto: UpdateStudentDto) => {
      setIsLoading(true);
      try {
        const updated = await studentsApi.update(id, dto);
        setStudents((prev) => prev.map((s) => (s.id === id ? updated : s)));
        toast.success(`Student "${updated.name}" updated successfully`);
        return updated;
      } catch (err: any) {
        toast.error(err.message || 'Failed to update student');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setStudents, setIsLoading, toast]
  );

  const deleteStudent = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        await studentsApi.delete(id);
        setStudents((prev) => prev.filter((s) => s.id !== id));
        toast.success('Student deleted successfully');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete student');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setStudents, setIsLoading, toast]
  );

  return {
    students,
    isLoading,
    selectedClassId,
    search,
    setSelectedClassId,
    setSearch,
    fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
  };
};
