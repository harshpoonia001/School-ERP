import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../../config/db.js';
import { Role } from '@prisma/client';

const createStudentSchema = z.object({
  name: z.string().min(2, 'Student name must be at least 2 characters'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  classId: z.string().uuid('Valid Class ID is required'),
  guardianName: z.string().min(2, 'Guardian name is required'),
  guardianPhone: z.string().min(5, 'Guardian phone is required'),
  guardianEmail: z.string().email('Valid guardian email is required').optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  studentId: z.string().optional().nullable(), // Optional institutional ID
  email: z.string().email('Valid login email is required').optional().nullable(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().default('student123'),
});

const updateStudentSchema = z.object({
  name: z.string().min(2, 'Student name must be at least 2 characters').optional(),
  rollNumber: z.string().min(1, 'Roll number is required').optional(),
  classId: z.string().uuid('Valid Class ID is required').optional(),
  guardianName: z.string().min(2, 'Guardian name is required').optional(),
  guardianPhone: z.string().min(5, 'Guardian phone is required').optional(),
  guardianEmail: z.string().email().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  studentId: z.string().optional().nullable(),
  portalEmail: z.string().email().optional().nullable(),
  portalPassword: z.string().min(6).optional().nullable(),
  portalAction: z.enum(['grant', 'update', 'revoke', 'toggle_active']).optional(),
  portalActive: z.boolean().optional(),
});

export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
  const { classId, search } = req.query;

  const whereClause: any = {};

  if (classId && typeof classId === 'string' && classId !== 'all') {
    whereClause.classId = classId;
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.trim();
    whereClause.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { rollNumber: { contains: q, mode: 'insensitive' } },
      { studentId: { contains: q, mode: 'insensitive' } },
      { guardianName: { contains: q, mode: 'insensitive' } },
      { guardianPhone: { contains: q, mode: 'insensitive' } },
    ];
  }

  const students = await prisma.student.findMany({
    where: whereClause,
    include: {
      class: {
        select: {
          id: true,
          name: true,
          section: true,
          academicYear: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          isActive: true,
          mustChangePassword: true,
        },
      },
    },
    orderBy: [{ class: { name: 'asc' } }, { class: { section: 'asc' } }, { rollNumber: 'asc' }],
  });

  res.status(200).json({ success: true, data: students });
};

export const getStudentById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      class: {
        include: {
          classTeacher: {
            select: {
              id: true,
              name: true,
              subject: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          isActive: true,
          mustChangePassword: true,
        },
      },
      attendance: {
        take: 30,
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!student) {
    res.status(404).json({ success: false, message: 'Student not found' });
    return;
  }

  res.status(200).json({ success: true, data: student });
};

export const createStudent = async (req: Request, res: Response): Promise<void> => {
  const data = createStudentSchema.parse(req.body);

  // Validate Class existence
  const schoolClass = await prisma.class.findUnique({ where: { id: data.classId } });
  if (!schoolClass) {
    res.status(404).json({ success: false, message: 'Target class does not exist' });
    return;
  }

  // Check unique roll number within class
  const existingRoll = await prisma.student.findUnique({
    where: {
      classId_rollNumber: {
        classId: data.classId,
        rollNumber: data.rollNumber.trim(),
      },
    },
  });
  if (existingRoll) {
    res.status(409).json({
      success: false,
      message: `A student with Roll Number "${data.rollNumber}" already exists in ${schoolClass.name} - ${schoolClass.section}`,
    });
    return;
  }

  // Check optional studentId collision
  if (data.studentId && data.studentId.trim() !== '') {
    const existingStudentId = await prisma.student.findUnique({
      where: { studentId: data.studentId.trim() },
    });
    if (existingStudentId) {
      res.status(409).json({
        success: false,
        message: `A student with Institutional ID "${data.studentId}" already exists`,
      });
      return;
    }
  }

  // Check user email if student account email is provided
  if (data.email && data.email.trim() !== '') {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'A user account with this email already exists',
      });
      return;
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    let userId: string | null = null;

    if (data.email && data.email.trim() !== '') {
      const passwordHash = await bcrypt.hash(data.password, 10);
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          passwordHash,
          role: Role.STUDENT,
          mustChangePassword: true,
        },
      });
      userId = user.id;
    }

    const newStudent = await tx.student.create({
      data: {
        name: data.name.trim(),
        rollNumber: data.rollNumber.trim(),
        classId: data.classId,
        studentId: data.studentId && data.studentId.trim() !== '' ? data.studentId.trim() : null,
        guardianName: data.guardianName.trim(),
        guardianPhone: data.guardianPhone.trim(),
        guardianEmail: data.guardianEmail?.trim() || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        userId,
      },
      include: {
        class: true,
        user: { select: { id: true, email: true, isActive: true, mustChangePassword: true } },
      },
    });

    return newStudent;
  });

  res.status(201).json({
    success: true,
    message: 'Student created successfully',
    data: result,
  });
};

