import { useCallback } from 'react';
import { useDashboardState } from '../state/dashboard.context';
import { dashboardApi } from '../api/dashboard.api';
import { useToast } from '../../../shared/ui/Toast/ToastContext';

export const useDashboard = () => {
  const {
    adminData,
    teacherData,
    studentData,
    isLoading,
    setAdminData,
    setTeacherData,
    setStudentData,
    setIsLoading,
  } = useDashboardState();

  const toast = useToast();

  const fetchAdminDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dashboardApi.getAdminDashboard();
      setAdminData(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load admin metrics');
    } finally {
      setIsLoading(false);
    }
  }, [setAdminData, setIsLoading, toast]);

  const fetchTeacherDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dashboardApi.getTeacherDashboard();
      setTeacherData(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load teacher stats');
    } finally {
      setIsLoading(false);
    }
  }, [setTeacherData, setIsLoading, toast]);

  const fetchStudentDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dashboardApi.getStudentDashboard();
      setStudentData(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load personal student record');
    } finally {
      setIsLoading(false);
    }
  }, [setStudentData, setIsLoading, toast]);

  return {
    adminData,
    teacherData,
    studentData,
    isLoading,
    fetchAdminDashboard,
    fetchTeacherDashboard,
    fetchStudentDashboard,
  };
};
