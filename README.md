# SchoolFlow ERP - Mini School Management System

---

## ⚡ Quickstart Guide (Runs in < 3 Minutes)

### 1. Prerequisites
- **Node.js** (v18+ or v20+)
- **npm** (v9+)

---

### 2. Clone & Environment Configuration

```bash
# Clone the repository
git clone https://github.com/harshpoonia001/School-ERP.git
cd School-ERP
```

#### Step A: Configure Backend (`Backend/.env`)
```bash
cp Backend/.env.example Backend/.env
```

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
JWT_SECRET=super_secret_jwt_key_school_erp_change_me_in_production_32chars!
JWT_EXPIRES_IN=24h
```

#### Step B: Configure Frontend (`Frontend/.env`)
```bash
cp Frontend/.env.example Frontend/.env
```
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### 3. Initialize Database Schema & Seed Data (Single Command)

From the project root directory, push the Prisma relational schema to Supabase and seed realistic demo records:

```bash
# Pushes Prisma schema to Supabase and seeds demo classes, faculty, students & attendance
npm run setup:db
```

*(Alternatively, you can run them individually)*:
- **Push Schema**: `npm --prefix Backend run prisma:push`
- **Seed Database**: `npm --prefix Backend run db:seed`

---

### 4. Start Both Backend & Frontend Simultaneously

From the project root:
```bash
# Starts Backend (:5000) and Frontend (:5173) concurrently in one terminal
npm run dev
```

*(Or run in separate terminal tabs if preferred)*:
- **Backend**: `npm run dev:backend` (or `cd Backend && npm run dev`)
- **Frontend**: `npm run dev:frontend` (or `cd Frontend && npm run dev`)

Open **`http://localhost:5173`** in your browser.

---

## 🔑 Pre-Seeded Demo Credentials (Prototype Evaluation Mode)

The login screen includes a dedicated **Prototype Evaluation Mode** toolbar with 1-click credential pre-fills for rapid persona testing:

