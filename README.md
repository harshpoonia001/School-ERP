# SchoolFlow ERP - Mini School Management System

> **Aelyx Pvt. Ltd. Full-Stack Take-Home Assignment | 24-Hour Engineering Challenge**  
> A production-grade, simplified School Management ERP built with **Node.js/Express**, **React (Vite)**, and **Supabase (PostgreSQL)** featuring full Role-Based Access Control (RBAC), multi-layered feature architecture, and daily attendance workflows.

---

## ⚡ Quickstart Guide (Runs in < 3 Minutes)

### 1. Prerequisites
- **Node.js** (v18+ or v20+)
- **npm** (v9+)

### 2. Clone & Environment Configuration

```bash
# Clone the repository
git clone https://github.com/your-username/School-ERM.git
cd School-ERM
```

Configure your environment variables:

**Backend (`Backend/.env`):**
```bash
cp Backend/.env.example Backend/.env
```
Ensure your Supabase PostgreSQL connection string is set in `Backend/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
JWT_SECRET=super_secret_jwt_key_school_erp_change_me_in_production_32chars!
JWT_EXPIRES_IN=24h
```

**Frontend (`Frontend/.env`):**
```bash
cp Frontend/.env.example Frontend/.env
```
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### 3. Start Both Backend & Frontend (Single Command)

From the project root:
```bash
# Start both Backend (:5000) and Frontend (:5173) simultaneously
npm run dev
```

*(Alternatively, you can run them in separate terminals)*:
- **Backend**: `npm run dev:backend` (or `cd Backend && npm run dev`)
- **Frontend**: `npm run dev:frontend` (or `cd Frontend && npm run dev`)

Open **`http://localhost:5173`** in your browser.

---

## 🔑 Pre-Seeded Demo Credentials

The login page provides **1-Click Quick Demo Login** buttons for each role:

