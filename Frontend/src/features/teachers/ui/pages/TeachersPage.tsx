import React, { useEffect, useState } from 'react';
import { useTeachers } from '../../hooks/useTeachers';
import { TeacherModal } from '../components/TeacherModal';
import { Teacher } from '../../../../shared/types/index';
import { InitialsAvatar } from '@/shared/ui/Avatar/InitialsAvatar';
import { Plus, Search, Edit2, Trash2, Mail, Phone, BookOpen, UserCheck, Shield } from 'lucide-react';
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

  const paginatedTeachers = teachers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--charcoal)', margin: 0 }}>
            Faculty & Academic Staff
          </h2>
          <p style={{ color: 'var(--slate)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
            Teaching faculty directory, department specializations, and homeroom in-charge assignments
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} /> Add Faculty Member
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="neu-card" style={{ padding: '1.25rem 1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', maxWidth: '500px' }}>
          <div className="neu-inset-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', width: '100%' }}>
            <Search size={15} color="var(--slate-light)" />
            <input
              type="text"
              placeholder="Search by name, subject, employee ID, or email..."
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
                fetchTeachers('');
              }}
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Teachers Data Table */}
      <div className="neu-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Faculty</th>
                <th>Employee ID</th>
                <th>Department / Subject</th>
                <th>Assigned Class</th>
                <th>Contact</th>
                <th>Account Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && teachers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate)' }}>
                    Loading faculty directory...
                  </td>
                </tr>
              ) : paginatedTeachers.length > 0 ? (
                paginatedTeachers.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <InitialsAvatar name={t.name} size="sm" />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--charcoal)' }}>{t.name}</div>
                          {t.user?.email && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--slate)' }}>
                              {t.user.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {t.employeeId ? (
                        <span
                          className="neu-inset-sm"
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.45rem',
                            display: 'inline-block',
                          }}
                        >
                          {t.employeeId}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--slate-light)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: '#EAF2EC',
                          color: '#3E6B4C',
                          borderColor: '#D0E3D3',
                          fontWeight: 700,
                        }}
                      >
                        <BookOpen size={11} /> {t.subject}
                      </span>
                    </td>
                    <td>
                      {t.classesManaged && t.classesManaged.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {t.classesManaged.map((c) => (
                            <span key={c.id} className="badge badge-present">
                              {c.name} - {c.section}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--slate-light)', fontSize: '0.8125rem' }}>
                          No Class Assigned
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {t.phone ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--charcoal)' }}>
                            <Phone size={12} color="var(--primary-laurel)" /> {t.phone}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--slate-light)', fontSize: '0.75rem' }}>No phone listed</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {t.user?.isActive ? (
                        <span className="badge badge-present">
                          <UserCheck size={11} /> Active
                        </span>
                      ) : (
                        <span className="badge badge-absent">Suspended</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="neu-btn btn-sm"
                          style={{ padding: '0.35rem 0.55rem' }}
                          title="Edit Faculty Record"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id, t.name)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.35rem 0.55rem' }}
                          title="Delete Faculty Member"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate)' }}>
                    No faculty members found. Click "Add Faculty Member" to enroll teachers.
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
