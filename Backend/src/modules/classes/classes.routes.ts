import { Router } from 'express';
import {
  getAllClasses,
  getClassById,
  getClassStudents,
  createClass,
  updateClass,
  deleteClass,
} from './classes.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Admin & Teacher can read classes and class roster
router.get('/', authorize(Role.ADMIN, Role.TEACHER), getAllClasses);
router.get('/:id', authorize(Role.ADMIN, Role.TEACHER), getClassById);
router.get('/:id/students', authorize(Role.ADMIN, Role.TEACHER), getClassStudents);

// Only Admin can create, modify, delete classes
router.post('/', authorize(Role.ADMIN), createClass);
router.put('/:id', authorize(Role.ADMIN), updateClass);
router.delete('/:id', authorize(Role.ADMIN), deleteClass);

export default router;
