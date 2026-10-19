import React, { useEffect, useState } from 'react';
import { useClasses } from '../../hooks/useClasses';
import { ClassModal } from '../components/ClassModal';
import { SchoolClass } from '../../../../shared/types/index';
import { InitialsAvatar } from '@/shared/ui/Avatar/InitialsAvatar';
import { Plus, Layers, Users, UserCheck, Edit2, Trash2, Building } from 'lucide-react';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--charcoal)', margin: 0 }}>
            Classes & Academic Sections
          </h2>
          <p style={{ color: 'var(--slate)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
            Academic year configurations, room assignments, homeroom faculty, and enrolled student counts
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} /> Add Class / Section
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {isLoading && classes.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--slate)' }}>
            Loading classes...
          </div>
        ) : classes.length > 0 ? (
          paginatedClasses.map((c) => (
            <div key={c.id} className="neu-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    className="neu-inset-sm"
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-laurel)',
                    }}
                  >
                    <Layers size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--charcoal)', margin: 0 }}>
                      {c.name} - {c.section}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--slate)' }}>
                        {c.academicYear}
                      </span>
                      {c.roomNumber && (
                        <span
                          className="neu-inset-sm"
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: 'var(--primary-laurel)',
                            padding: '0.1rem 0.4rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <Building size={10} /> {c.roomNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="neu-btn btn-sm"
                    style={{ padding: '0.35rem 0.55rem' }}
                    title="Edit Class Configuration"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, `${c.name} - ${c.section}`)}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '0.35rem 0.55rem' }}
                    title="Delete Class"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Classroom Details Sunken Well */}
              <div
                className="neu-inset"
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--slate)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={14} color="var(--primary-laurel)" /> Enrolled Students
                  </span>
                  <span style={{ fontWeight: 800, color: 'var(--charcoal)' }}>
                    {c.studentCount ?? 0}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--slate)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <UserCheck size={14} color="var(--primary-laurel)" /> Homeroom Advisor
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {c.classTeacher ? (
                      <>
                        <InitialsAvatar name={c.classTeacher.name} size="sm" />
                        <span style={{ fontWeight: 700, color: 'var(--charcoal)' }}>
                          {c.classTeacher.name}
                        </span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--slate-light)', fontStyle: 'italic' }}>Unassigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--slate)' }}>
            No classes created yet. Click "Add Class / Section" to create your first classroom.
          </div>
        )}
      </div>

      {classes.length > 0 && (
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
