import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../config/db.js';
import { ENV } from '../../config/env.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      teacher: {
        include: {
          classesManaged: true,
        },
      },
      student: {
        include: {
          class: true,
        },
      },
    },
  });

  if (!user || !user.isActive) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    ENV.JWT_SECRET,
    { expiresIn: '24h' }
  );

  const profile = user.teacher
    ? {
        type: 'teacher',
        teacherId: user.teacher.id,
        employeeId: user.teacher.employeeId,
        name: user.teacher.name,
        subject: user.teacher.subject,
        phone: user.teacher.phone,
        assignedClasses: user.teacher.classesManaged.map((c) => ({
          id: c.id,
          name: `${c.name} - ${c.section}`,
        })),
      }
    : user.student
    ? {
        type: 'student',
        studentId: user.student.id,
        institutionalId: user.student.studentId,
        name: user.student.name,
        rollNumber: user.student.rollNumber,
        class: {
          id: user.student.class.id,
          name: `${user.student.class.name} - ${user.student.class.section}`,
        },
      }
    : {
        type: 'admin',
        name: 'System Administrator',
      };

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      profile,
    },
  });
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthenticated' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      createdAt: true,
      teacher: {
        include: {
          classesManaged: true,
        },
      },
      student: {
        include: {
          class: true,
        },
      },
    },
  });

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const profile = user.teacher
    ? {
        type: 'teacher',
        teacherId: user.teacher.id,
        employeeId: user.teacher.employeeId,
        name: user.teacher.name,
        subject: user.teacher.subject,
        phone: user.teacher.phone,
        assignedClasses: user.teacher.classesManaged.map((c) => ({
          id: c.id,
          name: `${c.name} - ${c.section}`,
        })),
      }
    : user.student
    ? {
        type: 'student',
        studentId: user.student.id,
        institutionalId: user.student.studentId,
        name: user.student.name,
        rollNumber: user.student.rollNumber,
        class: {
          id: user.student.class.id,
          name: `${user.student.class.name} - ${user.student.class.section}`,
        },
      }
    : {
        type: 'admin',
        name: 'System Administrator',
      };

  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      profile,
    },
  });
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthenticated' });
    return;
  }

  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    res.status(400).json({ success: false, message: 'Current password is incorrect' });
    return;
  }

  if (currentPassword === newPassword) {
    res.status(400).json({ success: false, message: 'New password cannot be the same as your current password' });
    return;
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newHash,
      mustChangePassword: false,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
};
