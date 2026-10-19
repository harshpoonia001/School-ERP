import React, { useEffect } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../../auth/hooks/useAuth';
import { Link } from 'react-router-dom';
import { InitialsAvatar } from '@/shared/ui/Avatar/InitialsAvatar';
import {
  CalendarCheck,
  Users,
  Activity,
  CheckCircle2,
  AlertCircle,
  Building,
  Radio,
  BookOpen,
} from 'lucide-react';

export const TeacherDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { teacherData, isLoading, fetchTeacherDashboard } = useDashboard();

  useEffect(() => {
    fetchTeacherDashboard();
  }, []);

  if (isLoading && !teacherData) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate)' }}>
        Loading faculty dashboard...
      </div>
    );
  }

  const managed = teacherData?.managedClasses || [];
  const isLaunched = teacherData?.isAttendanceDayLaunched;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      {/* Teacher Profile Card */}
      <div
        className="neu-card"
        style={{
          padding: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <InitialsAvatar name={user?.profile?.name || user?.email} size="lg" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span className="badge badge-role-teacher">
                <BookOpen size={12} /> Faculty Member
              </span>
              {user?.profile?.employeeId && (
                <span className="neu-inset-sm" style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', fontWeight: 600 }}>
                  Emp ID: {user.profile.employeeId}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--charcoal)', margin: 0 }}>
              Welcome, {user?.profile?.name || 'Teacher'}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate)', marginTop: '0.25rem' }}>
              Academic Department: <strong>{user?.profile?.subject || 'General Studies'}</strong>
            </div>
          </div>
        </div>

        {/* Live Roll Call Status Pill */}
        <div
          className="neu-inset"
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: isLaunched ? '#2F593E' : '#94621A',
            }}
          />
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--charcoal)' }}>
              {isLaunched ? 'Live Roll Call Active' : 'Roll Call Not Yet Launched'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--slate)' }}>
              {isLaunched ? 'Launched by Administration' : 'Waiting for Admin trigger'}
            </div>
          </div>
        </div>
      </div>

      {/* Managed Classes Grid */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '1rem' }}>
          My Assigned Classrooms & Homerooms
        </h3>

        {managed.length === 0 ? (
          <div className="neu-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--slate)', marginBottom: '0.5rem' }}>
              You have not been assigned as class in-charge for any section yet.
            </p>
            <p style={{ color: 'var(--slate-light)', fontSize: '0.8125rem' }}>
              Please contact the school administrator to link your profile to your homeroom class.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {managed.map((c) => (
              <div key={c.classId} className="neu-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--charcoal)', margin: 0 }}>
                      {c.className}
                    </h4>
                    {c.roomNumber && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--primary-laurel)', fontWeight: 600, marginTop: '0.2rem' }}>
                        <Building size={12} /> {c.roomNumber}
                      </div>
                    )}
                  </div>

                  {c.isAttendanceMarkedToday ? (
                    <span className="badge badge-present">
                      <CheckCircle2 size={12} /> Marked Today
                    </span>
                  ) : (
                    <span className="badge badge-absent">
                      <AlertCircle size={12} /> Pending Roll Call
                    </span>
                  )}
                </div>

                <div
                  className="neu-inset"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--slate)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Enrolled Students
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--charcoal)' }}>
                      <Users size={16} color="var(--primary-laurel)" />
                      {c.totalStudents}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--slate)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Monthly Attendance
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2F593E' }}>
                      <Activity size={16} />
                      {c.monthlyAttendanceRate}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                  <Link
                    to="/teacher/attendance/mark"
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, padding: '0.6rem' }}
                  >
                    <CalendarCheck size={15} /> Enter Roll Call
                  </Link>
                  <Link
                    to="/teacher/attendance/history"
                    className="neu-btn btn-sm"
                    style={{ padding: '0.6rem 1rem' }}
                  >
                    History
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
