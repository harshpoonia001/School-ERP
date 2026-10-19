import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/db.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { AttendanceStatus, Role } from '@prisma/client';

const markAttendanceSchema = z.object({
  classId: z.string().uuid('Valid Class ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  records: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: z.nativeEnum(AttendanceStatus),
      remarks: z.string().optional().nullable(),
    })
  ).min(1, 'At least one student attendance record is required'),
});

export const markAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { classId, date: dateStr, records } = markAttendanceSchema.parse(req.body);
  const user = req.user!;

  const schoolClass = await prisma.class.findUnique({
    where: { id: classId },
  });

  if (!schoolClass) {
    res.status(404).json({ success: false, message: 'Class not found' });
    return;
  }

  // Role validation: Teacher can only mark attendance for their own assigned class
  if (user.role === Role.TEACHER) {
    if (schoolClass.classTeacherId !== user.teacherId) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Teachers can only mark attendance for their assigned class.',
      });
      return;
    }
  }

  // Parse YYYY-MM-DD to UTC midnight date
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day));

  const teacherId = user.role === Role.TEACHER ? user.teacherId : schoolClass.classTeacherId || null;

  // Execute atomic batch upsert via transaction
  const results = await prisma.$transaction(
    records.map((rec) =>
      prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId: rec.studentId,
            date: dateObj,
          },
        },
        update: {
          status: rec.status,
          remarks: rec.remarks?.trim() || null,
          markedByTeacherId: teacherId,
        },
        create: {
          studentId: rec.studentId,
          classId: classId,
          date: dateObj,
          status: rec.status,
          remarks: rec.remarks?.trim() || null,
          markedByTeacherId: teacherId,
        },
      })
    )
  );

  res.status(200).json({
    success: true,
    message: `Attendance marked successfully for ${results.length} student(s) on ${dateStr}`,
    count: results.length,
  });
};

export const getClassAttendanceByDate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { classId } = req.params;
  const { date: dateStr } = req.query;

  if (!dateStr || typeof dateStr !== 'string') {
    res.status(400).json({ success: false, message: 'Date query param (YYYY-MM-DD) is required' });
    return;
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day));

  // Get all students enrolled in this class
  const students = await prisma.student.findMany({
    where: { classId },
    select: {
      id: true,
      studentId: true,
      rollNumber: true,
      name: true,
    },
    orderBy: { rollNumber: 'asc' },
  });

  // Get existing attendance records for this date
  const records = await prisma.attendance.findMany({
    where: {
      classId,
      date: dateObj,
    },
  });

  const recordMap = new Map(records.map((r) => [r.studentId, r]));

  const roster = students.map((s) => {
    const existing = recordMap.get(s.id);
    return {
      studentId: s.id,
      institutionalId: s.studentId,
      rollNumber: s.rollNumber,
      name: s.name,
      status: existing ? existing.status : null,
      remarks: existing ? existing.remarks : '',
      isMarked: !!existing,
    };
  });

  res.status(200).json({
    success: true,
    data: {
      classId,
      date: dateStr,
      isFullyMarked: records.length > 0 && records.length === students.length,
      roster,
    },
  });
};

export const getAttendanceHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { classId, studentId, startDate, endDate } = req.query;

  const whereClause: any = {};

  if (classId && typeof classId === 'string' && classId !== 'all') {
    whereClause.classId = classId;
  }

  if (studentId && typeof studentId === 'string') {
    whereClause.studentId = studentId;
  }

  if (startDate || endDate) {
    whereClause.date = {};
    if (startDate && typeof startDate === 'string') {
      const [y, m, d] = startDate.split('-').map(Number);
      whereClause.date.gte = new Date(Date.UTC(y, m - 1, d));
    }
    if (endDate && typeof endDate === 'string') {
      const [y, m, d] = endDate.split('-').map(Number);
      whereClause.date.lte = new Date(Date.UTC(y, m - 1, d));
    }
  }

  const records = await prisma.attendance.findMany({
    where: whereClause,
    include: {
      student: {
        select: {
          id: true,
          rollNumber: true,
          name: true,
          studentId: true,
        },
      },
      class: {
        select: {
          id: true,
          name: true,
          section: true,
        },
      },
      markedByTeacher: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [{ date: 'desc' }, { student: { rollNumber: 'asc' } }],
    take: 200,
  });

  const formatted = records.map((r) => ({
    id: r.id,
    date: r.date.toISOString().split('T')[0],
    studentId: r.student.id,
    institutionalId: r.student.studentId,
    studentName: r.student.name,
    rollNumber: r.student.rollNumber,
    className: `${r.class.name} - ${r.class.section}`,
    status: r.status,
    remarks: r.remarks,
    markedBy: r.markedByTeacher?.name || 'Admin / Unknown',
  }));

  res.status(200).json({ success: true, data: formatted });
};

export const exportAttendanceCsv = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { classId, startDate, endDate } = req.query;

  const whereClause: any = {};
  if (classId && typeof classId === 'string' && classId !== 'all') {
    whereClause.classId = classId;
  }

  if (startDate || endDate) {
    whereClause.date = {};
    if (startDate && typeof startDate === 'string') {
      const [y, m, d] = startDate.split('-').map(Number);
      whereClause.date.gte = new Date(Date.UTC(y, m - 1, d));
    }
    if (endDate && typeof endDate === 'string') {
      const [y, m, d] = endDate.split('-').map(Number);
      whereClause.date.lte = new Date(Date.UTC(y, m - 1, d));
    }
  }

  const records = await prisma.attendance.findMany({
    where: whereClause,
    include: {
      student: { select: { rollNumber: true, name: true, studentId: true } },
      class: { select: { name: true, section: true } },
      markedByTeacher: { select: { name: true } },
    },
    orderBy: [{ date: 'desc' }, { class: { name: 'asc' } }, { student: { rollNumber: 'asc' } }],
  });

  const headers = ['Date', 'Roll Number', 'Student Name', 'Institutional ID', 'Class', 'Status', 'Remarks', 'Marked By'];
  const rows = records.map((r) => [
    r.date.toISOString().split('T')[0],
    `"${r.student.rollNumber}"`,
    `"${r.student.name}"`,
    `"${r.student.studentId || ''}"`,
    `"${r.class.name} - ${r.class.section}"`,
    r.status,
    `"${r.remarks || ''}"`,
    `"${r.markedByTeacher?.name || 'Admin'}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="attendance-report.csv"');
  res.status(200).send(csvContent);
};
