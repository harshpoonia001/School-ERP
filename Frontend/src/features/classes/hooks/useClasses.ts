import { useCallback } from 'react';
import { useClassesState } from '../state/classes.context';
import { classesApi, CreateClassDto, UpdateClassDto } from '../api/classes.api';
import { useToast } from '../../../shared/ui/Toast/ToastContext';

export const useClasses = () => {
  const { classes, isLoading, setClasses, setIsLoading } = useClassesState();
  const toast = useToast();

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await classesApi.getAll();
      setClasses(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch classes');
    } finally {
      setIsLoading(false);
    }
  }, [setClasses, setIsLoading, toast]);

  const addClass = useCallback(
    async (dto: CreateClassDto) => {
      setIsLoading(true);
      try {
        const created = await classesApi.create(dto);
        setClasses((prev) => [...prev, created]);
        toast.success(`Class "${created.name} - ${created.section}" created successfully`);
        return created;
      } catch (err: any) {
        toast.error(err.message || 'Failed to create class');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setClasses, setIsLoading, toast]
  );

  const updateClass = useCallback(
    async (id: string, dto: UpdateClassDto) => {
      setIsLoading(true);
      try {
        const updated = await classesApi.update(id, dto);
        setClasses((prev) => prev.map((c) => (c.id === id ? updated : c)));
        toast.success(`Class updated successfully`);
        return updated;
      } catch (err: any) {
        toast.error(err.message || 'Failed to update class');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setClasses, setIsLoading, toast]
  );

  const deleteClass = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        await classesApi.delete(id);
        setClasses((prev) => prev.filter((c) => c.id !== id));
        toast.success('Class deleted successfully');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete class');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setClasses, setIsLoading, toast]
  );

  return {
    classes,
    isLoading,
    fetchClasses,
    addClass,
    updateClass,
    deleteClass,
  };
};
