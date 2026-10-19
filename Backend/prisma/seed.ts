import { PrismaClient, Role, AttendanceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing records in proper dependency order
  await prisma.attendance.deleteMany();
  await prisma.parentStudent.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.student.deleteMany();
  await prisma.class.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('admin123', 10);
  const teacherPasswordHash = await bcrypt.hash('teacher123', 10);
  const studentPasswordHash = await bcrypt.hash('student123', 10);

  // 1. Seed Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@school.com',
      passwordHash: passwordHash,
      role: Role.ADMIN,
    },
  });
  console.log('✅ Admin user created: admin@school.com / admin123');

  // 2. Seed Teachers
  const teacherUser1 = await prisma.user.create({
    data: {
      email: 'teacher@school.com',
      passwordHash: teacherPasswordHash,
      role: Role.TEACHER,
    },
  });

  const teacher1 = await prisma.teacher.create({
    data: {
      userId: teacherUser1.id,
      name: 'Sarah Jenkins',
      employeeId: 'EMP-001',
      phone: '+1 555-0199',
      subject: 'Mathematics',
    },
  });

  const teacherUser2 = await prisma.user.create({
    data: {
      email: 'teacher2@school.com',
      passwordHash: teacherPasswordHash,
      role: Role.TEACHER,
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      userId: teacherUser2.id,
      name: 'David Miller',
      employeeId: 'EMP-002',
      phone: '+1 555-0198',
      subject: 'Physics & Science',
    },
  });
  console.log('✅ Teachers created: teacher@school.com & teacher2@school.com / teacher123');

  // 3. Seed Classes
  const class10A = await prisma.class.create({
    data: {
      name: 'Grade 10',
      section: 'A',
      classTeacherId: teacher1.id,
      academicYear: '2026-2027',
    },
  });

  const class10B = await prisma.class.create({
    data: {
      name: 'Grade 10',
      section: 'B',
      classTeacherId: teacher2.id,
      academicYear: '2026-2027',
    },
  });

  const class6A = await prisma.class.create({
    data: {
      name: 'Grade 6',
      section: 'A',
      academicYear: '2026-2027',
    },
  });
  console.log('✅ Classes created: Grade 10 - A, Grade 10 - B, Grade 6 - A');

  // 4. Seed Students
  const studentUser1 = await prisma.user.create({
    data: {
      email: 'student@school.com',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
    },
  });

  const student1 = await prisma.student.create({
    data: {
      userId: studentUser1.id,
      studentId: 'STU-2026-001',
      rollNumber: '101',
      name: 'Alex Johnson',
      classId: class10A.id,
      guardianName: 'Robert Johnson',
      guardianPhone: '+1 555-0101',
      guardianEmail: 'robert.johnson@example.com',
      dateOfBirth: new Date('2010-04-12'),
    },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      email: 'emma@school.com',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      userId: studentUser2.id,
      studentId: 'STU-2026-002',
      rollNumber: '102',
      name: 'Emma Watson',
      classId: class10A.id,
      guardianName: 'Chris Watson',
      guardianPhone: '+1 555-0102',
      guardianEmail: 'chris.watson@example.com',
      dateOfBirth: new Date('2010-08-23'),
    },
  });

  const studentUser3 = await prisma.user.create({
    data: {
      email: 'liam@school.com',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
    },
  });

  const student3 = await prisma.student.create({
    data: {
      userId: studentUser3.id,
      studentId: 'STU-2026-003',
      rollNumber: '103',
      name: 'Liam Smith',
      classId: class10A.id,
      guardianName: 'Mary Smith',
      guardianPhone: '+1 555-0103',
      guardianEmail: 'mary.smith@example.com',
      dateOfBirth: new Date('2010-01-15'),
    },
  });

  const studentUser4 = await prisma.user.create({
    data: {
      email: 'sophia@school.com',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
    },
  });

  const student4 = await prisma.student.create({
    data: {
      userId: studentUser4.id,
      studentId: 'STU-2026-004',
      rollNumber: '104',
      name: 'Sophia Brown',
      classId: class10B.id,
      guardianName: 'James Brown',
      guardianPhone: '+1 555-0104',
      guardianEmail: 'james.brown@example.com',
      dateOfBirth: new Date('2010-11-30'),
    },
  });
  console.log('✅ Students created: Alex, Emma, Liam, Sophia (with accounts / student123)');

  // 5. Seed Attendance for past 3 days and today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const day1 = new Date(today);
  day1.setDate(today.getDate() - 2);

  const day2 = new Date(today);
  day2.setDate(today.getDate() - 1);

  await prisma.attendance.createMany({
    data: [
      // Day 1
      { studentId: student1.id, classId: class10A.id, date: day1, status: AttendanceStatus.PRESENT, markedByTeacherId: teacher1.id },
      { studentId: student2.id, classId: class10A.id, date: day1, status: AttendanceStatus.PRESENT, markedByTeacherId: teacher1.id },
      { studentId: student3.id, classId: class10A.id, date: day1, status: AttendanceStatus.ABSENT, markedByTeacherId: teacher1.id, remarks: 'Sick leave' },
      // Day 2
      { studentId: student1.id, classId: class10A.id, date: day2, status: AttendanceStatus.PRESENT, markedByTeacherId: teacher1.id },
      { studentId: student2.id, classId: class10A.id, date: day2, status: AttendanceStatus.LATE, markedByTeacherId: teacher1.id, remarks: 'Bus delay' },
      { studentId: student3.id, classId: class10A.id, date: day2, status: AttendanceStatus.PRESENT, markedByTeacherId: teacher1.id },
      // Today
      { studentId: student1.id, classId: class10A.id, date: today, status: AttendanceStatus.PRESENT, markedByTeacherId: teacher1.id },
      { studentId: student2.id, classId: class10A.id, date: today, status: AttendanceStatus.PRESENT, markedByTeacherId: teacher1.id },
      { studentId: student3.id, classId: class10A.id, date: today, status: AttendanceStatus.PRESENT, markedByTeacherId: teacher1.id },
      // Sophia in 10B
      { studentId: student4.id, classId: class10B.id, date: today, status: AttendanceStatus.PRESENT, markedByTeacherId: teacher2.id },
    ],
  });
  console.log('✅ Attendance sample records seeded.');

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
