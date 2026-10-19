export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface UserProfile {
  type: 'admin' | 'teacher' | 'student';
  name: string;
  teacherId?: string;
  employeeId?: string | null;
  subject?: string;
  phone?: string | null;
  assignedClasses?: Array<{ id: string; name: string }>;
  studentId?: string;
  institutionalId?: string | null;
  rollNumber?: string;
  class?: { id: string; name: string };
}

export interface User {
  id: string;
  email: string;
  role: Role;
  mustChangePassword?: boolean;
  profile: UserProfile;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  errors?: Array<{ path: string; message: string }>;
}

export interface Teacher {
  id: string;
  employeeId?: string | null;
  name: string;
  phone?: string | null;
  subject: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    isActive: boolean;
  };
  classesManaged?: Array<{
    id: string;
    name: string;
    section: string;
  }>;
}

export interface SchoolClass {
  id: string;
  name: string;
  section: string;
  academicYear: string;
  classTeacherId?: string | null;
  classTeacher?: {
    id: string;
    name: string;
    subject: string;
    employeeId?: string | null;
  } | null;
  studentCount?: number;
  students?: Student[];
  createdAt: string;
}

export interface Student {
  id: string;
  studentId?: string | null; // Institutional Student ID
  rollNumber: string;
  name: string;
  classId: string;
  class?: {
    id: string;
    name: string;
    section: string;
    academicYear?: string;
  };
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string | null;
  dateOfBirth?: string | null;
  user?: {
    id: string;
    email: string;
    isActive: boolean;
  } | null;
  createdAt?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  institutionalId?: string | null;
  studentName: string;
  rollNumber: string;
  className: string;
  status: AttendanceStatus;
  remarks?: string | null;
  markedBy?: string;
}

export interface ClassAttendanceRosterItem {
  studentId: string;
  institutionalId?: string | null;
  rollNumber: string;
  name: string;
  status: AttendanceStatus | null;
  remarks: string;
  isMarked: boolean;
}

export interface ClassAttendanceData {
  classId: string;
  date: string;
  isFullyMarked: boolean;
  roster: ClassAttendanceRosterItem[];
}
