import { Response } from 'express';
import { prisma } from '../../config/db.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { AttendanceStatus } from '@prisma/client';

export const getAdminDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const [totalStudents, totalTeachers, totalClasses] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.class.count(),
  ]);

  // Today's Date range (midnight UTC)
  // Today's UTC Date range for @db.Date matching
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayAttendance = await prisma.attendance.findMany({
    where: {
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          section: true,
        },
      },
    },
  });

  const totalMarkedToday = todayAttendance.length;
  const presentToday = todayAttendance.filter((a) => a.status === AttendanceStatus.PRESENT).length;
  const absentToday = todayAttendance.filter((a) => a.status === AttendanceStatus.ABSENT).length;
  const lateToday = todayAttendance.filter((a) => a.status === AttendanceStatus.LATE).length;

  const attendancePercentageToday = totalMarkedToday > 0
    ? Math.round((presentToday / totalMarkedToday) * 100)
    : 0;

  // Class breakdown
  const classes = await prisma.class.findMany({
    include: {
      _count: { select: { students: true } },
      classTeacher: { select: { name: true } },
    },
    orderBy: { name: 'asc' },
  });

  const classSummaries = classes.map((c) => {
    const classRecords = todayAttendance.filter((a) => a.classId === c.id);
    const presentInClass = classRecords.filter((a) => a.status === AttendanceStatus.PRESENT).length;
    const isMarked = classRecords.length > 0 && classRecords.length >= c._count.students;

    return {
      classId: c.id,
      className: `${c.name} - ${c.section}`,
      teacherName: c.classTeacher?.name || 'Unassigned',
      totalEnrolled: c._count.students,
      markedCount: classRecords.length,
      presentCount: presentInClass,
      status: isMarked ? 'Marked' : classRecords.length > 0 ? 'Partially Marked' : 'Pending',
    };
  });

  res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalStudents,
        totalTeachers,
        totalClasses,
        todayAttendanceRate: `${attendancePercentageToday}%`,
        presentToday,
        absentToday,
        lateToday,
        totalMarkedToday,
      },
      classSummaries,
    },
  });
};

export const getTeacherDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const teacherId = req.user!.teacherId;

  if (!teacherId) {
    res.status(403).json({ success: false, message: 'Teacher profile not linked to user' });
    return;
  }

  const classes = await prisma.class.findMany({
    where: { classTeacherId: teacherId },
    include: {
      _count: { select: { students: true } },
    },
  });

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const managedClassStats = await Promise.all(
    classes.map(async (c) => {
      const todayRecords = await prisma.attendance.findMany({
        where: {
          classId: c.id,
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      const presentCount = todayRecords.filter((r) => r.status === AttendanceStatus.PRESENT).length;
      const isMarked = todayRecords.length > 0 && todayRecords.length >= c._count.students;

      // 30 day attendance percentage for class
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const pastRecords = await prisma.attendance.findMany({
        where: {
          classId: c.id,
          date: { gte: thirtyDaysAgo },
        },
      });

      const pastPresents = pastRecords.filter((r) => r.status === AttendanceStatus.PRESENT).length;
      const monthlyRate = pastRecords.length > 0
        ? Math.round((pastPresents / pastRecords.length) * 100)
        : 100;

      return {
        classId: c.id,
        className: `${c.name} - ${c.section}`,
        totalStudents: c._count.students,
        isAttendanceMarkedToday: isMarked,
        presentToday: presentCount,
        absentToday: todayRecords.length - presentCount,
        monthlyAttendanceRate: `${monthlyRate}%`,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: {
      managedClasses: managedClassStats,
    },
  });
};

export const getStudentDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const studentId = req.user!.studentId;

  if (!studentId) {
    res.status(403).json({ success: false, message: 'Student profile not linked to user' });
    return;
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      class: {
        include: {
          classTeacher: { select: { name: true, subject: true, phone: true } },
        },
      },
    },
  });

  if (!student) {
    res.status(404).json({ success: false, message: 'Student not found' });
    return;
  }

  const allRecords = await prisma.attendance.findMany({
    where: { studentId },
    orderBy: { date: 'desc' },
  });

  const totalDays = allRecords.length;
  const presentDays = allRecords.filter((r) => r.status === AttendanceStatus.PRESENT).length;
  const absentDays = allRecords.filter((r) => r.status === AttendanceStatus.ABSENT).length;
  const lateDays = allRecords.filter((r) => r.status === AttendanceStatus.LATE).length;

  const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  const recentLogs = allRecords.slice(0, 15).map((r) => ({
    id: r.id,
    date: r.date.toISOString().split('T')[0],
    status: r.status,
    remarks: r.remarks,
  }));

  res.status(200).json({
    success: true,
    data: {
      profile: {
        name: student.name,
        rollNumber: student.rollNumber,
        institutionalId: student.studentId,
        className: `${student.class.name} - ${student.class.section}`,
        classTeacher: student.class.classTeacher?.name || 'Unassigned',
      },
      stats: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendancePercentage: percentage,
      },
      recentLogs,
    },
  });
};
