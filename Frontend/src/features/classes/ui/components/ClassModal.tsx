import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal/Modal';
import type { SchoolClass, Teacher } from '@/shared/types';
import { teachersApi } from '@/features/teachers/api/teachers.api';

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
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [classTeacherId, setClassTeacherId] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      teachersApi.getAll().then(setTeachers).catch(console.error);

      if (classToEdit) {
        setName(classToEdit.name);
        setSection(classToEdit.section);
        setAcademicYear(classToEdit.academicYear);
        setClassTeacherId(classToEdit.classTeacherId || '');
      } else {
        setName('');
        setSection('');
        setAcademicYear('2026-2027');
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
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <div className="form-group">
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

          <div className="form-group">
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

        <div className="form-group">
          <label className="form-label">Academic Year</label>
          <input
            type="text"
            required
            className="form-input"
            placeholder="2026-2027"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Class In-Charge (Class Teacher)</label>
          <select
            className="form-select"
            value={classTeacherId}
            onChange={(e) => setClassTeacherId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.subject}) {t.employeeId ? `[${t.employeeId}]` : ''}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : classToEdit ? 'Save Changes' : 'Create Class'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
