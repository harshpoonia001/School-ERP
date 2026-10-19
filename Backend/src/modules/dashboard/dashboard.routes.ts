import { Router } from 'express';
import {
  getAdminDashboard,
  getTeacherDashboard,
  getStudentDashboard,
} from './dashboard.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/admin', authorize(Role.ADMIN), getAdminDashboard);
router.get('/teacher', authorize(Role.TEACHER), getTeacherDashboard);
router.get('/student', authorize(Role.STUDENT), getStudentDashboard);

export default router;