export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = updateStudentSchema.parse(req.body);

  const student = await prisma.student.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!student) {
    res.status(404).json({ success: false, message: 'Student not found' });
    return;
  }

  const targetClassId = data.classId || student.classId;
  const targetRoll = data.rollNumber ? data.rollNumber.trim() : student.rollNumber;

  if (targetClassId !== student.classId || targetRoll !== student.rollNumber) {
    const existing = await prisma.student.findFirst({
      where: {
        classId: targetClassId,
        rollNumber: targetRoll,
        NOT: { id },
      },
    });
    if (existing) {
      res.status(409).json({
        success: false,
        message: `Roll Number "${targetRoll}" is already assigned to another student in this class`,
      });
      return;
    }
  }

  if (data.studentId && data.studentId.trim() !== '') {
    const existingId = await prisma.student.findFirst({
      where: {
        studentId: data.studentId.trim(),
        NOT: { id },
      },
    });
    if (existingId) {
      res.status(409).json({
        success: false,
        message: `Institutional Student ID "${data.studentId}" is already assigned to another student`,
      });
      return;
    }
  }

  // Handle Portal Access Actions
  await prisma.$transaction(async (tx) => {
    let currentUserId = student.userId;

    if (data.portalAction === 'grant' || (!student.userId && data.portalEmail)) {
      const email = (data.portalEmail || '').toLowerCase().trim();
      if (!email) {
        throw new Error('A valid email address is required to grant portal access');
      }

      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new Error('A user account with this email address already exists');
      }

      const pass = data.portalPassword || 'student123';
      const passwordHash = await bcrypt.hash(pass, 10);
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: Role.STUDENT,
          mustChangePassword: true,
        },
      });

      currentUserId = newUser.id;
    } else if (data.portalAction === 'revoke' && student.userId) {
      await tx.student.update({
        where: { id },
        data: { userId: null },
      });
      await tx.user.delete({ where: { id: student.userId } });
      currentUserId = null;
    } else if (student.userId) {
      // Update existing user credentials
      const userUpdate: any = {};
      if (data.portalEmail && data.portalEmail.toLowerCase().trim() !== student.user?.email) {
        const email = data.portalEmail.toLowerCase().trim();
        const existingUser = await tx.user.findFirst({
          where: { email, NOT: { id: student.userId } },
        });
        if (existingUser) {
          throw new Error('Another user account already uses this email address');
        }
        userUpdate.email = email;
      }

      if (data.portalPassword && data.portalPassword.trim().length >= 6) {
        userUpdate.passwordHash = await bcrypt.hash(data.portalPassword.trim(), 10);
        userUpdate.mustChangePassword = true;
      }

      if (data.portalActive !== undefined) {
        userUpdate.isActive = data.portalActive;
      }

      if (Object.keys(userUpdate).length > 0) {
        await tx.user.update({
          where: { id: student.userId },
          data: userUpdate,
        });
      }
    }

    // Update Student attributes
    await tx.student.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.rollNumber && { rollNumber: data.rollNumber.trim() }),
        ...(data.classId && { classId: data.classId }),
        ...(data.guardianName && { guardianName: data.guardianName.trim() }),
        ...(data.guardianPhone && { guardianPhone: data.guardianPhone.trim() }),
        guardianEmail: data.guardianEmail !== undefined ? (data.guardianEmail?.trim() || null) : student.guardianEmail,
        studentId: data.studentId !== undefined ? (data.studentId?.trim() || null) : student.studentId,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : student.dateOfBirth,
        userId: currentUserId,
      },
    });
  });

  const updated = await prisma.student.findUnique({
    where: { id },
    include: {
      class: true,
      user: { select: { id: true, email: true, isActive: true, mustChangePassword: true } },
    },
  });

  res.status(200).json({
    success: true,
    message: 'Student record updated successfully',
    data: updated,
  });
};

export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    res.status(404).json({ success: false, message: 'Student not found' });
    return;
  }

  await prisma.$transaction(async (tx) => {
    // Delete student (cascades to attendance and parent_students)
    await tx.student.delete({ where: { id } });

    // If student had a user login account, clean it up
    if (student.userId) {
      await tx.user.delete({ where: { id: student.userId } });
    }
  });

  res.status(200).json({ success: true, message: 'Student deleted successfully' });
};
