import React, { createContext, useContext, useState } from 'react';
import {
  AttendanceRecord,
  ClassAttendanceRosterItem,
  AttendanceStatus,
} from '../../../shared/types/index';

interface AttendanceState {
  roster: ClassAttendanceRosterItem[];
  history: AttendanceRecord[];
  selectedDate: string;
  selectedClassId: string;
  isFullyMarked: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  setRoster: React.Dispatch<React.SetStateAction<ClassAttendanceRosterItem[]>>;
  setHistory: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  setSelectedDate: (date: string) => void;
  setSelectedClassId: (classId: string) => void;
  setIsFullyMarked: (marked: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setIsSubmitting: (submitting: boolean) => void;
  updateStudentStatus: (studentId: string, status: AttendanceStatus) => void;
  updateStudentRemarks: (studentId: string, remarks: string) => void;
  markAllStatus: (status: AttendanceStatus) => void;
}

const AttendanceContext = createContext<AttendanceState | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [roster, setRoster] = useState<ClassAttendanceRosterItem[]>([]);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isFullyMarked, setIsFullyMarked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const updateStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setRoster((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, status } : item))
    );
  };

  const updateStudentRemarks = (studentId: string, remarks: string) => {
    setRoster((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, remarks } : item))
    );
  };

  const markAllStatus = (status: AttendanceStatus) => {
    setRoster((prev) => prev.map((item) => ({ ...item, status })));
  };

  return (
    <AttendanceContext.Provider
      value={{
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
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendanceState = (): AttendanceState => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendanceState must be used within an AttendanceProvider');
  }
  return context;
};
