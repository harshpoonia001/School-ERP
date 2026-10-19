import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal/Modal';
import type { Student, SchoolClass } from '@/shared/types';
import { classesApi } from '@/features/classes/api/classes.api';
import { ShieldCheck, ShieldAlert, KeyRound, Mail, UserCheck, AlertCircle } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<any>;
  studentToEdit?: Student | null;
  defaultClassId?: string;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  studentToEdit,
  defaultClassId,
}) => {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [studentId, setStudentId] = useState(''); // Institutional ID
  const [classId, setClassId] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Portal Account State
  const [createAccount, setCreateAccount] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('student123');

  // Edit Mode Portal Access State
  const [hasAccount, setHasAccount] = useState(false);
  const [grantPortal, setGrantPortal] = useState(false);
  const [portalEmail, setPortalEmail] = useState('');
  const [portalPassword, setPortalPassword] = useState('');
  const [portalActive, setPortalActive] = useState(true);
  const [revokePortal, setRevokePortal] = useState(false);

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      classesApi.getAll().then(setClasses).catch(console.error);

      if (studentToEdit) {
        setName(studentToEdit.name);
        setRollNumber(studentToEdit.rollNumber);
        setStudentId(studentToEdit.studentId || '');
        setClassId(studentToEdit.classId);
        setGuardianName(studentToEdit.guardianName);
        setGuardianPhone(studentToEdit.guardianPhone);
        setGuardianEmail(studentToEdit.guardianEmail || '');
        setDateOfBirth(
          studentToEdit.dateOfBirth ? studentToEdit.dateOfBirth.split('T')[0] : ''
        );

        const accountExists = !!studentToEdit.user;
        setHasAccount(accountExists);
        setGrantPortal(false);
        setRevokePortal(false);
        setPortalPassword('');
        if (accountExists && studentToEdit.user) {
          setPortalEmail(studentToEdit.user.email);
          setPortalActive(studentToEdit.user.isActive ?? true);
        } else {
          setPortalEmail(studentToEdit.guardianEmail || '');
          setPortalActive(true);
        }
      } else {
        setName('');
        setRollNumber('');
        setStudentId('');
        setClassId(defaultClassId && defaultClassId !== 'all' ? defaultClassId : '');
        setGuardianName('');
        setGuardianPhone('');
        setGuardianEmail('');
        setDateOfBirth('');
        setCreateAccount(true);
        setEmail('');
        setPassword('student123');
        setHasAccount(false);
        setGrantPortal(false);
        setRevokePortal(false);
        setPortalEmail('');
        setPortalPassword('');
        setPortalActive(true);
      }
    }
  }, [isOpen, studentToEdit, defaultClassId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        name,
        rollNumber,
        classId,
        studentId: studentId.trim() !== '' ? studentId.trim() : null,
        guardianName,
        guardianPhone,
        guardianEmail: guardianEmail.trim() !== '' ? guardianEmail.trim() : null,
        dateOfBirth: dateOfBirth || null,
      };

      if (!studentToEdit) {
        if (createAccount && email) {
          payload.email = email.trim();
          payload.password = password;
        }
      } else {
        // Edit mode portal handling
        if (revokePortal) {
          payload.portalAction = 'revoke';
        } else if (!hasAccount && grantPortal) {
          payload.portalAction = 'grant';
          payload.portalEmail = portalEmail.trim();
          payload.portalPassword = portalPassword.trim() || 'student123';
        } else if (hasAccount) {
          payload.portalAction = 'update';
          if (portalEmail.trim()) payload.portalEmail = portalEmail.trim();
          if (portalPassword.trim()) payload.portalPassword = portalPassword.trim();
          payload.portalActive = portalActive;
        }
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
      title={studentToEdit ? 'Edit Student Details & Portal Access' : 'Enroll New Student'}
      maxWidth="640px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Student Full Name *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Roll Number *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. 101"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Class & Section *</label>
            <select
              required
              className="form-select"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">Select Enrolled Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.section}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Institutional Student ID (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. STU-2026-001"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Guardian / Parent Name *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Robert Johnson"
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Guardian Phone *</label>
            <input
              type="tel"
              required
              className="form-input"
              placeholder="+1 555-0101"
              value={guardianPhone}
              onChange={(e) => setGuardianPhone(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Guardian Email (Optional)</label>
            <input
              type="email"
              className="form-input"
              placeholder="guardian@example.com"
              value={guardianEmail}
              onChange={(e) => setGuardianEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-input"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
        </div>

        {/* Create Mode: Account Creation */}
        {!studentToEdit && (
          <div style={{ marginTop: '0.75rem', padding: '1rem 1.25rem', background: 'rgba(0, 0, 0, 0.25)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={createAccount}
                onChange={(e) => setCreateAccount(e.target.checked)}
              />
              Create Student Login Account (Enables Self-Service Portal)
            </label>

            {createAccount && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.875rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Login Email *</label>
                  <input
                    type="email"
                    required={createAccount}
                    className="form-input"
                    placeholder="student@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Initial Password</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="student123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Mode: Portal Access Management */}
        {studentToEdit && (
          <div style={{ marginTop: '0.75rem', padding: '1.25rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {hasAccount ? <ShieldCheck size={18} color="var(--emerald-500)" /> : <ShieldAlert size={18} color="var(--amber-500)" />}
                <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                  Student Portal Access: {hasAccount ? (portalActive ? 'Active' : 'Suspended') : 'Not Granted'}
                </span>
              </div>
              {hasAccount && (
                <span className={portalActive ? 'badge badge-present' : 'badge badge-absent'}>
                  {portalActive ? 'Login Enabled' : 'Disabled'}
                </span>
              )}
            </div>

            {/* Case 1: Student has no account yet -> Option to grant */}
            {!hasAccount && (
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-500)' }}>
                  <input
                    type="checkbox"
                    checked={grantPortal}
                    onChange={(e) => setGrantPortal(e.target.checked)}
                  />
                  Grant Portal Login Account to this Student
                </label>

                {grantPortal && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Student Login Email *</label>
                      <input
                        type="email"
                        required={grantPortal}
                        className="form-input"
                        placeholder="student@school.com"
                        value={portalEmail}
                        onChange={(e) => setPortalEmail(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Initial Password</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="student123"
                        value={portalPassword}
                        onChange={(e) => setPortalPassword(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Case 2: Student already has account -> Option to update, reset password, toggle, or revoke */}
            {hasAccount && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Portal Login Email</label>
                    <input
                      type="email"
                      required={hasAccount && !revokePortal}
                      disabled={revokePortal}
                      className="form-input"
                      value={portalEmail}
                      onChange={(e) => setPortalEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Reset Password (Optional)</label>
                    <input
                      type="text"
                      disabled={revokePortal}
                      className="form-input"
                      placeholder="Leave blank to keep current"
                      value={portalPassword}
                      onChange={(e) => setPortalPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      disabled={revokePortal}
                      checked={portalActive}
                      onChange={(e) => setPortalActive(e.target.checked)}
                    />
                    <span>Account Active (Allow logging in)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--rose-500)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={revokePortal}
                      onChange={(e) => setRevokePortal(e.target.checked)}
                    />
                    <span>Revoke & Delete Portal Account</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : studentToEdit ? 'Save Changes' : 'Enroll Student'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
