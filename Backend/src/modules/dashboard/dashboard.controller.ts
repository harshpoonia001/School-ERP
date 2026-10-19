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

  // Local calendar date range for @db.Date matching
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const today = new Date(Date.UTC(year, month, day));
  const tomorrow = new Date(Date.UTC(year, month, day + 1));
  const activeAttendanceDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const [todayAttendance, attendanceDay] = await Promise.all([
    prisma.attendance.findMany({
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
            roomNumber: true,
          },
        },
      },
    }),
    prisma.attendanceDay.findUnique({
      where: { date: today },
    }),
  ]);

  const totalMarkedToday = todayAttendance.length;
  const presentToday = todayAttendance.filter((a) => a.status === AttendanceStatus.PRESENT).length;
  const absentToday = todayAttendance.filter((a) => a.status === AttendanceStatus.ABSENT).length;
  const lateToday = todayAttendance.filter((a) => a.status === AttendanceStatus.LATE).length;
  const excusedToday = todayAttendance.filter((a) => a.status === AttendanceStatus.EXCUSED).length;

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
    const absentInClass = classRecords.filter((a) => a.status === AttendanceStatus.ABSENT).length;
    const lateInClass = classRecords.filter((a) => a.status === AttendanceStatus.LATE).length;
    const isMarked = classRecords.length > 0 && classRecords.length >= c._count.students;

    return {
      classId: c.id,
      className: `${c.name} - ${c.section}`,
      roomNumber: c.roomNumber || 'Room 304',
      teacherName: c.classTeacher?.name || 'Unassigned',
      totalEnrolled: c._count.students,
      markedCount: classRecords.length,
      presentCount: presentInClass,
      absentCount: absentInClass,
      lateCount: lateInClass,
      attendanceRate: classRecords.length > 0 ? Math.round((presentInClass / classRecords.length) * 100) : 0,
      status: isMarked ? 'Marked' : classRecords.length > 0 ? 'Partially Marked' : 'Pending',
    };
  });

  // Ranked absence highlights (classes ranked by highest absents to lowest)
  const rankedAbsenceHighlights = [...classSummaries]
    .filter((c) => c.markedCount > 0)
    .sort((a, b) => {
      if (b.absentCount !== a.absentCount) {
        return b.absentCount - a.absentCount;
      }
      return b.lateCount - a.lateCount;
    });

  // Recent roll call submissions today
  const recentSubmissions = await prisma.attendance.findMany({
    where: {
      date: { gte: today, lt: tomorrow },
      markedByTeacherId: { not: null },
    },
    distinct: ['classId'],
    orderBy: { updatedAt: 'desc' },
    take: 5,
    include: {
      class: { select: { name: true, section: true } },
      markedByTeacher: { select: { name: true, employeeId: true } },
    },
  });

  const formattedRecentSubmissions = recentSubmissions.map((s) => {
    const classRecs = todayAttendance.filter((a) => a.classId === s.classId);
    const pres = classRecs.filter((a) => a.status === AttendanceStatus.PRESENT).length;
    const abs = classRecs.filter((a) => a.status === AttendanceStatus.ABSENT).length;
    return {
      id: s.id,
      className: `${s.class.name} - ${s.class.section}`,
      teacherName: s.markedByTeacher?.name || 'Faculty',
      teacherEmployeeId: s.markedByTeacher?.employeeId || null,
      presentCount: pres,
      absentCount: abs,
      submittedAt: s.updatedAt.toISOString(),
    };
  });

  res.status(200).json({
    success: true,
    data: {
      activeAttendanceDate,
      metrics: {
        totalStudents,
        totalTeachers,
        totalClasses,
        todayAttendanceRate: `${attendancePercentageToday}%`,
        presentToday,
        absentToday,
        lateToday,
        excusedToday,
        totalMarkedToday,
      },
      isAttendanceDayLaunched: attendanceDay ? attendanceDay.isOpen : false,
      classSummaries,
      rankedAbsenceHighlights,
      recentSubmissions: formattedRecentSubmissions,
    },
  });
};

export const getTeacherDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const teacherId = req.user!.teacherId;

  if (!teacherId) {
    res.status(403).json({ success: false, message: 'Teacher profile not linked to user' });
    return;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const today = new Date(Date.UTC(year, month, day));
  const tomorrow = new Date(Date.UTC(year, month, day + 1));
  const activeAttendanceDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const [classes, attendanceDay] = await Promise.all([
    prisma.class.findMany({
      where: { classTeacherId: teacherId },
      include: {
        _count: { select: { students: true } },
      },
    }),
    prisma.attendanceDay.findUnique({
      where: { date: today },
    }),
  ]);

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
        roomNumber: c.roomNumber || 'Room 304',
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
      activeAttendanceDate,
      isAttendanceDayLaunched: attendanceDay ? attendanceDay.isOpen : false,
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
  const excusedDays = allRecords.filter((r) => r.status === AttendanceStatus.EXCUSED).length;

  const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  // 30-day timeline records for visual heatmap
  const thirtyDaysList = allRecords.slice(0, 30).map((r) => ({
    date: r.date.toISOString().split('T')[0],
    status: r.status,
    remarks: r.remarks,
  }));

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
        roomNumber: student.class.roomNumber || 'Room 304',
        classTeacher: student.class.classTeacher?.name || 'Unassigned',
        advisorSubject: student.class.classTeacher?.subject || 'Homeroom',
        guardianName: student.guardianName,
        guardianPhone: student.guardianPhone,
      },
      stats: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        excusedDays,
        attendancePercentage: percentage,
      },
      thirtyDaysTimeline: thirtyDaysList,
      recentLogs,
    },
  });
};