| Role | Email | Password | Access & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@school.com` | `admin123` | Full administrative control: Manage faculty, classes, student enrollment & portal access, and school-wide attendance audits. |
| **Teacher** | `teacher@school.com` | `teacher123` | Homeroom in-charge for **Grade 10 - A**: Daily roll call marking, student roster, and class attendance logs. |
| **Teacher 2** | `teacher2@school.com` | `teacher123` | Homeroom in-charge for **Grade 10 - B**: Science & homeroom management. |
| **Student** | `student@school.com` | `student123` | Alex Johnson (Grade 10 - A): Personal dashboard, attendance percentage KPI, and session logs. |
| **Student 2** | `emma@school.com` | `student123` | Emma Watson (Grade 10 - A): Student self-service portal. |

---

## 📖 Role-Based Walkthrough & First-Time User Guide

When logging into SchoolFlow ERP for the first time, each user persona experiences a tailored workflow:

### 👑 1. Administrator Experience (`/admin`)
The **Admin** holds full operational command over school data, security policies, and daily roll call operations:
1. **Executive Operations Command & Master Dashboard (`/admin`)**:
   - **⚡ Daily Roll Call Session Launch Control (`AttendanceDay`)**: Centralized administrative switch on the dashboard to formally launch today's morning roll call with a single click. Displays the active session date, status badge, and signals all classroom faculty that roll call is active.
   - **Top-Level KPI Overview**: Total Enrolled Students, Teaching Faculty, Active Classrooms, and Today's School-Wide Attendance Percentage.
   - **Classroom Attendance Status Table**: Live per-classroom breakdown featuring Homeroom Teacher, Room Number, Enrolled Count, Present Count, **Absent / Late Student Breakdown**, and a visual **Attendance Rate** progress bar.
   - **🔥 Ranked Absence Watchlist**: Automatically ranks classrooms by highest absent count today, allowing school leadership to instantly detect truancy hotspots and attendance anomalies.
   - **📡 Recent Submissions Feed**: Real-time activity stream showing latest roll call submissions submitted by homeroom teachers, including timestamps and counts.
2. **Faculty & Staff Management (`/admin/teachers`)**:
   - Click **"+ Add Faculty Member"** to onboard a new teacher with employee ID, subject specialization, and initial credentials.
   - Edit contact info or delete inactive staff records.
   - Paginated faculty directory with instant search across name, subject, employee ID, and email.
3. **Classes & Sections (`/admin/classes`)**:
   - Create academic classes (e.g., `Grade 10`, Section `A`, Room `Room 304`, Academic Year `2025-2026`).
   - Assign an active faculty member as the **Homeroom Class In-Charge**.
   - Monitor enrolled student headcounts per class card.
4. **Student Information System & Security Holds (`/admin/students`)**:
   - **4 Metric KPI Cards**: Total Enrolled, Portal Active, Unprovisioned Accounts, and **Security Suspensions** (tracks accounts currently under bursar hold or auth lock).
   - **Portal Status Filtering**: Filter roster instantly by `All Students`, `Portal Active`, `No Portal`, or `Suspended`.
   - **Enroll New Student**: Register student profile, institutional student ID (`STU-XXXX-XXX`), roll number, class assignment, and guardian contact details.
   - **🔒 Student Account Suspension & Reactivation**:
     - Each student's portal status is prominently marked in the directory (`Enabled`, `No Account`, or red `Suspended - Security Hold · Access Restricted` pill).
     - Editing a student opens the dedicated **Portal Security & Access Status Neu Card** featuring real-time account status, security hold notice, and a 1-click **"Suspend Student Access" / "Reactivate Access"** toggle.
     - Suspending a student blocks login credentials and portal access immediately while keeping all historical attendance and academic files completely safe.
     - Provision credentials for students who initially had no login account, or reset passwords with 1-click random password generation.
5. **System-Wide Attendance Records & CSV Export (`/admin/attendance`)**:
   - Multi-filter historical attendance by Class and Date Range (`From` &rarr; `To`).
   - Click **"Export to CSV"** to instantly generate and download formatted attendance sheets.
6. **Account Security**:
   - Change administrator password at any time via the **"Change Password"** button in the top header.

---

### 👨‍🏫 2. Teacher Experience (`/teacher`)
The **Teacher** portal is engineered for high-speed classroom operations:
1. **Homeroom Dashboard (`/teacher`)**:
   - View assigned class status (e.g., `Grade 10 - A`, `Room 304`), total enrolled strength, and 30-day attendance trends.
   - **📡 Live Roll Call Synchronization**: Displays visual confirmation when today's attendance session has been formally launched by the administration (`Live Roll Call Active`).
   - Displays a prominent status card indicating whether today's attendance has been recorded or is still pending.
2. **Daily Roll Call Workspace (`/teacher/attendance/mark`)**:
   - Fast, keyboard-friendly attendance recording for the teacher's assigned class.
   - **⚡ 1-Click "Mark All Present"**: Sets the entire class roster to `Present` in one click.
   - Granular status toggles: Toggle individual students between `Present` [Green], `Late` [Amber], `Absent` [Red], and `Excused` [Blue].
   - Add contextual remarks (e.g., *"Medical excuse note provided"*).
   - Save and update submissions with full revision tracking.
3. **Student Class Roster (`/teacher/students`)**:
   - View assigned homeroom students, roll numbers, guardian contact numbers, and portal status.
4. **Class Attendance History (`/teacher/attendance/history`)**:
   - Audit chronological attendance logs for the homeroom class with pagination and CSV export.
5. **Default Password Security Alert**:
   - If using the initial default password assigned by the admin (`teacher123`), an amber warning banner is displayed across the top of the dashboard:
     > ⚠️ **Default Initial Password in Use**: *Please update your password to secure your account.*
   - Clicking **"Update Password Now"** opens the password change dialog, which automatically clears the warning once updated.

---

### 🎓 3. Student Experience (`/student`)
The **Student** self-service portal provides attendance transparency:
1. **Personal Dashboard (`/student`)**:
   - View student profile details (Name, Class, Roll Number, Institutional ID).
   - Prominent **Attendance Percentage Health Badge** (>90% Green, 75-90% Amber, <75% Red).
   - Summary counters: Total Sessions Held, Days Present, Days Absent, and Late arrivals.
   - Quick preview of the 7 most recent class sessions.
2. **Complete Attendance History (`/student/attendance`)**:
   - Full, paginated date-by-date attendance record with status badges and teacher remarks.
3. **Account Password Update**:
   - Students can change their password directly from their dashboard, clearing the initial password security alert banner.

---

## 🏗️ Tech Stack Justification

| Layer | Choice | Why It Was Chosen |
| :--- | :--- | :--- |
| **Backend** | **Node.js + Express (TypeScript)** | • **Unified Language**: End-to-end TypeScript eliminates context switching and ensures shared contracts.<br>• **Asynchronous Throughput**: High-concurrency event-loop handles batch attendance marking and I/O-bound CRUD effortlessly.<br>• **Security Ecosystem**: Proven libraries for authentication (`bcryptjs`, `jsonwebtoken`), input validation (`zod`), and CORS handling.<br>• **Maintainability**: Clear separation into Routes, Controllers, Middleware, and Prisma data models. |
| **Frontend** | **React 19 + Vite (TypeScript)** | • **Component-Driven UI**: Fits modular dashboard widgets, reactive attendance toggle matrices, and data tables.<br>• **Zero-Reload SPA Navigation**: Role-guarded client routes (`/admin/*`, `/teacher/*`, `/student/*`) offer instant page transitions.<br>• **Sub-Second HMR**: Vite delivers lightning-fast build times (bundle compiles in < 500ms). |
| **Database** | **Supabase PostgreSQL (Free Tier)** | • **Zero Local CPU/RAM Overhead**: Hosted cloud PostgreSQL avoids running heavy local Docker or DB daemons.<br>• **Strict Relational Integrity & ACID**: Mandatory for school ERPs where students belong to classes and attendance links student, class, teacher, and date with composite unique constraints (`UNIQUE(student_id, date)`).<br>• **Native SQL Aggregations**: Enables fast calculations of attendance percentages and daily statistics. |
| **ORM** | **Prisma ORM** | Type-safe schema definition, instant migrations, automated client generation, and declarative seed scripts. |

---

## 🗄️ Database Model & ERD

```mermaid
erDiagram
    USERS ||--o| TEACHERS : "has profile (if TEACHER)"
    USERS ||--o| STUDENTS : "has profile (if STUDENT)"
    USERS ||--o| PARENTS : "has profile (if PARENT)"

    TEACHERS ||--o{ CLASSES : "assigned as class in-charge"
    CLASSES ||--o{ STUDENTS : "enrolls"

    STUDENTS ||--o{ ATTENDANCE : "has records"
    CLASSES ||--o{ ATTENDANCE : "recorded for"
    TEACHERS ||--o{ ATTENDANCE : "marked by"

    PARENTS ||--o{ PARENT_STUDENTS : "associated with"
    STUDENTS ||--o{ PARENT_STUDENTS : "linked to"

    USERS {
        uuid id PK
        string email UK
        string password_hash
        enum role "ADMIN, TEACHER, STUDENT, PARENT"
        boolean is_active
        boolean must_change_password
        timestamp created_at
    }

    TEACHERS {
        uuid id PK
        string employee_id UK "nullable (institutional ID)"
        uuid user_id FK, UK
        string name
        string phone
        string subject
    }

    CLASSES {
        uuid id PK
        string name "Grade 10"
        string section "A"
        uuid class_teacher_id FK "nullable"
        string academic_year "2026-2027"
    }

    STUDENTS {
        uuid id PK
        string student_id UK "nullable (institutional ID)"
        uuid user_id FK, UK "nullable (portal account)"
        string roll_number "class roll number"
        string name
        uuid class_id FK
        string guardian_name
        string guardian_phone
        string guardian_email
        date date_of_birth
    }

    ATTENDANCE {
        uuid id PK
        uuid student_id FK
        uuid class_id FK
        date date
        enum status "PRESENT, ABSENT, LATE, EXCUSED"
        uuid marked_by_teacher_id FK
        string remarks
    }
```

### Relational Highlights
- **Resilient Primary Keys**: All records use system-generated `UUID` primary keys.
- **Optional Institutional Identifiers**: Teachers have optional `employee_id` (`UNIQUE NULL`) and students have optional `student_id` (`UNIQUE NULL`), allowing institutions to maintain their legacy IDs alongside the system's UUID architecture.
- **Data Integrity Constraints**:
  - `classes`: `UNIQUE(name, section, academic_year)`
  - `students`: `UNIQUE(class_id, roll_number)`
  - `attendance`: `UNIQUE(student_id, date)` preventing duplicate logs on the same date.

---

## 🌟 Features Implemented

### Core Requirements
- [x] **Authentication & RBAC**: JWT bearer tokens, `bcryptjs` password hashing, protected endpoints.
- [x] **Staff & Teacher Management (Admin)**: Add, edit, delete faculty; assign subjects and homerooms.
- [x] **Class & Section Management (Admin)**: Create classes, assign faculty in-charge, view student headcounts.
- [x] **Student Management (Admin & Teacher)**: Add, edit, delete students; manage portal access post-creation.
- [x] **Daily Attendance Entry**: Teacher marks their assigned class with status buttons (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`).
- [x] **Role-Tailored Dashboards**:
  - **Admin**: Student, teacher, class counts + today's attendance summary rate + per-class status breakdown.
  - **Teacher**: Homeroom summary, today's submission status indicator, 30-day class attendance rate.
  - **Student**: Personal attendance percentage badge, total present/absent counts, and history table.

### Bonus Features & Enhancements
- [x] **⚡ Live Roll Call Session Launch (`AttendanceDay`)**: Centralized administrative switch to officially launch the school-wide daily roll call session with a single click, instantly broadcasting live status to all classroom teachers.
- [x] **🔒 Student Account Suspension & Security Hold**: Administrators can suspend student digital portal access with one click from the student edit dialog, placing accounts under an administrative hold while keeping academic and attendance records intact.
- [x] **🔥 Ranked Absence Watchlist**: Automatic ranking of classrooms based on today's absence counts, enabling leadership to detect anomalies at a glance.
- [x] **Classroom Attendance Matrix**: Live administrative table showing homeroom teachers, enrolled strength, present count, absent/late student counts, and attendance rate progress bars.
- [x] **🎨 Alabaster & Laurel Tactile Neumorphic Design System**: Custom soft-extruded cards, sunken tactile wells, zero image upload overhead via frontend initial avatars, and responsive layouts.
- [x] **Universal Table Pagination**: Reusable `<Pagination />` component integrated across student directory, faculty list, attendance reports, classes, and student personal logs with customizable per-page limits.
- [x] **Post-Creation Student Portal Access**: Admins and teachers can grant, update, or revoke student portal accounts anytime from the edit modal.
- [x] **Initial Password Security Banner**: Notification banner alerting users who are still using default assigned passwords, with self-service password update modal.
- [x] **First-Class Student Portal**: Students log in, inspect their attendance percentage, and view recent logs.
- [x] **Instant Search & Filters**: Search across students and teachers; filter student roster by class, section, or portal status (`Active`, `Unprovisioned`, `Suspended`).
- [x] **1-Click "Mark All Present"**: Convenience feature for teachers to record attendance in seconds.
- [x] **CSV Export**: Download full attendance report for any class and date range with a single click.

---

## 🔮 Future Scope & Planned Improvements

1. **High-Volume Bulk Student Enrollment via CSV/XLSX & Direct Supabase Storage**:
   - *Architecture Design*: To support high-volume enrollment (hundreds of students at the start of an academic term), an asynchronous bulk ingestion pipeline was architected:
     - Providing a downloadable spreadsheet template (`.csv` / `.xlsx`).
     - Frontend uploads the file directly to a dedicated Supabase Storage bucket (`student-imports/`) via a backend-generated presigned upload URL, avoiding server memory overhead.
     - An asynchronous background worker parses rows, resolves classes, creates student records and optional portal accounts.
     - **Fault Tolerance**: If any row fails (e.g., duplicate roll number or missing class), the worker records the exact row number and failure reason without halting the batch, uploading a downloadable error report CSV back to Supabase Storage.
   - *Status*: Scoped for future enterprise releases to prevent overengineering in the core MVP while preserving strict relational integrity.
2. **Parent Portal Activation**: The database already includes the `parents` and `parent_students` schema tables. A dedicated parent portal view with SMS/email notifications for student absences can be activated without schema modifications.
3. **Automated Notification Dispatch**: Email/SMS webhooks (e.g. Twilio / SendGrid) triggered whenever a student is marked `ABSENT`.
4. **Timetable & Period Attendance**: Extending daily homeroom attendance to per-subject period attendance.
5. **Biometric & RFID Sync**: Webhook receiver for automated biometric/RFID turnstile attendance entry.