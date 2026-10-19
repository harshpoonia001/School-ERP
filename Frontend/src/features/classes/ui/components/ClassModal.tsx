import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal/Modal';
import type { SchoolClass, Teacher } from '@/shared/types';
import { teachersApi } from '@/features/teachers/api/teachers.api';
import { Layers, Building } from 'lucide-react';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<any>;
  classToEdit?: SchoolClass | null;
}

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  classToEdit,
}) => {
  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [roomNumber, setRoomNumber] = useState('Room 304');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [classTeacherId, setClassTeacherId] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      teachersApi.getAll().then(setTeachers).catch(console.error);

      if (classToEdit) {
        setName(classToEdit.name);
        setSection(classToEdit.section);
        setRoomNumber(classToEdit.roomNumber || 'Room 304');
        setAcademicYear(classToEdit.academicYear);
        setClassTeacherId(classToEdit.classTeacherId || '');
      } else {
        setName('');
        setSection('');
        setRoomNumber('Room 304');
        setAcademicYear('2025-2026');
        setClassTeacherId('');
      }
    }
  }, [isOpen, classToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        section,
        roomNumber: roomNumber.trim() || 'Room 304',
        academicYear,
        classTeacherId: classTeacherId || null,
      });
      onClose();
    } catch {
      // Handled in hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={classToEdit ? 'Edit Class Configuration' : 'Create New Class & Section'}
      subtitle="Define classroom parameters, room number, and homeroom in-charge"
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div
          className="neu-inset"
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Grade / Class Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Grade 10"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Section *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. A"
                value={section}
                onChange={(e) => setSection(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Room Number / Lab</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Room 304"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Academic Session</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="2025-2026"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Class In-Charge (Homeroom Advisor)</label>
            <select
              className="form-select"
              value={classTeacherId}
              onChange={(e) => setClassTeacherId(e.target.value)}
            >
              <option value="">Unassigned Faculty</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.subject}) {t.employeeId ? `[${t.employeeId}]` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving Configuration...' : classToEdit ? 'Save Changes' : 'Create Class'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
