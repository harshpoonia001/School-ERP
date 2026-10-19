import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../../config/db.js';
import { Role } from '@prisma/client';

const createTeacherSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().default('teacher123'),
  phone: z.string().optional().nullable(),
  subject: z.string().min(2, 'Subject is required'),
  employeeId: z.string().optional().nullable(),
  classId: z.string().optional().nullable(),
});

const updateTeacherSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional().nullable(),
  subject: z.string().min(2, 'Subject is required').optional(),
  employeeId: z.string().optional().nullable(),
  classId: z.string().optional().nullable(),
});

export const getAllTeachers = async (req: Request, res: Response): Promise<void> => {
  const { search } = req.query;

  const whereClause: any = {};
  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.trim();
    whereClause.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { subject: { contains: q, mode: 'insensitive' } },
      { employeeId: { contains: q, mode: 'insensitive' } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const teachers = await prisma.teacher.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          isActive: true,
          createdAt: true,
        },
      },
      classesManaged: {
        select: {
          id: true,
          name: true,
          section: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({ success: true, data: teachers });
};

export const getTeacherById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          isActive: true,
        },
      },
      classesManaged: true,
    },
  });

  if (!teacher) {
    res.status(404).json({ success: false, message: 'Teacher not found' });
    return;
  }

  res.status(200).json({ success: true, data: teacher });
};

export const createTeacher = async (req: Request, res: Response): Promise<void> => {
  const data = createTeacherSchema.parse(req.body);

  // Check email collision
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase().trim() },
  });
  if (existingUser) {
    res.status(409).json({ success: false, message: 'A user with this email already exists' });
    return;
  }

  // Check employeeId collision if provided
  if (data.employeeId && data.employeeId.trim() !== '') {
    const existingEmp = await prisma.teacher.findUnique({
      where: { employeeId: data.employeeId.trim() },
    });
    if (existingEmp) {
      res.status(409).json({ success: false, message: 'A teacher with this Employee ID already exists' });
      return;
    }
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: Role.TEACHER,
      },
    });

    const newTeacher = await tx.teacher.create({
      data: {
        userId: newUser.id,
        name: data.name.trim(),
        employeeId: data.employeeId && data.employeeId.trim() !== '' ? data.employeeId.trim() : null,
        phone: data.phone?.trim() || null,
        subject: data.subject.trim(),
      },
    });

    if (data.classId) {
      await tx.class.update({
        where: { id: data.classId },
        data: { classTeacherId: newTeacher.id },
      });
    }

    return tx.teacher.findUnique({
      where: { id: newTeacher.id },
      include: {
        user: { select: { id: true, email: true } },
        classesManaged: true,
      },
    });
  }, { maxWait: 10000, timeout: 25000 });

  res.status(201).json({
    success: true,
    message: 'Teacher created successfully',
    data: result,
  });
};

export const updateTeacher = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = updateTeacherSchema.parse(req.body);

  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) {
    res.status(404).json({ success: false, message: 'Teacher not found' });
    return;
  }

  if (data.employeeId && data.employeeId.trim() !== '') {
    const existing = await prisma.teacher.findFirst({
      where: {
        employeeId: data.employeeId.trim(),
        NOT: { id },
      },
    });
    if (existing) {
      res.status(409).json({ success: false, message: 'Another teacher already has this Employee ID' });
      return;
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.teacher.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.subject && { subject: data.subject.trim() }),
        phone: data.phone !== undefined ? (data.phone?.trim() || null) : teacher.phone,
        employeeId: data.employeeId !== undefined ? (data.employeeId?.trim() || null) : teacher.employeeId,
      },
    });

    if (data.classId !== undefined) {
      // Clear previously assigned classes for this teacher if different
      await tx.class.updateMany({
        where: { classTeacherId: id },
        data: { classTeacherId: null },
      });

      if (data.classId) {
        await tx.class.update({
          where: { id: data.classId },
          data: { classTeacherId: id },
        });
      }
    }
  });

  const updated = await prisma.teacher.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true } },
      classesManaged: true,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Teacher updated successfully',
    data: updated,
  });
};

export const deleteTeacher = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) {
    res.status(404).json({ success: false, message: 'Teacher not found' });
    return;
  }

  await prisma.$transaction(async (tx) => {
    // Unassign classes managed
    await tx.class.updateMany({
      where: { classTeacherId: id },
      data: { classTeacherId: null },
    });

    // Delete associated User which cascades to Teacher
    await tx.user.delete({
      where: { id: teacher.userId },
    });
  });

  res.status(200).json({ success: true, message: 'Teacher deleted successfully' });
};
