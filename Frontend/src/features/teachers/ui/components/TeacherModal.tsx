import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal/Modal';
import type { Teacher, SchoolClass } from '@/shared/types';
import { classesApi } from '@/features/classes/api/classes.api';
import { Eye, EyeOff, Dices, BookOpen, ShieldCheck, Info } from 'lucide-react';

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
  const [password, setPassword] = useState('SF-1001!');
  const [showPassword, setShowPassword] = useState(false);
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
        setPassword('SF-' + Math.floor(1000 + Math.random() * 9000) + '!');
        setPhone('');
        setSubject('');
        setEmployeeId('');
        setClassId('');
      }
    }
  }, [isOpen, teacherToEdit]);

  const handleNameBlur = () => {
    if (!teacherToEdit && name.trim() && !email) {
      const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '.');
      setEmail(`${clean}@schoolflow.edu`);
    }
  };

  const generatePassword = () => {
    setPassword('SF-' + Math.floor(1000 + Math.random() * 9000) + '!');
  };

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
      title={teacherToEdit ? 'Edit Faculty Record' : 'Add New Faculty Member'}
      subtitle="Configure academic staff details, department, homeroom, and system credentials"
      maxWidth="620px"
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
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Full Faculty Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Employee ID (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. EMP-042"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Teaching Department / Subject *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Phone Contact</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+1 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Assigned Homeroom Class In-Charge</label>
            <select
              className="form-select"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">None (Subject Faculty only)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.section} {c.roomNumber ? `(${c.roomNumber})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!teacherToEdit && (
          <div
            className="neu-card-sm"
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              border: '1px solid var(--sand-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--primary-laurel)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--charcoal)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Portal Account Credentials
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Login Email *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="teacher@schoolflow.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="form-label">Initial Password *</label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-laurel)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Dices size={12} /> Random
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--slate)',
                      cursor: 'pointer',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div
              className="neu-inset-sm"
              style={{
                padding: '0.5rem 0.75rem',
                fontSize: '0.75rem',
                color: 'var(--slate)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Info size={14} color="var(--primary-laurel)" style={{ flexShrink: 0 }} />
              <span>
                Faculty will receive a prompt on their dashboard to customize this temporary initial password.
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving Faculty...' : teacherToEdit ? 'Save Changes' : 'Confirm Faculty Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
