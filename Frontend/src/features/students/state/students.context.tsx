import React, { createContext, useContext, useState } from 'react';
import { Student } from '../../../shared/types/index';

interface StudentsState {
  students: Student[];
  isLoading: boolean;
  selectedClassId: string;
  search: string;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  setIsLoading: (loading: boolean) => void;
  setSelectedClassId: (classId: string) => void;
  setSearch: (search: string) => void;
}

const StudentsContext = createContext<StudentsState | undefined>(undefined);

export const StudentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  return (
    <StudentsContext.Provider
      value={{
        students,
        isLoading,
        selectedClassId,
        search,
        setStudents,
        setIsLoading,
        setSelectedClassId,
        setSearch,
      }}
    >
      {children}
    </StudentsContext.Provider>
  );
};

export const useStudentsState = (): StudentsState => {
  const context = useContext(StudentsContext);
  if (!context) {
    throw new Error('useStudentsState must be used within a StudentsProvider');
  }
  return context;
};
