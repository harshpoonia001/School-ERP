import React, { useEffect, useState } from 'react';
import { useStudents } from '@/features/students/hooks/useStudents';
import { StudentModal } from '../components/StudentModal';
import type { Student, SchoolClass } from '@/shared/types';
import { classesApi } from '@/features/classes/api/classes.api';
import { InitialsAvatar } from '@/shared/ui/Avatar/InitialsAvatar';
import { Pagination } from '@/shared/ui/Pagination/Pagination';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Phone,
  UserCheck,
  UserX,
  Users,
  Building,
  GraduationCap,
  ShieldCheck,
  ShieldAlert,
  Ban,
  KeyRound,
} from 'lucide-react';

function calculateAge(dobString?: string | null): number | null {
  if (!dobString) return null;
  const birthDate = new Date(dobString);
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export const StudentsPage: React.FC = () => {
  const {
    students,
    isLoading,
    selectedClassId,
    search,
    setSelectedClassId,
    setSearch,
    fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
  } = useStudents();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [portalFilter, setPortalFilter] = useState<'ALL' | 'ACTIVE' | 'NONE' | 'SUSPENDED'>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    classesApi.getAll().then(setClasses).catch(console.error);
    fetchStudents();
  }, []);

  const handleClassFilterChange = (newClassId: string) => {
    setSelectedClassId(newClassId);
    setCurrentPage(1);
    fetchStudents(newClassId, search);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStudents(selectedClassId, search);
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (s: Student) => {
    setEditingStudent(s);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete student "${name}"? This will also remove associated attendance records.`)) {
      await deleteStudent(id);
    }
  };

  const handleModalSubmit = async (formData: any) => {
    if (editingStudent) {
      await updateStudent(editingStudent.id, formData);
    } else {
      await addStudent(formData);
    }
  };

  // Filter by portal status
  const filteredStudents = students.filter((s) => {
    if (portalFilter === 'ACTIVE') return !!s.user?.email && s.user?.isActive !== false;
    if (portalFilter === 'NONE') return !s.user?.email;
    if (portalFilter === 'SUSPENDED') return !!s.user?.email && s.user?.isActive === false;
    return true;
  });

  // Calculate Directory KPIs
  const totalEnrolled = students.length;
  const portalActiveCount = students.filter((s) => !!s.user?.email && s.user?.isActive !== false).length;
  const suspendedCount = students.filter((s) => !!s.user?.email && s.user?.isActive === false).length;
  const unprovisionedCount = students.filter((s) => !s.user?.email).length;
  const portalProvisionRate = totalEnrolled > 0 ? Math.round((portalActiveCount / totalEnrolled) * 100) : 0;

  // Slice paginated items
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--charcoal)', margin: 0 }}>
            Student Directory & Enrollment
          </h2>
          <p style={{ color: 'var(--slate)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
            Maintain student rosters, assign institutional identifiers, and provision portal accounts
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} /> Enroll New Student
        </button>
      </div>

      {/* 4 Metric KPI Cards with Neumorphic Extrusion */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
        <div className="neu-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Enrolled
            </span>
            <div className="neu-circle-inset">
              <Users size={16} color="var(--primary-laurel)" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--charcoal)' }}>
            {totalEnrolled}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate)', marginTop: '0.25rem' }}>
            Students registered in academic database
          </div>
        </div>

        <div className="neu-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Portal Active
            </span>
            <div className="neu-circle-inset">
              <ShieldCheck size={16} color="var(--primary-laurel)" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-laurel-dark)' }}>
              {portalActiveCount}
            </span>
            <span className="badge badge-present" style={{ fontSize: '0.75rem' }}>
              {portalProvisionRate}% Active
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate)', marginTop: '0.25rem' }}>
            Have digital credentials enabled
          </div>
        </div>

        <div className="neu-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Unprovisioned
            </span>
            <div className="neu-circle-inset">
              <KeyRound size={16} color="var(--amber-500)" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: unprovisionedCount > 0 ? '#94621A' : 'var(--charcoal)' }}>
            {unprovisionedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate)', marginTop: '0.25rem' }}>
            Need initial credentials or onboarding
          </div>
        </div>

        {/* 4th Neu Card: Security Suspensions */}
        <div className="neu-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Security Suspensions
            </span>
            <div className="neu-circle-inset" style={{ color: 'var(--rose-500)' }}>
              <ShieldAlert size={16} color="var(--rose-500)" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: suspendedCount > 0 ? 'var(--rose-500)' : 'var(--charcoal)' }}>
              {suspendedCount}
            </span>
            {suspendedCount > 0 && (
              <span className="badge badge-absent" style={{ fontSize: '0.75rem' }}>
                Restricted
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate)', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Bursar hold or Auth lock</span>
            {suspendedCount > 0 && (
              <button
                type="button"
                onClick={() => setPortalFilter('SUSPENDED')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--rose-500)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Review locks
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="neu-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Class Filter & Portal Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--primary-laurel)" />
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '190px' }}
              value={selectedClassId}
              onChange={(e) => handleClassFilterChange(e.target.value)}
            >
              <option value="all">All Classes & Sections</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.section} {c.roomNumber ? `(${c.roomNumber})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Portal Filter Pills */}
          <div className="status-pill-group" style={{ height: '36px', alignItems: 'center' }}>
            <button
              type="button"
              className={`neu-btn btn-sm ${portalFilter === 'ALL' ? 'btn-primary' : ''}`}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
              onClick={() => setPortalFilter('ALL')}
            >
              All Students
            </button>
            <button
              type="button"
              className={`neu-btn btn-sm ${portalFilter === 'ACTIVE' ? 'btn-primary' : ''}`}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
              onClick={() => setPortalFilter('ACTIVE')}
            >
              Portal Active
            </button>
            <button
              type="button"
              className={`neu-btn btn-sm ${portalFilter === 'NONE' ? 'btn-primary' : ''}`}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
              onClick={() => setPortalFilter('NONE')}
            >
              No Portal
            </button>
            <button
              type="button"
              className={`neu-btn btn-sm ${portalFilter === 'SUSPENDED' ? 'btn-primary' : ''}`}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
              onClick={() => setPortalFilter('SUSPENDED')}
            >
              Suspended ({suspendedCount})
            </button>
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', minWidth: '280px', flex: 1, maxWidth: '420px' }}>
          <div className="neu-inset-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', width: '100%' }}>
            <Search size={15} color="var(--slate-light)" />
            <input
              type="text"
              placeholder="Search name, roll #, institutional ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.8125rem',
                color: 'var(--charcoal)',
                width: '100%',
              }}
            />
          </div>
          <button type="submit" className="neu-btn btn-sm">
            Search
          </button>
          {search && (
            <button
              type="button"
              className="neu-btn btn-sm"
              onClick={() => {
                setSearch('');
                fetchStudents(selectedClassId, '');
              }}
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Students Data Table */}
      <div className="neu-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Roll</th>
                <th>Student</th>
                <th>Classroom</th>
                <th>Institutional ID</th>
                <th>Guardian Contact</th>
                <th>Portal Access</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && students.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate)' }}>
                    Loading student directory...
                  </td>
                </tr>
              ) : paginatedStudents.length > 0 ? (
                paginatedStudents.map((s) => {
                  const age = calculateAge(s.dateOfBirth);
                  return (
                    <tr key={s.id}>
                      <td>
                        <span
                          className="neu-inset-sm"
                          style={{
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            color: 'var(--primary-laurel-dark)',
                            padding: '0.2rem 0.5rem',
                            display: 'inline-block',
                          }}
                        >
                          #{s.rollNumber}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <InitialsAvatar name={s.name} size="sm" />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--charcoal)' }}>{s.name}</div>
                            {age !== null && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--slate)' }}>
                                Age {age} yrs
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span
                            className="badge"
                            style={{
                              background: '#EAF2EC',
                              color: '#3E6B4C',
                              borderColor: '#D0E3D3',
                              fontWeight: 700,
                            }}
                          >
                            {s.class ? `${s.class.name} - ${s.class.section}` : 'Unassigned'}
                          </span>
                          {s.class?.roomNumber && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--slate)', marginTop: '0.15rem' }}>
                              {s.class.roomNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        {s.studentId ? (
                          <span
                            className="neu-inset-sm"
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: 'var(--charcoal)',
                              padding: '0.2rem 0.5rem',
                              display: 'inline-block',
                            }}
                          >
                            {s.studentId}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--slate-light)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--charcoal)' }}>{s.guardianName}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--slate)', marginTop: '0.15rem' }}>
                          <Phone size={12} color="var(--primary-laurel)" />
                          <span>{s.guardianPhone}</span>
                        </div>
                      </td>
                      <td>
                        {s.user?.email ? (
                          s.user.isActive === false ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span className="badge badge-absent" style={{ width: 'fit-content' }}>
                                <Ban size={12} /> Suspended
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--rose-500)', fontWeight: 600 }}>
                                Security Hold · Access Restricted
                              </span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span className="badge badge-present" style={{ width: 'fit-content' }}>
                                <UserCheck size={12} /> Enabled
                              </span>
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  color: 'var(--slate)',
                                  maxWidth: '170px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={s.user.email}
                              >
                                {s.user.email}
                              </span>
                            </div>
                          )
                        ) : (
                          <span
                            className="badge"
                            style={{
                              background: '#EDEBE4',
                              color: 'var(--slate)',
                              borderColor: '#DDD8CE',
                            }}
                          >
                            No Account
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="neu-btn btn-sm"
                            style={{ padding: '0.35rem 0.6rem' }}
                            title="Edit Student Record & Portal"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id, s.name)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.35rem 0.6rem' }}
                            title="Delete Student"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate)' }}>
                    No students match the current filters. Click "Enroll New Student" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredStudents.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      <StudentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        studentToEdit={editingStudent}
        defaultClassId={selectedClassId}
      />
    </div>
  );
};
