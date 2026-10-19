import React, { useEffect, useState } from 'react';
import { useAttendance } from '@/features/attendance/hooks/useAttendance';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { classesApi } from '@/features/classes/api/classes.api';
import type { SchoolClass, AttendanceStatus } from '@/shared/types';
import { Calendar, CheckCircle2, Save, Users, Sparkles } from 'lucide-react';

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

  // Load available classes
  useEffect(() => {
    classesApi.getAll().then((data) => {
      // If Teacher role, filter or prioritize their assigned classes
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

  // Fetch roster whenever classId or date changes
  useEffect(() => {
    if (selectedClassId) {
      fetchClassRoster(selectedClassId, selectedDate);
    }
  }, [selectedClassId, selectedDate, fetchClassRoster]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitAttendance();
  };

  const getStatusButton = (studentId: string, currentStatus: AttendanceStatus | null, targetStatus: AttendanceStatus) => {
    const isSelected = currentStatus === targetStatus;

    let baseBg = 'rgba(255, 255, 255, 0.04)';
    let activeBg = 'var(--emerald-500)';
    let color = 'var(--text-secondary)';

    if (targetStatus === 'PRESENT') {
      activeBg = 'linear-gradient(135deg, #10b981, #059669)';
      if (isSelected) color = '#ffffff';
    } else if (targetStatus === 'ABSENT') {
      activeBg = 'linear-gradient(135deg, #f43f5e, #e11d48)';
      if (isSelected) color = '#ffffff';
    } else if (targetStatus === 'LATE') {
      activeBg = 'linear-gradient(135deg, #f59e0b, #d97706)';
      if (isSelected) color = '#ffffff';
    } else if (targetStatus === 'EXCUSED') {
      activeBg = 'linear-gradient(135deg, #0ea5e9, #0284c7)';
      if (isSelected) color = '#ffffff';
    }

    return (
      <button
        type="button"
        onClick={() => updateStudentStatus(studentId, targetStatus)}
        style={{
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          fontWeight: 600,
          border: isSelected ? '1px solid transparent' : '1px solid var(--border-subtle)',
          background: isSelected ? activeBg : baseBg,
          color,
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
      >
        {targetStatus}
      </button>
    );
  };

  const presentCount = roster.filter((r) => r.status === 'PRESENT').length;
  const absentCount = roster.filter((r) => r.status === 'ABSENT').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem' }}>Daily Attendance Entry</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Record classroom presence, absentees, and late arrivals for the current session
          </p>
        </div>

        {isFullyMarked && (
          <div className="badge badge-present" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
            <CheckCircle2 size={16} /> Attendance Saved for this Session
          </div>
        )}
      </div>

      {/* Control Filters Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.75rem', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          {/* Class Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Classroom:
            </label>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '180px' }}
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {classes.length === 0 ? (
                <option value="">No classrooms available</option>
              ) : (
                classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.section}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Date Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} color="var(--primary-500)" />
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {/* 1-Click Convenience Button */}
        {roster.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => markAllStatus('PRESENT')}
              title="Set all students to Present"
            >
              <Sparkles size={14} color="var(--emerald-500)" /> Mark All Present
            </button>
          </div>
        )}
      </div>

      {/* Roster & Attendance Grid */}
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Class Student Roster</h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Total: {roster.length} | Present: <strong style={{ color: 'var(--emerald-500)' }}>{presentCount}</strong> | Absent: <strong style={{ color: 'var(--rose-500)' }}>{absentCount}</strong>
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || roster.length === 0}
          >
            <Save size={16} /> {isSubmitting ? 'Saving...' : 'Save & Submit Attendance'}
          </button>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Roll</th>
                <th>Student Name</th>
                <th>ID</th>
                <th style={{ minWidth: '240px' }}>Attendance Status</th>
                <th style={{ minWidth: '180px' }}>Notes / Remarks</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && roster.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    Loading student roster...
                  </td>
                </tr>
              ) : roster.length > 0 ? (
                roster.map((s) => (
                  <tr key={s.studentId}>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary-500)' }}>
                        #{s.rollNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {s.institutionalId || '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {getStatusButton(s.studentId, s.status, 'PRESENT')}
                        {getStatusButton(s.studentId, s.status, 'ABSENT')}
                        {getStatusButton(s.studentId, s.status, 'LATE')}
                        {getStatusButton(s.studentId, s.status, 'EXCUSED')}
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
                        placeholder="Optional remarks (e.g. sick leave)..."
                        value={s.remarks}
                        onChange={(e) => updateStudentRemarks(s.studentId, e.target.value)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Users size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                    <p>No students enrolled in this classroom yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
};
