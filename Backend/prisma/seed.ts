import { PrismaClient, Role, AttendanceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to check if a date is a weekend (0 = Sunday, 6 = Saturday)
function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

// Generate an array of the last N school days (excluding weekends) ending today
function getPastSchoolDays(numDays: number): Date[] {
  const schoolDays: Date[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const cursor = new Date(Date.UTC(year, month, day));

  while (schoolDays.length < numDays) {
    if (!isWeekend(cursor)) {
      schoolDays.push(new Date(cursor));
    }
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return schoolDays.reverse(); // Chronological order
}

const REALISTIC_REMARKS = {
  ABSENT: [
    'Medical leave - physician note submitted to infirmary',
    'Mild viral fever reported by guardian via phone call',
    'Family emergency - bereavement leave granted by principal',
    'Severe flu symptoms; advised 2-day home rest by clinic',
    'Severe weather / flash road flooding near residence',
    'Pre-approved family travel out of town',
    'Gastroenteritis symptoms; resting at home',
    'Dental surgery recovery; prescription on file',
  ],
  LATE: [
    'City transit line breakdown; delayed arrival by 25 mins',
    'Severe road congestion due to downtown infrastructure work',
    'School bus route #4 mechanical delay',
    'Morning dental consultation appointment',
    'Bad weather bicycle flat tire; checked in at front desk',
    'Arrived 15 mins late due to heavy morning rainstorm',
  ],
  EXCUSED: [
    'Representing school at Regional STEM Olympiad Finals',
    'Inter-school debate championship at City Council Hall',
    'Junior Varsity athletics tournament participation',
    'Embassy visa interview appointment with parents',
    'State music orchestra ensemble performance',
  ],
  PRESENT: [
    'On time - active classroom participation',
    'Assisted with morning physics laboratory setup',
    'Prefect duty completed before homeroom bell',
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🌱 Starting comprehensive database seed for SchoolFlow ERP...');

  // 1. Clear existing records in proper dependency order
  console.log('🧹 Purging existing records...');
  await prisma.attendance.deleteMany();
  await prisma.attendanceDay.deleteMany();
  await prisma.parentStudent.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.student.deleteMany();
  await prisma.class.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();

  // 2. Pre-hash passwords (done once outside for blazing fast seed speed)
  console.log('🔑 Hashing security credentials...');
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const teacherPasswordHash = await bcrypt.hash('teacher123', 10);
  const studentPasswordHash = await bcrypt.hash('student123', 10);

  // 3. Create Admin Account
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@school.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });
  console.log('✅ Admin account seeded: admin@school.com / admin123');

  // 4. Create Diverse Faculty & Teachers
  console.log('👨‍🏫 Seeding teaching faculty...');
  const facultyData = [
    {
      name: 'Sarah Jenkins',
      email: 'teacher@school.com',
      subject: 'Mathematics & Calculus',
      employeeId: 'EMP-101',
      phone: '+1 555-0141',
    },
    {
      name: 'David Miller',
      email: 'teacher2@school.com',
      subject: 'Physics & Astronomy',
      employeeId: 'EMP-102',
      phone: '+1 555-0142',
    },
    {
      name: 'Elena Rostova',
      email: 'elena@school.com',
      subject: 'Chemistry & Organic Labs',
      employeeId: 'EMP-103',
      phone: '+1 555-0143',
    },
    {
      name: 'Marcus Vance',
      email: 'marcus@school.com',
      subject: 'English Literature & Rhetoric',
      employeeId: 'EMP-104',
      phone: '+1 555-0144',
    },
    {
      name: 'Priya Sharma',
      email: 'priya@school.com',
      subject: 'Computer Science & Software',
      employeeId: 'EMP-105',
      phone: '+1 555-0145',
    },
    {
      name: 'Gabriel Sterling',
      email: 'gabriel@school.com',
      subject: 'World History & Political Science',
      employeeId: 'EMP-106',
      phone: '+1 555-0146',
    },
    {
      name: 'Amara Okafor',
      email: 'amara@school.com',
      subject: 'Biology & Environmental Ecology',
      employeeId: 'EMP-107',
      phone: '+1 555-0147',
    },
  ];

  const teachers: Array<any> = [];
  for (const f of facultyData) {
    const user = await prisma.user.create({
      data: {
        email: f.email,
        passwordHash: teacherPasswordHash,
        role: Role.TEACHER,
      },
    });

    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        name: f.name,
        employeeId: f.employeeId,
        subject: f.subject,
        phone: f.phone,
      },
    });

    teachers.push(teacher);
  }
  console.log(`✅ Seeded ${teachers.length} faculty members.`);

  // 5. Create Academic Classrooms with Room Numbers
  console.log('🏫 Seeding classrooms & homerooms...');
  const classConfigs = [
    { name: 'Grade 10', section: 'A', roomNumber: 'Room 304', teacherIdx: 0, academicYear: '2025-2026' },
    { name: 'Grade 10', section: 'B', roomNumber: 'Room 305', teacherIdx: 1, academicYear: '2025-2026' },
    { name: 'Grade 11', section: 'Science', roomNumber: 'Chem Lab 201', teacherIdx: 2, academicYear: '2025-2026' },
    { name: 'Grade 11', section: 'Commerce', roomNumber: 'Room 202', teacherIdx: 5, academicYear: '2025-2026' },
    { name: 'Grade 12', section: 'STEM', roomNumber: 'CS Lab 102', teacherIdx: 4, academicYear: '2025-2026' },
    { name: 'Grade 9', section: 'A', roomNumber: 'Room 101', teacherIdx: 3, academicYear: '2025-2026' },
    { name: 'Grade 9', section: 'B', roomNumber: 'Room 102', teacherIdx: 6, academicYear: '2025-2026' },
  ];

  const classes: Array<any> = [];
  for (const cfg of classConfigs) {
    const c = await prisma.class.create({
      data: {
        name: cfg.name,
        section: cfg.section,
        roomNumber: cfg.roomNumber,
        classTeacherId: cfg.teacherIdx !== undefined ? teachers[cfg.teacherIdx].id : null,
        academicYear: cfg.academicYear,
      },
    });
    classes.push(c);
  }
  console.log(`✅ Seeded ${classes.length} classrooms with designated room numbers.`);

  // 6. Create Roster of 32 Diverse Students
  console.log('🎓 Seeding student directory...');
  const studentRosterData = [
    // Class 10-A (Room 304 - Primary demo class)
    {
      name: 'Alex Johnson',
      rollNumber: '101',
      studentId: 'STU-2025-001',
      classIdx: 0,
      guardianName: 'Robert Johnson',
      guardianPhone: '+1 555-0101',
      guardianEmail: 'robert.johnson@example.com',
      dob: '2010-04-12',
      email: 'student@school.com', // Demo login student
    },
    {
      name: 'Emma Watson',
      rollNumber: '102',
      studentId: 'STU-2025-002',
      classIdx: 0,
      guardianName: 'Chris Watson',
      guardianPhone: '+1 555-0102',
      guardianEmail: 'chris.watson@example.com',
      dob: '2010-08-23',
      email: 'emma.watson@schoolflow.edu',
    },
    {
      name: 'Liam Smith',
      rollNumber: '103',
      studentId: 'STU-2025-003',
      classIdx: 0,
      guardianName: 'Mary Smith',
      guardianPhone: '+1 555-0103',
      guardianEmail: 'mary.smith@example.com',
      dob: '2010-01-15',
      email: 'liam.smith@schoolflow.edu',
    },
    {
      name: 'Harsh Poonia',
      rollNumber: '104',
      studentId: 'STU-2025-004',
      classIdx: 0,
      guardianName: 'Sanjay Poonia',
      guardianPhone: '+1 555-0104',
      guardianEmail: 'sanjay.poonia@example.com',
      dob: '2009-12-05',
      email: 'harsh.poonia@schoolflow.edu',
    },
    {
      name: 'Maya Patel',
      rollNumber: '105',
      studentId: 'STU-2025-005',
      classIdx: 0,
      guardianName: 'Anil Patel',
      guardianPhone: '+1 555-0105',
      guardianEmail: 'anil.patel@example.com',
      dob: '2010-05-18',
      email: 'maya.patel@schoolflow.edu',
    },
    {
      name: 'Chloe Dubois',
      rollNumber: '106',
      studentId: 'STU-2025-006',
      classIdx: 0,
      guardianName: 'Jean Dubois',
      guardianPhone: '+1 555-0106',
      guardianEmail: 'jean.dubois@example.com',
      dob: '2010-09-02',
      email: null, // Unprovisioned account for testing
    },
    {
      name: 'Lucas Meyer',
      rollNumber: '107',
      studentId: 'STU-2025-007',
      classIdx: 0,
      guardianName: 'Klaus Meyer',
      guardianPhone: '+1 555-0107',
      guardianEmail: 'klaus.meyer@example.com',
      dob: '2010-03-27',
      email: null, // Unprovisioned account for testing
    },

    // Class 10-B (Room 305)
    {
      name: 'Sophia Brown',
      rollNumber: '201',
      studentId: 'STU-2025-008',
      classIdx: 1,
      guardianName: 'James Brown',
      guardianPhone: '+1 555-0108',
      guardianEmail: 'james.brown@example.com',
      dob: '2010-11-30',
      email: 'sophia.brown@schoolflow.edu',
    },
    {
      name: 'Noah Williams',
      rollNumber: '202',
      studentId: 'STU-2025-009',
      classIdx: 1,
      guardianName: 'Sarah Williams',
      guardianPhone: '+1 555-0109',
      guardianEmail: 'sarah.williams@example.com',
      dob: '2010-07-14',
      email: 'noah.williams@schoolflow.edu',
    },
    {
      name: 'Isabella Garcia',
      rollNumber: '203',
      studentId: 'STU-2025-010',
      classIdx: 1,
      guardianName: 'Carlos Garcia',
      guardianPhone: '+1 555-0110',
      guardianEmail: 'carlos.garcia@example.com',
      dob: '2010-02-20',
      email: 'isabella.garcia@schoolflow.edu',
    },
    {
      name: 'Oliver Queen',
      rollNumber: '204',
      studentId: 'STU-2025-011',
      classIdx: 1,
      guardianName: 'Moira Queen',
      guardianPhone: '+1 555-0111',
      guardianEmail: 'moira.queen@example.com',
      dob: '2010-06-11',
      email: null,
    },
    {
      name: 'Ava Martinez',
      rollNumber: '205',
      studentId: 'STU-2025-012',
      classIdx: 1,
      guardianName: 'Elena Martinez',
      guardianPhone: '+1 555-0112',
      guardianEmail: 'elena.martinez@example.com',
      dob: '2010-10-08',
      email: 'ava.martinez@schoolflow.edu',
    },
    {
      name: 'Diana Chen',
      rollNumber: '206',
      studentId: 'STU-2025-032',
      classIdx: 1,
      guardianName: 'Dr. Kevin Chen',
      guardianPhone: '+1 (555) 782-3490',
      guardianEmail: 'kevin.chen@example.com',
      dob: '2009-01-19',
      email: 'diana.chen@student.school.edu',
      isActive: false, // Suspended account matching reference design!
    },

    // Class 11-Science (Chem Lab 201)
    {
      name: 'Ethan Hunt',
      rollNumber: '301',
      studentId: 'STU-2025-013',
      classIdx: 2,
      guardianName: 'Nathan Hunt',
      guardianPhone: '+1 555-0113',
      guardianEmail: 'nathan.hunt@example.com',
      dob: '2009-01-22',
      email: 'ethan.hunt@schoolflow.edu',
    },
    {
      name: 'Mia Chen',
      rollNumber: '302',
      studentId: 'STU-2025-014',
      classIdx: 2,
      guardianName: 'Wei Chen',
      guardianPhone: '+1 555-0114',
      guardianEmail: 'wei.chen@example.com',
      dob: '2009-05-19',
      email: 'mia.chen@schoolflow.edu',
    },
    {
      name: 'Benjamin Wright',
      rollNumber: '303',
      studentId: 'STU-2025-015',
      classIdx: 2,
      guardianName: 'Edward Wright',
      guardianPhone: '+1 555-0115',
      guardianEmail: 'edward.wright@example.com',
      dob: '2009-08-31',
      email: 'ben.wright@schoolflow.edu',
    },
    {
      name: 'Charlotte Davis',
      rollNumber: '304',
      studentId: 'STU-2025-016',
      classIdx: 2,
      guardianName: 'George Davis',
      guardianPhone: '+1 555-0116',
      guardianEmail: 'george.davis@example.com',
      dob: '2009-11-14',
      email: null,
    },
    {
      name: 'Daniel Craig',
      rollNumber: '305',
      studentId: 'STU-2025-017',
      classIdx: 2,
      guardianName: 'Arthur Craig',
      guardianPhone: '+1 555-0117',
      guardianEmail: 'arthur.craig@example.com',
      dob: '2009-03-02',
      email: 'daniel.craig@schoolflow.edu',
    },

    // Class 11-Commerce (Room 202)
    {
      name: 'Harper Lee',
      rollNumber: '401',
      studentId: 'STU-2025-018',
      classIdx: 3,
      guardianName: 'Amasa Lee',
      guardianPhone: '+1 555-0118',
      guardianEmail: 'amasa.lee@example.com',
      dob: '2009-04-28',
      email: 'harper.lee@schoolflow.edu',
    },
    {
      name: 'James Wilson',
      rollNumber: '402',
      studentId: 'STU-2025-019',
      classIdx: 3,
      guardianName: 'Thomas Wilson',
      guardianPhone: '+1 555-0119',
      guardianEmail: 'thomas.wilson@example.com',
      dob: '2009-09-17',
      email: 'james.wilson@schoolflow.edu',
    },
    {
      name: 'Amelia Taylor',
      rollNumber: '403',
      studentId: 'STU-2025-020',
      classIdx: 3,
      guardianName: 'Richard Taylor',
      guardianPhone: '+1 555-0120',
      guardianEmail: 'richard.taylor@example.com',
      dob: '2009-12-25',
      email: null,
    },
    {
      name: 'Henry Ford',
      rollNumber: '404',
      studentId: 'STU-2025-021',
      classIdx: 3,
      guardianName: 'William Ford',
      guardianPhone: '+1 555-0121',
      guardianEmail: 'william.ford@example.com',
      dob: '2009-07-30',
      email: 'henry.ford@schoolflow.edu',
    },

    // Class 12-STEM (CS Lab 102)
    {
      name: 'Aria Stark',
      rollNumber: '501',
      studentId: 'STU-2025-022',
      classIdx: 4,
      guardianName: 'Eddard Stark',
      guardianPhone: '+1 555-0122',
      guardianEmail: 'eddard.stark@example.com',
      dob: '2008-02-14',
      email: 'aria.stark@schoolflow.edu',
    },
    {
      name: 'Sebastian Croft',
      rollNumber: '502',
      studentId: 'STU-2025-023',
      classIdx: 4,
      guardianName: 'Julian Croft',
      guardianPhone: '+1 555-0123',
      guardianEmail: 'julian.croft@example.com',
      dob: '2008-06-19',
      email: 'sebastian.croft@schoolflow.edu',
    },
    {
      name: 'Zoe Saldana',
      rollNumber: '503',
      studentId: 'STU-2025-024',
      classIdx: 4,
      guardianName: 'Dagoberto Saldana',
      guardianPhone: '+1 555-0124',
      guardianEmail: 'dagoberto.saldana@example.com',
      dob: '2008-09-22',
      email: null,
    },

    // Class 9-A (Room 101)
    {
      name: 'Leo DiCaprio',
      rollNumber: '601',
      studentId: 'STU-2025-025',
      classIdx: 5,
      guardianName: 'George DiCaprio',
      guardianPhone: '+1 555-0125',
      guardianEmail: 'george.dicaprio@example.com',
      dob: '2011-01-11',
      email: 'leo.dicaprio@schoolflow.edu',
    },
    {
      name: 'Grace Hopper',
      rollNumber: '602',
      studentId: 'STU-2025-026',
      classIdx: 5,
      guardianName: 'Walter Murray',
      guardianPhone: '+1 555-0126',
      guardianEmail: 'walter.murray@example.com',
      dob: '2011-04-09',
      email: 'grace.hopper@schoolflow.edu',
    },
    {
      name: 'Kai Takahashi',
      rollNumber: '603',
      studentId: 'STU-2025-027',
      classIdx: 5,
      guardianName: 'Kenji Takahashi',
      guardianPhone: '+1 555-0127',
      guardianEmail: 'kenji.takahashi@example.com',
      dob: '2011-08-16',
      email: null,
    },
    {
      name: 'Zara Phillips',
      rollNumber: '604',
      studentId: 'STU-2025-028',
      classIdx: 5,
      guardianName: 'Mark Phillips',
      guardianPhone: '+1 555-0128',
      guardianEmail: 'mark.phillips@example.com',
      dob: '2011-12-03',
      email: 'zara.phillips@schoolflow.edu',
    },

    // Class 9-B (Room 102)
    {
      name: 'Oscar Isaac',
      rollNumber: '701',
      studentId: 'STU-2025-029',
      classIdx: 6,
      guardianName: 'Oscar Hernandez',
      guardianPhone: '+1 555-0129',
      guardianEmail: 'oscar.hernandez@example.com',
      dob: '2011-03-09',
      email: 'oscar.isaac@schoolflow.edu',
    },
    {
      name: 'Fatima Al-Mansoor',
      rollNumber: '702',
      studentId: 'STU-2025-030',
      classIdx: 6,
      guardianName: 'Tariq Al-Mansoor',
      guardianPhone: '+1 555-0130',
      guardianEmail: 'tariq.almansoor@example.com',
      dob: '2011-07-21',
      email: 'fatima.almansoor@schoolflow.edu',
    },
    {
      name: 'Elijah Wood',
      rollNumber: '703',
      studentId: 'STU-2025-031',
      classIdx: 6,
      guardianName: 'Warren Wood',
      guardianPhone: '+1 555-0131',
      guardianEmail: 'warren.wood@example.com',
      dob: '2011-10-25',
      email: null,
    },
  ];

  const students: Array<any> = [];
  for (const s of studentRosterData) {
    let userId: string | null = null;

    if (s.email) {
      const user = await prisma.user.create({
        data: {
          email: s.email,
          passwordHash: studentPasswordHash,
          role: Role.STUDENT,
          isActive: s.isActive !== undefined ? s.isActive : true,
        },
      });
      userId = user.id;
    }

    const student = await prisma.student.create({
      data: {
        userId,
        name: s.name,
        rollNumber: s.rollNumber,
        studentId: s.studentId,
        classId: classes[s.classIdx].id,
        guardianName: s.guardianName,
        guardianPhone: s.guardianPhone,
        guardianEmail: s.guardianEmail,
        dateOfBirth: new Date(s.dob),
      },
    });

    students.push({
      ...student,
      classIdx: s.classIdx,
    });
  }
  console.log(`✅ Seeded ${students.length} students across 7 classrooms.`);

  // 7. Seed Past 20 School Days of Attendance with Rich Realistic Remarks
  console.log('📅 Generating 20-day historical attendance ledger with descriptive remarks...');
  const pastSchoolDays = getPastSchoolDays(20);
  const attendanceRecordsToInsert: Array<any> = [];

  for (let dayIndex = 0; dayIndex < pastSchoolDays.length; dayIndex++) {
    const dayDate = pastSchoolDays[dayIndex];
    const isToday = dayIndex === pastSchoolDays.length - 1;

    for (const student of students) {
      const classroom = classes[student.classIdx];
      const classTeacherId = classroom.classTeacherId || teachers[0].id;

      // For today, leave 2 classes pending so dashboard shows realistic pending/marked contrast!
      if (isToday && (student.classIdx === 5 || student.classIdx === 6)) {
        continue; // Unmarked today (Pending Roll Call for Grade 9A & 9B)
      }

      // Realistic weighted distribution per student
      let status: AttendanceStatus = AttendanceStatus.PRESENT;
      let remarks: string | null = null;

      if (isToday) {
        // Deterministic realistic attendance for today so Ranked Absence Watchlist has genuine, non-zero values
        if (student.rollNumber === '103') {
          // Liam Smith (Grade 10-A)
          status = AttendanceStatus.ABSENT;
          remarks = 'Mild viral fever reported by guardian via phone call';
        } else if (student.rollNumber === '104') {
          // Harsh Poonia (Grade 10-A)
          status = AttendanceStatus.LATE;
          remarks = 'City transit line breakdown; delayed arrival by 25 mins';
        } else if (student.rollNumber === '105') {
          // Maya Patel (Grade 10-A)
          status = AttendanceStatus.ABSENT;
          remarks = 'Family emergency - bereavement leave granted by principal';
        } else if (student.rollNumber === '206') {
          // Diana Chen (Grade 10-B)
          status = AttendanceStatus.ABSENT;
          remarks = 'Pre-approved family travel out of town';
        } else if (student.rollNumber === '202') {
          // Noah Williams (Grade 10-B)
          status = AttendanceStatus.LATE;
          remarks = 'School bus route #4 mechanical delay';
        } else if (student.rollNumber === '301') {
          // Ethan Hunt (Grade 11-Science)
          status = AttendanceStatus.ABSENT;
          remarks = 'Medical leave - physician note submitted to infirmary';
        } else if (student.rollNumber === '304') {
          // Chloe Bennett (Grade 11-Science)
          status = AttendanceStatus.ABSENT;
          remarks = 'Severe flu symptoms; advised 2-day home rest by clinic';
        } else if (student.rollNumber === '305') {
          // Daniel Craig (Grade 11-Science)
          status = AttendanceStatus.LATE;
          remarks = 'Morning dental consultation appointment';
        } else if (student.rollNumber === '401') {
          // Harper Lee (Grade 11-Commerce)
          status = AttendanceStatus.ABSENT;
          remarks = 'Dental surgery recovery; prescription on file';
        } else if (student.rollNumber === '501') {
          // Aria Stark (Grade 12-STEM)
          status = AttendanceStatus.LATE;
          remarks = 'Arrived 15 mins late due to heavy morning rainstorm';
        } else {
          status = AttendanceStatus.PRESENT;
          if (student.rollNumber === '101') {
            remarks = 'On time - active classroom participation';
          }
        }
      } else if (student.rollNumber === '101') {
        // Alex Johnson: 2 Lates, 1 Excused, 1 Absent over historical ledger
        if (dayIndex === 4) {
          status = AttendanceStatus.LATE;
          remarks = 'Morning dental consultation appointment';
        } else if (dayIndex === 9) {
          status = AttendanceStatus.EXCUSED;
          remarks = 'Representing school at Regional STEM Olympiad Finals';
        } else if (dayIndex === 14) {
          status = AttendanceStatus.ABSENT;
          remarks = 'Medical leave - physician note submitted to infirmary';
        } else if (dayIndex === 18) {
          status = AttendanceStatus.LATE;
          remarks = 'City transit line breakdown; delayed arrival by 25 mins';
        } else {
          status = AttendanceStatus.PRESENT;
          if (dayIndex % 7 === 0) {
            remarks = pickRandom(REALISTIC_REMARKS.PRESENT);
          }
        }
      } else {
        // General student population historical distribution
        const rand = Math.random();
        if (rand < 0.88) {
          status = AttendanceStatus.PRESENT;
          if (Math.random() < 0.15) {
            remarks = pickRandom(REALISTIC_REMARKS.PRESENT);
          }
        } else if (rand < 0.94) {
          status = AttendanceStatus.LATE;
          remarks = pickRandom(REALISTIC_REMARKS.LATE);
        } else if (rand < 0.98) {
          status = AttendanceStatus.ABSENT;
          remarks = pickRandom(REALISTIC_REMARKS.ABSENT);
        } else {
          status = AttendanceStatus.EXCUSED;
          remarks = pickRandom(REALISTIC_REMARKS.EXCUSED);
        }
      }

      attendanceRecordsToInsert.push({
        studentId: student.id,
        classId: classroom.id,
        date: dayDate,
        status,
        remarks,
        markedByTeacherId: classTeacherId,
      });
    }
  }

  // Batch insert attendance in chunks to avoid single massive payload
  const chunkSize = 150;
  for (let i = 0; i < attendanceRecordsToInsert.length; i += chunkSize) {
    const chunk = attendanceRecordsToInsert.slice(i, i + chunkSize);
    await prisma.attendance.createMany({
      data: chunk,
    });
  }
  console.log(`✅ Seeded ${attendanceRecordsToInsert.length} rich attendance session records.`);

  // 8. Seed Today's AttendanceDay Record (Marked as launched by Admin)
  const now = new Date();
  const todayDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const localDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  await prisma.attendanceDay.create({
    data: {
      date: todayDate,
      isOpen: true,
      openedAt: new Date(),
      openedById: adminUser.id,
    },
  });
  console.log(`✅ Seeded active AttendanceDay for ${localDateStr} (launched by Admin).`);

  console.log('\n======================================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('📊 Summary:');
  console.log(`   - 1 Admin: admin@school.com (admin123)`);
  console.log(`   - 7 Teachers: teacher@school.com, teacher2@school.com, elena@school.com... (teacher123)`);
  console.log(`   - 7 Classrooms with custom Room Numbers (Room 304, CS Lab 102, etc.)`);
  console.log(`   - 32 Students with Roll #s, DOBs, Guardian contacts, Institutional IDs`);
  console.log(`   - ${attendanceRecordsToInsert.length} Detailed Attendance records with realistic remarks`);
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
