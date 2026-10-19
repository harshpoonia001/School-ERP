import React, { useEffect, useState } from 'react';
import { useTeachers } from '../../hooks/useTeachers';
import { TeacherModal } from '../components/TeacherModal';
import { Teacher } from '../../../../shared/types/index';
import { Plus, Search, Edit2, Trash2, Mail, Phone, BookOpen } from 'lucide-react';
import { Pagination } from '@/shared/ui/Pagination/Pagination';

export const TeachersPage: React.FC = () => {
  const { teachers, isLoading, search, setSearch, fetchTeachers, addTeacher, updateTeacher, deleteTeacher } =
    useTeachers();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTeachers(search);
  };

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete teacher "${name}"? This action cannot be undone.`)) {
      await deleteTeacher(id);
    }
  };

  const handleModalSubmit = async (formData: any) => {
    if (editingTeacher) {
      await updateTeacher(editingTeacher.id, formData);
    } else {
      await addTeacher(formData);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem' }}>Teachers & Staff Management</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Directory of teaching faculty, subject assignments, and class in-charges
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} /> Add Faculty Member
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
              placeholder="Search by teacher name, subject, employee ID, or email..."
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
                fetchTeachers('');
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Teachers Data Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Faculty Name</th>
                <th>Employee ID</th>
                <th>Contact</th>
                <th>Subject</th>
                <th>Assigned Class</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && teachers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    Loading faculty directory...
                  </td>
                </tr>
              ) : teachers.length > 0 ? (
                teachers.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        User ID: {t.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td>
                      {t.employeeId ? (
                        <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {t.employeeId}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
                        <Mail size={13} color="var(--text-muted)" />
                        <span>{t.user?.email || 'No email'}</span>
                      </div>
                      {t.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          <Phone size={13} color="var(--text-muted)" />
                          <span>{t.phone}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                        <BookOpen size={12} /> {t.subject}
                      </span>
                    </td>
                    <td>
                      {t.classesManaged && t.classesManaged.length > 0 ? (
                        <span className="badge badge-role-teacher">
                          {t.classesManaged.map((c) => `${c.name} - ${c.section}`).join(', ')}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Teacher"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id, t.name)}
                          className="btn btn-danger btn-sm"
                          title="Delete Teacher"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No teachers found. Click "Add Faculty Member" to register one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {teachers.length > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <Pagination
              currentPage={currentPage}
              totalItems={teachers.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      <TeacherModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        teacherToEdit={editingTeacher}
      />
    </div>
  );
};
