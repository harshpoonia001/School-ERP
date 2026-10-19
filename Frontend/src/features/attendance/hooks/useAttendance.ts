import { useCallback } from 'react';
import { useAttendanceState } from '../state/attendance.context';
import { attendanceApi } from '../api/attendance.api';
import { useToast } from '../../../shared/ui/Toast/ToastContext';
import { AttendanceStatus } from '../../../shared/types/index';

export const useAttendance = () => {
  const {
    roster,
    history,
    selectedDate,
    selectedClassId,
    isFullyMarked,
    isLoading,
    isSubmitting,
    setRoster,
    setHistory,
    setSelectedDate,
    setSelectedClassId,
    setIsFullyMarked,
    setIsLoading,
    setIsSubmitting,
    updateStudentStatus,
    updateStudentRemarks,
    markAllStatus,
  } = useAttendanceState();

  const toast = useToast();

  const fetchClassRoster = useCallback(
    async (classId: string, date: string) => {
      if (!classId) return;
      setIsLoading(true);
      try {
        const data = await attendanceApi.getClassAttendanceByDate(classId, date);
        // Default un-marked students to PRESENT for speed, but preserve isMarked flag
        const populatedRoster = data.roster.map((s) => ({
          ...s,
          status: s.status || ('PRESENT' as AttendanceStatus),
        }));
        setRoster(populatedRoster);
        setIsFullyMarked(data.isFullyMarked);
      } catch (err: any) {
        toast.error(err.message || 'Failed to fetch class roster for attendance');
      } finally {
        setIsLoading(false);
      }
    },
    [setRoster, setIsFullyMarked, setIsLoading, toast]
  );

  const submitAttendance = useCallback(async () => {
    if (!selectedClassId || roster.length === 0) {
      toast.error('No students available to submit attendance for');
      return;
    }

    setIsSubmitting(true);
    try {
      const records = roster.map((s) => ({
        studentId: s.studentId,
        status: s.status || 'PRESENT',
        remarks: s.remarks,
      }));

      const res = await attendanceApi.markAttendance({
        classId: selectedClassId,
        date: selectedDate,
        records,
      });

      setIsFullyMarked(true);
      toast.success(res.message || 'Attendance saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit attendance');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedClassId, selectedDate, roster, setIsFullyMarked, setIsSubmitting, toast]);

  const fetchHistory = useCallback(
    async (params?: { classId?: string; studentId?: string; startDate?: string; endDate?: string }) => {
      setIsLoading(true);
      try {
        const data = await attendanceApi.getHistory(params);
        setHistory(data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to fetch attendance history');
      } finally {
        setIsLoading(false);
      }
    },
    [setHistory, setIsLoading, toast]
  );

  const exportCsv = useCallback(
    async (params?: { classId?: string; startDate?: string; endDate?: string }) => {
      try {
        toast.info('Generating attendance CSV report...');
        await attendanceApi.downloadCsv(params);
        toast.success('Attendance CSV downloaded successfully');
      } catch (err: any) {
        toast.error(err.message || 'Failed to export CSV');
      }
    },
    [toast]
  );

  return {
    roster,
    history,
    selectedDate,
    selectedClassId,
    isFullyMarked,
    isLoading,
    isSubmitting,
    setSelectedDate,
    setSelectedClassId,
    updateStudentStatus,
    updateStudentRemarks,
    markAllStatus,
    fetchClassRoster,
    submitAttendance,
    fetchHistory,
    exportCsv,
  };
};
