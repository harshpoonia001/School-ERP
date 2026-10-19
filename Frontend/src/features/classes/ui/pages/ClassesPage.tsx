import React, { useEffect, useState } from 'react';
import { useClasses } from '../../hooks/useClasses';
import { ClassModal } from '../components/ClassModal';
import { SchoolClass } from '../../../../shared/types/index';
import { Plus, Layers, Users, UserCheck, Edit2, Trash2 } from 'lucide-react';
import { Pagination } from '@/shared/ui/Pagination/Pagination';

export const ClassesPage: React.FC = () => {
  const { classes, isLoading, fetchClasses, addClass, updateClass, deleteClass } = useClasses();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleOpenAdd = () => {
    setEditingClass(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (c: SchoolClass) => {
    setEditingClass(c);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete class "${name}"? Only empty classes can be deleted.`)) {
      await deleteClass(id);
    }
  };

  const handleModalSubmit = async (formData: any) => {
    if (editingClass) {
      await updateClass(editingClass.id, formData);
    } else {
      await addClass(formData);
    }
  };

  const paginatedClasses = classes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem' }}>Classes & Sections</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Academic year configurations, homeroom allocations, and student rosters
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} /> Add Class / Section
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {isLoading && classes.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading classes...
          </div>
        ) : classes.length > 0 ? (
          paginatedClasses.map((c) => (
            <div key={c.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-500)',
                    }}
                  >
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem' }}>{c.name} - {c.section}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {c.academicYear}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="btn btn-secondary btn-sm"
                    title="Edit Class"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, `${c.name} - ${c.section}`)}
                    className="btn btn-danger btn-sm"
                    title="Delete Class"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <UserCheck size={14} /> Class In-Charge:
                  </span>
                  <span style={{ fontWeight: 600, color: c.classTeacher ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {c.classTeacher?.name || 'Unassigned'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={14} /> Enrolled Students:
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--emerald-500)' }}>
                    {c.studentCount ?? 0} students
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }} className="glass-panel">
            No classes defined yet. Click "Add Class / Section" to create your first class.
          </div>
        )}
      </div>

      {classes.length > 0 && (
        <div className="glass-panel" style={{ padding: '1rem 1.5rem' }}>
          <Pagination
            currentPage={currentPage}
            totalItems={classes.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      <ClassModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        classToEdit={editingClass}
      />
    </div>
  );
};