| Role | Email | Password | Access & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@school.com` | `admin123` | Full system control: Manage faculty, classes, students, and system-wide attendance |
| **Teacher** | `teacher@school.com` | `teacher123` | Class in-charge for **Grade 10 - A**: Daily attendance entry, student roster, class logs |
| **Teacher 2** | `teacher2@school.com` | `teacher123` | Class in-charge for **Grade 10 - B** |
| **Student** | `student@school.com` | `student123` | Alex Johnson (Grade 10 - A): View personal profile, attendance percentage & history |
| **Student 2** | `emma@school.com` | `student123` | Emma Watson (Grade 10 - A) |

---

## 🏗️ Tech Stack Justification

| Layer | Choice | Why It Was Chosen |
| :--- | :--- | :--- |
| **Backend** | **Node.js + Express (TypeScript)** | • **Unified Language**: End-to-end TypeScript eliminates context switching and ensures shared contracts.<br>• **Asynchronous Throughput**: High-concurrency event-loop handles batch attendance marking and I/O-bound CRUD effortlessly.<br>• **Security Ecosystem**: Proven libraries for authentication (`bcryptjs`, `jsonwebtoken`), input validation (`zod`), and CORS handling.<br>• **Maintainability**: Clear separation into Routes, Controllers, Middleware, and Prisma data models. |
| **Frontend** | **React 19 + Vite (TypeScript)** | • **Component-Driven UI**: Fits modular dashboard widgets, reactive attendance toggle matrices, and data tables.<br>• **Zero-Reload SPA Navigation**: Role-guarded client routes (`/admin/*`, `/teacher/*`, `/student/*`) offer instant page transitions.<br>• **Sub-Second HMR**: Vite delivers lightning-fast build times (bundle compiles in < 500ms). |
| **Database** | **Supabase PostgreSQL (Free Tier)** | • **Zero Local CPU/RAM Overhead**: Hosted cloud PostgreSQL avoids running heavy local Docker or DB daemons.<br>• **Strict Relational Integrity & ACID**: Mandatory for school ERPs where students belong to classes and attendance links student, class, teacher, and date with composite unique constraints (`UNIQUE(student_id, date)`).<br>• **Native SQL Aggregations**: Enables fast calculations of attendance percentages and daily statistics. |
| **ORM** | **Prisma ORM** | Type-safe schema definition, instant migrations, automated client generation, and declarative seed scripts. |

---

## 📐 System Architecture

### 1. Frontend: Feature-Based Four-Layer Architecture

Every feature module (`auth/`, `dashboard/`, `teachers/`, `classes/`, `students/`, `attendance/`) is strictly structured into 4 decoupled layers:

```
src/features/<feature>/
├── api/            # Layer 1: Pure Axios HTTP communication (No React state)
├── state/          # Layer 2: Dedicated Context & Source-of-Truth Provider
├── hooks/          # Layer 3: Custom hook orchestrating API, State, and UI actions
└── ui/             # Layer 4: Declarative UI components & full page views
    ├── components/
    └── pages/
```

- **API Layer**: Single point of communication with backend endpoints.
- **State Layer**: The only layer where primary feature states are created and exposed.
- **Hooks Layer**: Orchestrates API requests, state updates, toast alerts, and provides clean action handlers.
- **UI Layer**: Displays the interface and captures user intent, delegating all operations to the feature hook.

### 2. URL Decoupling
- **Backend CORS**: Configured dynamically from a single environment variable: `FRONTEND_URL` (supports single origins or comma-separated lists).
- **Frontend API**: All requests route through a single centralized client driven by `VITE_API_BASE_URL`.

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

### Core Requirements (Must-Have)
- [x] **Authentication & RBAC**: JWT bearer tokens, `bcryptjs` password hashing, protected endpoints.
- [x] **Staff & Teacher Management (Admin)**: Add, edit, delete faculty; assign subjects and homerooms.
- [x] **Class & Section Management (Admin)**: Create classes, assign faculty in-charge, view student headcounts.
- [x] **Student Management (Admin)**: Add, edit, delete students; auto-provision student self-service accounts.
- [x] **Daily Attendance Entry**: Teacher marks their assigned class with status buttons (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`).
- [x] **Role-Tailored Dashboards**:
  - **Admin**: Student, teacher, class counts + today's attendance summary rate + per-class status breakdown.
  - **Teacher**: Homeroom summary, today's submission status indicator, 30-day class attendance rate.
  - **Student**: Personal attendance percentage badge, total present/absent counts, and history table.

### Bonus Points (Optional Scopes Completed)
- [x] **First-Class Student Portal**: Students log in, inspect their attendance percentage, and view recent logs.
- [x] **Instant Search & Filters**: Search across students and teachers; filter student roster by class and section.
- [x] **1-Click "Mark All Present"**: Convenience feature for teachers to record attendance in seconds.
- [x] **CSV Export**: Download full attendance report for any class and date range with a single click.
- [x] **Polished Obsidian Dark Glass Design System**: Glassmorphism cards, micro-animations, toast notifications, responsive sidebar, and accessible modal dialogs without external UI libraries.

---

## 🔮 What Was Skipped / Future Improvements

Given the 24-hour take-home scope, the following production features were planned for future phases:
1. **Parent Portal Activation**: The database already includes the `parents` and `parent_students` schema tables. A dedicated parent portal view with SMS/email notifications for student absences can be activated without schema modifications.
2. **Automated Notification Dispatch**: Email/SMS webhooks (e.g. Twilio / SendGrid) triggered whenever a student is marked `ABSENT`.
3. **Timetable & Period Attendance**: Extending daily homeroom attendance to per-subject period attendance.
4. **Biometric & RFID Sync**: Webhook receiver for automated biometric/RFID turnstile attendance entry.

---

## 📄 License
ISC License &bull; Developed for Aelyx Pvt. Ltd. Full-Stack Take-Home Challenge.
