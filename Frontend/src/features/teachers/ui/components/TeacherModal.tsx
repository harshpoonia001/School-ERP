import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal/Modal';
import type { Teacher, SchoolClass } from '@/shared/types';
import { classesApi } from '@/features/classes/api/classes.api';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<any>;
  teacherToEdit?: Teacher | null;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  teacherToEdit,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('teacher123');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [classId, setClassId] = useState('');
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      classesApi.getAll().then(setClasses).catch(console.error);

      if (teacherToEdit) {
        setName(teacherToEdit.name);
        setEmail(teacherToEdit.user?.email || '');
        setPhone(teacherToEdit.phone || '');
        setSubject(teacherToEdit.subject);
        setEmployeeId(teacherToEdit.employeeId || '');
        setClassId(teacherToEdit.classesManaged?.[0]?.id || '');
      } else {
        setName('');
        setEmail('');
        setPassword('teacher123');
        setPhone('');
        setSubject('');
        setEmployeeId('');
        setClassId('');
      }
    }
  }, [isOpen, teacherToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        name,
        phone: phone || null,
        subject,
        employeeId: employeeId || null,
        classId: classId || null,
      };

      if (!teacherToEdit) {
        payload.email = email;
        payload.password = password;
      }

      await onSubmit(payload);
      onClose();
    } catch {
      // error handled in hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={teacherToEdit ? 'Edit Teacher Information' : 'Add New Faculty / Teacher'}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            required
            className="form-input"
            placeholder="e.g. Sarah Jenkins"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {!teacherToEdit && (
          <>
            <div className="form-group">
              <label className="form-label">Login Email *</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="teacher@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Initial Password</label>
              <input
                type="text"
                className="form-input"
                placeholder="teacher123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Teaching Subject *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Mathematics"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Employee ID (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. EMP-001"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="+1 555-0199"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Class In-Charge</label>
            <select
              className="form-select"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">None (Subject Teacher only)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.section}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : teacherToEdit ? 'Save Changes' : 'Create Teacher'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
