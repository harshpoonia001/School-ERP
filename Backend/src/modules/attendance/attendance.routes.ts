import { Router } from 'express';
import {
  markAttendance,
  getClassAttendanceByDate,
  getAttendanceHistory,
  exportAttendanceCsv,
} from './attendance.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Mark attendance: Teachers can mark for their assigned class; Admins can mark for any class
router.post('/mark', authorize(Role.TEACHER, Role.ADMIN), markAttendance);

// View attendance roster for a specific date: Teachers & Admins
router.get('/class/:classId', authorize(Role.TEACHER, Role.ADMIN), getClassAttendanceByDate);

// Historical attendance logs & filters: Teachers & Admins
router.get('/history', authorize(Role.TEACHER, Role.ADMIN), getAttendanceHistory);

// CSV Export: Teachers & Admins
router.get('/export', authorize(Role.TEACHER, Role.ADMIN), exportAttendanceCsv);

export default router;
