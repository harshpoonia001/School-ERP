import React, { useEffect, useState } from 'react';
import { useStudents } from '@/features/students/hooks/useStudents';
import { StudentModal } from '../components/StudentModal';
import type { Student, SchoolClass } from '@/shared/types';
import { classesApi } from '@/features/classes/api/classes.api';
import { Plus, Search, Filter, Edit2, Trash2, Phone, Mail, UserCheck } from 'lucide-react';
import { Pagination } from '@/shared/ui/Pagination/Pagination';

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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

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

  // Slice paginated items
  const paginatedStudents = students.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem' }}>Student Directory & Enrollment</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Filter by class, search by roll number or ID, and maintain student records
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} /> Enroll New Student
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        {/* Class Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '220px' }}>
          <Filter size={16} color="var(--primary-500)" />
          <select
            className="form-select"
            value={selectedClassId}
            onChange={(e) => handleClassFilterChange(e.target.value)}
          >
            <option value="all">All Classes & Sections</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.section} ({c.studentCount ?? 0} students)
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by student name, roll number, institutional ID, or guardian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
          {search && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSearch('');
                fetchStudents(selectedClassId, '');
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Students Data Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Institutional ID</th>
                <th>Guardian Contact</th>
                <th>Portal Access</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && students.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    Loading student directory...
                  </td>
                </tr>
              ) : paginatedStudents.length > 0 ? (
                paginatedStudents.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary-500)', fontSize: '0.9375rem' }}>
                        #{s.rollNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      {s.dateOfBirth && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          DOB: {s.dateOfBirth.split('T')[0]}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                        {s.class ? `${s.class.name} - ${s.class.section}` : 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      {s.studentId ? (
                        <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {s.studentId}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{s.guardianName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        <Phone size={13} color="var(--text-muted)" />
                        <span>{s.guardianPhone}</span>
                      </div>
                      {s.guardianEmail && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          <Mail size={12} />
                          <span>{s.guardianEmail}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      {s.user?.email ? (
                        <span className="badge badge-present" title={`Login: ${s.user.email}`}>
                          <UserCheck size={12} /> Enabled
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                          No Account
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Student"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          className="btn btn-danger btn-sm"
                          title="Delete Student"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No students match the selected filter. Click "Enroll New Student" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={students.length}
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
