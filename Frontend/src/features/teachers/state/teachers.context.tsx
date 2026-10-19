import React, { createContext, useContext, useState } from 'react';
import type { Teacher } from '../../../shared/types/index';

interface TeachersState {
  teachers: Teacher[];
  isLoading: boolean;
  search: string;
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  setIsLoading: (loading: boolean) => void;
  setSearch: (search: string) => void;
}

const TeachersContext = createContext<TeachersState | undefined>(undefined);

export const TeachersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  return (
    <TeachersContext.Provider
      value={{
        teachers,
        isLoading,
        search,
        setTeachers,
        setIsLoading,
        setSearch,
      }}
    >
      {children}
    </TeachersContext.Provider>
  );
};

export const useTeachersState = (): TeachersState => {
  const context = useContext(TeachersContext);
  if (!context) {
    throw new Error('useTeachersState must be used within a TeachersProvider');
  }
  return context;
};
