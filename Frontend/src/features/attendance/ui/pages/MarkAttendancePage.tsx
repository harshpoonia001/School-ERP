import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAttendance } from '@/features/attendance/hooks/useAttendance';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { classesApi } from '@/features/classes/api/classes.api';
import { attendanceApi } from '@/features/attendance/api/attendance.api';
import { InitialsAvatar } from '@/shared/ui/Avatar/InitialsAvatar';
import type { SchoolClass, AttendanceStatus } from '@/shared/types';
import {
  Calendar,
  CheckCircle2,
  Save,
  Users,
  Sparkles,
  Search,
  AlertCircle,
  Keyboard,
  Building,
  RotateCcw,
  UserX,
} from 'lucide-react';

export const MarkAttendancePage: React.FC = () => {
  const { user, role } = useAuth();
  const {
    roster,
    selectedDate,
    selectedClassId,
    isFullyMarked,
    isLoading,
    isSubmitting,
    setSelectedDate,
    setSelectedClassId,
    updateStudentStatus,
    updateStudentRemarks,
    markAllStatus,
    fetchClassRoster,
    submitAttendance,
  } = useAttendance();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRowIndex, setActiveRowIndex] = useState<number>(0);
  const [dayStatus, setDayStatus] = useState<{ isLaunched: boolean; openedAt?: string; openedBy?: string } | null>(null);

  // Load available classes
  useEffect(() => {
    classesApi.getAll().then((data) => {
      let filtered = data;
      if (role === 'TEACHER' && user?.profile?.teacherId) {
        filtered = data.filter((c) => c.classTeacherId === user.profile.teacherId);
      }
      setClasses(filtered);

      if (filtered.length > 0 && !selectedClassId) {
        setSelectedClassId(filtered[0].id);
      }
    });
  }, [role, user, selectedClassId, setSelectedClassId]);

  // Check Attendance Day launch status
  useEffect(() => {
    attendanceApi.getDayStatus(selectedDate).then((res) => {
      setDayStatus({
        isLaunched: res.isLaunched,
        openedAt: res.openedAt,
        openedBy: res.openedBy,
      });
    }).catch(() => {
      setDayStatus({ isLaunched: false });
    });
  }, [selectedDate]);

  // Fetch roster when class or date changes
  useEffect(() => {
    if (selectedClassId) {
      fetchClassRoster(selectedClassId, selectedDate);
    }
  }, [selectedClassId, selectedDate, fetchClassRoster]);

  // Filter roster by search
  const filteredRoster = roster.filter((s) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(query) ||
      s.rollNumber.toLowerCase().includes(query) ||
      (s.institutionalId && s.institutionalId.toLowerCase().includes(query))
    );
  });

  // Keyboard navigation & hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is typing in an input or textarea, don't hijack P/L/A/E
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select';

      // Global submit shortcut: Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!isSubmitting && roster.length > 0) {
          submitAttendance();
        }
        return;
      }

      if (isInput) return;

      if (filteredRoster.length === 0) return;

      const currentStudent = filteredRoster[activeRowIndex];

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveRowIndex((prev) => Math.min(prev + 1, filteredRoster.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveRowIndex((prev) => Math.max(prev - 1, 0));
      } else if (currentStudent) {
        const key = e.key.toUpperCase();
        if (key === 'P') {
          e.preventDefault();
          updateStudentStatus(currentStudent.studentId, 'PRESENT');
          setActiveRowIndex((prev) => Math.min(prev + 1, filteredRoster.length - 1));
        } else if (key === 'L') {
          e.preventDefault();
          updateStudentStatus(currentStudent.studentId, 'LATE');
          setActiveRowIndex((prev) => Math.min(prev + 1, filteredRoster.length - 1));
        } else if (key === 'A') {
          e.preventDefault();
          updateStudentStatus(currentStudent.studentId, 'ABSENT');
          setActiveRowIndex((prev) => Math.min(prev + 1, filteredRoster.length - 1));
        } else if (key === 'E') {
          e.preventDefault();
          updateStudentStatus(currentStudent.studentId, 'EXCUSED');
          setActiveRowIndex((prev) => Math.min(prev + 1, filteredRoster.length - 1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredRoster, activeRowIndex, isSubmitting, roster.length, submitAttendance, updateStudentStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitAttendance();
  };

  const presentCount = roster.filter((r) => r.status === 'PRESENT').length;
  const lateCount = roster.filter((r) => r.status === 'LATE').length;
  const absentCount = roster.filter((r) => r.status === 'ABSENT').length;
  const excusedCount = roster.filter((r) => r.status === 'EXCUSED').length;
  const unmarkedCount = roster.filter((r) => !r.status).length;
  const totalStudents = roster.length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / (totalStudents - excusedCount || 1)) * 100) : 0;

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>
      {/* Header & Launch Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--charcoal)', margin: 0 }}>
              Roll Call Workspace
            </h2>
            {selectedClass?.roomNumber && (
              <span
                className="neu-inset-sm"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--primary-laurel)',
                  padding: '0.2rem 0.6rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Building size={12} /> {selectedClass.roomNumber}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--slate)', fontSize: '0.85rem', margin: 0 }}>
            Standard Tactile Roll Call Register • Keyboard hotkeys enabled
          </p>
        </div>

        {/* Live Roll Call Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {dayStatus?.isLaunched ? (
            <div
              className="badge badge-present"
              style={{
                padding: '0.45rem 0.9rem',
                fontSize: '0.8125rem',
                boxShadow: 'var(--neu-flat-sm)',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2F593E', display: 'inline-block' }} />
              Live Roll Call Active
            </div>
          ) : (
            <div
              className="badge"
              style={{
                background: '#FDF3E3',
                color: '#94621A',
                borderColor: '#F7DCAD',
                padding: '0.45rem 0.9rem',
                fontSize: '0.8125rem',
              }}
            >
              <AlertCircle size={14} /> Waiting for Admin Launch
            </div>
          )}

          {isFullyMarked && (
            <div className="badge badge-present" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8125rem' }}>
              <CheckCircle2 size={15} /> Submitted for this Session
            </div>
          )}
        </div>
      </div>

      {/* Control Filters & Batch Ribbon */}
      <div className="neu-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Class Select & Date Picker */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--slate)', fontWeight: 600 }}>
                Classroom:
              </label>
              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '190px' }}
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                {classes.length === 0 ? (
                  <option value="">No classrooms assigned</option>
                ) : (
                  classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.section} {c.roomNumber ? `(${c.roomNumber})` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} color="var(--primary-laurel)" />
              <input
                type="date"
                className="form-input"
                style={{ width: 'auto' }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {/* Search Input in Debossed Inset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '240px' }}>
            <div
              className="neu-inset-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.75rem',
                width: '100%',
              }}
            >
              <Search size={15} color="var(--slate-light)" />
              <input
                type="text"
                placeholder="Filter by student or roll #..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveRowIndex(0);
                }}
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
          </div>
        </div>

        {/* Batch Operations Ribbon & Keyboard Shortcut Legend */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--sand-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Batch:
            </span>
            <button
              type="button"
              className="btn btn-sm btn-success"
              onClick={() => markAllStatus('PRESENT')}
              title="Set all students to Present"
            >
              <Sparkles size={13} /> Mark All Present
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={() => markAllStatus('ABSENT')}
              title="Set all students to Absent"
            >
              <UserX size={13} /> Mark All Absent
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => markAllStatus(null)}
              title="Clear all selections"
            >
              <RotateCcw size={13} /> Clear All
            </button>
          </div>

          {/* Keyboard shortcut hints */}
          <div
            className="neu-inset-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.3rem 0.65rem',
              fontSize: '0.72rem',
              color: 'var(--slate)',
            }}
          >
            <Keyboard size={13} color="var(--primary-laurel)" />
            <span>
              <strong>Hotkeys:</strong> <kbd style={{ padding: '0.1rem 0.3rem', background: '#EDEBE4', borderRadius: '3px' }}>P</kbd> Present{' '}
              <kbd style={{ padding: '0.1rem 0.3rem', background: '#EDEBE4', borderRadius: '3px' }}>L</kbd> Late{' '}
              <kbd style={{ padding: '0.1rem 0.3rem', background: '#EDEBE4', borderRadius: '3px' }}>A</kbd> Absent{' '}
              <kbd style={{ padding: '0.1rem 0.3rem', background: '#EDEBE4', borderRadius: '3px' }}>E</kbd> Excused{' '}
              <kbd style={{ padding: '0.1rem 0.3rem', background: '#EDEBE4', borderRadius: '3px' }}>Ctrl+S</kbd> Save
            </span>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <form onSubmit={handleSubmit} className="neu-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Class Attendance Register</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate)' }}>
              ({filteredRoster.length} of {roster.length} students)
            </span>
          </div>

          {/* Unmarked Indicator */}
          {unmarkedCount > 0 ? (
            <div
              className="badge"
              style={{
                background: '#FDF3E3',
                color: '#94621A',
                borderColor: '#F7DCAD',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              ⚠️ {unmarkedCount} Unmarked
            </div>
          ) : roster.length > 0 ? (
            <div
              className="badge badge-present"
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              ✓ All {roster.length} Accounted For
            </div>
          ) : null}
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Roll</th>
                <th>Student</th>
                <th>Institutional ID</th>
                <th style={{ minWidth: '220px' }}>Attendance Status</th>
                <th style={{ minWidth: '180px' }}>Teacher Remarks</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && roster.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate)' }}>
                    Loading student roster...
                  </td>
                </tr>
              ) : filteredRoster.length > 0 ? (
                filteredRoster.map((s, index) => {
                  const isRowFocused = index === activeRowIndex;
                  return (
                    <tr
                      key={s.studentId}
                      onClick={() => setActiveRowIndex(index)}
                      style={{
                        backgroundColor: isRowFocused ? 'rgba(74, 124, 89, 0.06)' : undefined,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td>
                        <span
                          className="neu-inset-sm"
                          style={{
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            color: 'var(--primary-laurel-dark)',
                            padding: '0.2rem 0.5rem',
                            display: 'inline-block',
                          }}
                        >
                          #{s.rollNumber}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <InitialsAvatar name={s.name} size="sm" />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--charcoal)' }}>{s.name}</div>
                            {isRowFocused && (
                              <div style={{ fontSize: '0.68rem', color: 'var(--primary-laurel)', fontWeight: 600 }}>
                                Active Row [P/L/A/E]
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--slate)' }}>
                          {s.institutionalId || '—'}
                        </span>
                      </td>
                      <td>
                        {/* 4-Pill Status Group */}
                        <div className="status-pill-group">
                          <button
                            type="button"
                            className={`status-pill-btn ${s.status === 'PRESENT' ? 'active-present' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStudentStatus(s.studentId, 'PRESENT');
                              setActiveRowIndex(index);
                            }}
                            title="Mark Present (P)"
                          >
                            P
                          </button>
                          <button
                            type="button"
                            className={`status-pill-btn ${s.status === 'LATE' ? 'active-late' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStudentStatus(s.studentId, 'LATE');
                              setActiveRowIndex(index);
                            }}
                            title="Mark Late (L)"
                          >
                            L
                          </button>
                          <button
                            type="button"
                            className={`status-pill-btn ${s.status === 'ABSENT' ? 'active-absent' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStudentStatus(s.studentId, 'ABSENT');
                              setActiveRowIndex(index);
                            }}
                            title="Mark Absent (A)"
                          >
                            A
                          </button>
                          <button
                            type="button"
                            className={`status-pill-btn ${s.status === 'EXCUSED' ? 'active-excused' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStudentStatus(s.studentId, 'EXCUSED');
                              setActiveRowIndex(index);
                            }}
                            title="Mark Excused (E)"
                          >
                            E
                          </button>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          style={{
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.8125rem',
                            backgroundColor: 'var(--surface-soft-inset)',
                          }}
                          placeholder="Note (e.g. medical, field trip)..."
                          value={s.remarks || ''}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateStudentRemarks(s.studentId, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate)' }}>
                    <Users size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                    <p>No matching students found in this classroom.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </form>

      {/* Sticky Bottom Calculation Dock */}
      {roster.length > 0 && (
        <div
          className="neu-card animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '1.25rem',
            left: 'calc(260px + 2rem)',
            right: '2rem',
            padding: '0.85rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            zIndex: 40,
            background: 'rgba(246, 244, 239, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--sand-border)',
            boxShadow: '0 8px 24px rgba(188, 182, 168, 0.45), -4px -4px 16px rgba(255, 255, 255, 0.95)',
          }}
        >
          {/* Live Metrics Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--charcoal)' }}>
              Session Count:
            </span>
            <span className="badge badge-present" style={{ fontSize: '0.8rem' }}>
              Present: <strong>{presentCount}</strong>
            </span>
            <span className="badge badge-late" style={{ fontSize: '0.8rem' }}>
              Late: <strong>{lateCount}</strong>
            </span>
            <span className="badge badge-absent" style={{ fontSize: '0.8rem' }}>
              Absent: <strong>{absentCount}</strong>
            </span>
            <span className="badge badge-excused" style={{ fontSize: '0.8rem' }}>
              Excused: <strong>{excusedCount}</strong>
            </span>

            {/* Attendance Progress Meter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
              <div
                className="neu-inset-sm"
                style={{
                  width: '90px',
                  height: '8px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  background: '#EDEBE4',
                }}
              >
                <div
                  style={{
                    width: `${attendanceRate}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #4A7C59, #2F593E)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary-laurel-dark)' }}>
                {attendanceRate}%
              </span>
            </div>
          </div>

          {/* Submit Action Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={submitAttendance}
              className="btn btn-primary"
              disabled={isSubmitting || roster.length === 0}
              style={{
                padding: '0.65rem 1.4rem',
                fontSize: '0.875rem',
                fontWeight: 700,
              }}
            >
              <Save size={16} /> {isSubmitting ? 'Submitting Roll Call...' : 'Save & Submit Roll Call'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
