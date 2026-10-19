import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal/Modal';
import type { Student, SchoolClass } from '@/shared/types';
import { classesApi } from '@/features/classes/api/classes.api';
import {
  ShieldCheck,
  ShieldAlert,
  Ban,
  CheckCircle2,
  Lock,
  KeyRound,
  Mail,
  UserCheck,
  Eye,
  EyeOff,
  Dices,
  Info,
  Calendar,
  Phone,
  User,
} from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);

  // Edit Mode Portal Access State
  const [hasAccount, setHasAccount] = useState(false);
  const [grantPortal, setGrantPortal] = useState(false);
  const [portalEmail, setPortalEmail] = useState('');
  const [portalPassword, setPortalPassword] = useState('');
  const [showPortalPassword, setShowPortalPassword] = useState(false);
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
        setPassword('SF-' + Math.floor(1000 + Math.random() * 9000) + '!');
        setHasAccount(false);
        setGrantPortal(false);
        setPortalEmail('');
        setPortalPassword('');
        setPortalActive(true);
      }
    }
  }, [isOpen, studentToEdit, defaultClassId]);

  // Auto-suggest student email when name changes
  const handleNameBlur = () => {
    if (!studentToEdit && name.trim() && !email) {
      const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '.');
      setEmail(`${cleanName}@schoolflow.edu`);
    }
  };

  const generateRandomPassword = (isEdit: boolean) => {
    const randomCode = 'SF-' + Math.floor(1000 + Math.random() * 9000) + '!';
    if (isEdit) {
      setPortalPassword(randomCode);
    } else {
      setPassword(randomCode);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        name,
        rollNumber,
        studentId: studentId.trim() || null,
        classId,
        guardianName,
        guardianPhone,
        guardianEmail: guardianEmail.trim() || null,
        dateOfBirth: dateOfBirth || null,
      };

      if (!studentToEdit) {
        if (createAccount) {
          payload.user = {
            email,
            password,
            isActive: true,
          };
          payload.portalActive = true;
        }
      } else {
        if (!hasAccount && grantPortal) {
          payload.portalEmail = portalEmail;
          payload.portalPassword = portalPassword || 'SF-9000!';
          payload.portalActive = true;
          payload.portalAction = 'grant';
          payload.user = {
            email: portalEmail,
            password: portalPassword || 'SF-9000!',
            isActive: true,
          };
        } else if (hasAccount) {
          payload.portalEmail = portalEmail;
          payload.portalActive = portalActive;
          payload.portalAction = portalActive ? 'update' : 'suspend';
          if (portalPassword.trim()) {
            payload.portalPassword = portalPassword.trim();
          }
          payload.user = {
            email: portalEmail,
            isActive: portalActive,
            ...(portalPassword.trim() ? { password: portalPassword.trim() } : {}),
          };
        }
      }

      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? 'Edit Student Profile' : 'Enroll New Student'}
      subtitle={
        studentToEdit
          ? `Roll #${studentToEdit.rollNumber} • ${studentToEdit.name}`
          : 'Complete academic profile & digital portal credentials'
      }
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* SECTION A: Core Profile (Sunken Well) */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <User size={16} color="var(--primary-laurel)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--charcoal)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Academic & Personal Details
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Full Student Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Amara Okafor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Assigned Classroom *</label>
              <select
                className="form-select"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                required
              >
                <option value="">Select Class & Section</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.section} {c.roomNumber ? `(${c.roomNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Roll Number *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 101"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Institutional Student ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. S-2025-084"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-input"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
          </div>

          {/* Guardian Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(217, 211, 199, 0.6)' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Guardian Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Chinedu Okafor"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Guardian Phone *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. +1 555-0144"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Guardian Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="parent@example.com"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECTION B: Portal Account Management */}
        <div
          className="neu-card-sm"
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            border: '1px solid var(--sand-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--primary-laurel)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--charcoal)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Digital Student Portal Access
              </span>
            </div>

            {!studentToEdit && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={createAccount}
                  onChange={(e) => setCreateAccount(e.target.checked)}
                  style={{ accentColor: 'var(--primary-laurel)', width: '16px', height: '16px' }}
                />
                Provision Student Login
              </label>
            )}
          </div>

          {/* Creation Mode Portal Account Fields */}
          {!studentToEdit && createAccount && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Login Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="student@schoolflow.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={createAccount}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label className="form-label">Initial Password *</label>
                    <button
                      type="button"
                      onClick={() => generateRandomPassword(false)}
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
                      <Dices size={12} /> Random SF-XXXX!
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={createAccount}
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
                  The student will be prompted to change their temporary password upon their first portal login.
                </span>
              </div>
            </div>
          )}

          {/* Edit Mode Portal Account Fields */}
          {studentToEdit && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {hasAccount ? (
                <div
                  className="neu-card"
                  style={{
                    padding: '1.25rem',
                    background: portalActive ? 'var(--surface)' : 'rgba(186, 26, 26, 0.05)',
                    border: portalActive ? '1px solid var(--sand-border)' : '1.5px solid rgba(186, 26, 26, 0.35)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        className="neu-circle-inset"
                        style={{
                          color: portalActive ? 'var(--primary-laurel)' : 'var(--rose-500)',
                        }}
                      >
                        {portalActive ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--charcoal)' }}>
                            Portal Security & Access Status
                          </span>
                          <span className={`badge ${portalActive ? 'badge-present' : 'badge-absent'}`}>
                            {portalActive ? (
                              <>
                                <UserCheck size={12} /> Active Access
                              </>
                            ) : (
                              <>
                                <Ban size={12} /> Suspended
                              </>
                            )}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate)', marginTop: '0.15rem' }}>
                          Account: <strong style={{ color: 'var(--charcoal)' }}>{portalEmail || studentToEdit.user?.email}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPortalActive(!portalActive)}
                      className="neu-btn btn-sm"
                      style={{
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: portalActive ? '#BA1A1A' : 'var(--primary-laurel-dark)',
                        borderColor: portalActive ? 'rgba(186, 26, 26, 0.3)' : 'var(--primary-laurel)',
                        background: portalActive ? '#FFF8F8' : '#F0F7F2',
                      }}
                    >
                      {portalActive ? (
                        <>
                          <Ban size={14} color="#BA1A1A" /> Suspend Student Access
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} color="var(--primary-laurel)" /> Reactivate Access
                        </>
                      )}
                    </button>
                  </div>

                  {!portalActive ? (
                    <div
                      className="neu-inset-sm"
                      style={{
                        marginTop: '0.85rem',
                        padding: '0.65rem 0.85rem',
                        background: '#FFF5F5',
                        border: '1px solid rgba(186, 26, 26, 0.25)',
                        color: '#BA1A1A',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Lock size={14} color="#BA1A1A" style={{ flexShrink: 0 }} />
                      <span>
                        <strong>Security Hold Active:</strong> The student is currently barred from signing into their student portal account. Roll call records and academic files remain intact.
                      </span>
                    </div>
                  ) : (
                    <div
                      className="neu-inset-sm"
                      style={{
                        marginTop: '0.85rem',
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
                        Student has authenticated portal credentials. You may update their email or issue a password reset below.
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Portal Email</label>
                      <input
                        type="email"
                        className="form-input"
                        value={portalEmail}
                        onChange={(e) => setPortalEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label className="form-label">Reset Password (Optional)</label>
                        <button
                          type="button"
                          onClick={() => generateRandomPassword(true)}
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
                          type={showPortalPassword ? 'text' : 'password'}
                          className="form-input"
                          placeholder="Leave blank to keep unchanged"
                          value={portalPassword}
                          onChange={(e) => setPortalPassword(e.target.value)}
                          style={{ paddingRight: '2.5rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPortalPassword(!showPortalPassword)}
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
                          {showPortalPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--slate)' }}>
                      Student currently has no login credentials.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setGrantPortal(!grantPortal);
                        if (!portalEmail) {
                          const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '.');
                          setPortalEmail(`${cleanName}@schoolflow.edu`);
                        }
                        if (!portalPassword) {
                          setPortalPassword('SF-' + Math.floor(1000 + Math.random() * 9000) + '!');
                        }
                      }}
                      className="btn btn-sm btn-primary"
                    >
                      {grantPortal ? 'Cancel Provisioning' : '+ Provision Portal Access'}
                    </button>
                  </div>

                  {grantPortal && (
                    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Portal Email *</label>
                        <input
                          type="email"
                          className="form-input"
                          value={portalEmail}
                          onChange={(e) => setPortalEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <label className="form-label">Initial Password *</label>
                          <button
                            type="button"
                            onClick={() => generateRandomPassword(true)}
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
                            type={showPortalPassword ? 'text' : 'password'}
                            className="form-input"
                            value={portalPassword}
                            onChange={(e) => setPortalPassword(e.target.value)}
                            required
                            style={{ paddingRight: '2.5rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPortalPassword(!showPortalPassword)}
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
                            {showPortalPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving Student Record...' : studentToEdit ? 'Save Changes' : 'Confirm Enrollment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
