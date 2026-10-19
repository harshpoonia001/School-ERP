import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/db.js';

const classSchema = z.object({
  name: z.string().min(1, 'Class name is required (e.g. Grade 10)'),
  section: z.string().min(1, 'Section is required (e.g. A)'),
  academicYear: z.string().optional().default('2026-2027'),
  classTeacherId: z.string().optional().nullable(),
});

export const getAllClasses = async (req: Request, res: Response): Promise<void> => {
  const classes = await prisma.class.findMany({
    include: {
      classTeacher: {
        select: {
          id: true,
          name: true,
          subject: true,
          employeeId: true,
        },
      },
      _count: {
        select: {
          students: true,
        },
      },
    },
    orderBy: [{ name: 'asc' }, { section: 'asc' }],
  });

  const formatted = classes.map((c) => ({
    id: c.id,
    name: c.name,
    section: c.section,
    academicYear: c.academicYear,
    classTeacherId: c.classTeacherId,
    classTeacher: c.classTeacher,
    studentCount: c._count.students,
    createdAt: c.createdAt,
  }));

  res.status(200).json({ success: true, data: formatted });
};

export const getClassById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const schoolClass = await prisma.class.findUnique({
    where: { id },
    include: {
      classTeacher: {
        select: {
          id: true,
          name: true,
          subject: true,
          phone: true,
          employeeId: true,
        },
      },
      students: {
        select: {
          id: true,
          studentId: true,
          rollNumber: true,
          name: true,
          guardianName: true,
          guardianPhone: true,
        },
        orderBy: { rollNumber: 'asc' },
      },
    },
  });

  if (!schoolClass) {
    res.status(404).json({ success: false, message: 'Class not found' });
    return;
  }

  res.status(200).json({ success: true, data: schoolClass });
};

export const getClassStudents = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const students = await prisma.student.findMany({
    where: { classId: id },
    select: {
      id: true,
      studentId: true,
      rollNumber: true,
      name: true,
      guardianName: true,
      guardianPhone: true,
      guardianEmail: true,
      user: {
        select: {
          email: true,
        },
      },
    },
    orderBy: { rollNumber: 'asc' },
  });

  res.status(200).json({ success: true, data: students });
};

export const createClass = async (req: Request, res: Response): Promise<void> => {
  const data = classSchema.parse(req.body);

  const existing = await prisma.class.findUnique({
    where: {
      name_section_academicYear: {
        name: data.name.trim(),
        section: data.section.trim(),
        academicYear: data.academicYear,
      },
    },
  });

  if (existing) {
    res.status(409).json({
      success: false,
      message: `Class "${data.name} - ${data.section}" for academic year ${data.academicYear} already exists`,
    });
    return;
  }

  const newClass = await prisma.class.create({
    data: {
      name: data.name.trim(),
      section: data.section.trim(),
      academicYear: data.academicYear,
      classTeacherId: data.classTeacherId || null,
    },
    include: {
      classTeacher: true,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Class created successfully',
    data: newClass,
  });
};

export const updateClass = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = classSchema.partial().parse(req.body);

  const schoolClass = await prisma.class.findUnique({ where: { id } });
  if (!schoolClass) {
    res.status(404).json({ success: false, message: 'Class not found' });
    return;
  }

  const updated = await prisma.class.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.section && { section: data.section.trim() }),
      ...(data.academicYear && { academicYear: data.academicYear }),
      classTeacherId: data.classTeacherId !== undefined ? data.classTeacherId : schoolClass.classTeacherId,
    },
    include: {
      classTeacher: true,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Class updated successfully',
    data: updated,
  });
};

export const deleteClass = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const countStudents = await prisma.student.count({ where: { classId: id } });
  if (countStudents > 0) {
    res.status(400).json({
      success: false,
      message: `Cannot delete class: there are ${countStudents} student(s) currently enrolled. Please reassign or delete students first.`,
    });
    return;
  }

  await prisma.class.delete({ where: { id } });

  res.status(200).json({ success: true, message: 'Class deleted successfully' });
};
