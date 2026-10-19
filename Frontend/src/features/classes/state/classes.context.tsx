import React, { createContext, useContext, useState } from 'react';
import { SchoolClass } from '../../../shared/types/index';

interface ClassesState {
  classes: SchoolClass[];
  isLoading: boolean;
  setClasses: React.Dispatch<React.SetStateAction<SchoolClass[]>>;
  setIsLoading: (loading: boolean) => void;
}

const ClassesContext = createContext<ClassesState | undefined>(undefined);

export const ClassesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <ClassesContext.Provider value={{ classes, isLoading, setClasses, setIsLoading }}>
      {children}
    </ClassesContext.Provider>
  );
};

export const useClassesState = (): ClassesState => {
  const context = useContext(ClassesContext);
  if (!context) {
    throw new Error('useClassesState must be used within a ClassesProvider');
  }
  return context;
};
