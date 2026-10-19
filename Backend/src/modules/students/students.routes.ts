import { Router } from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from './students.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Admin & Teacher can view students
router.get('/', authorize(Role.ADMIN, Role.TEACHER), getAllStudents);
router.get('/:id', authorize(Role.ADMIN, Role.TEACHER), getStudentById);

// Admin & Teacher can add and update students; Admin can delete
router.post('/', authorize(Role.ADMIN, Role.TEACHER), createStudent);
router.put('/:id', authorize(Role.ADMIN, Role.TEACHER), updateStudent);
router.delete('/:id', authorize(Role.ADMIN), deleteStudent);

export default router;
