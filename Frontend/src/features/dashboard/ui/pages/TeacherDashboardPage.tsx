import React, { useEffect } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../../auth/hooks/useAuth';
import { Link } from 'react-router-dom';
import { CalendarCheck, Users, Activity, CheckCircle2, AlertCircle } from 'lucide-react';

export const TeacherDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { teacherData, isLoading, fetchTeacherDashboard } = useDashboard();

  useEffect(() => {
    fetchTeacherDashboard();
  }, []);

  if (isLoading && !teacherData) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading faculty dashboard...
      </div>
    );
  }

  const managed = teacherData?.managedClasses || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem' }}>Welcome, {user?.profile?.name || 'Teacher'}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Subject: {user?.profile?.subject || 'Faculty'} &bull; Employee ID: {user?.profile?.employeeId || 'N/A'}
        </p>
      </div>

      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>My Assigned Classes</h3>

        {managed.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              You have not been assigned as class in-charge for any section yet.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Please contact the school administrator to link your profile to your homeroom class.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {managed.map((c) => (
              <div key={c.classId} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '1.35rem' }}>{c.className}</h4>
                  {c.isAttendanceMarkedToday ? (
                    <span className="badge badge-present">
                      <CheckCircle2 size={12} /> Today Marked
                    </span>
                  ) : (
                    <span className="badge badge-absent">
                      <AlertCircle size={12} /> Pending Submission
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(0, 0, 0, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Enrolled Students
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} color="var(--primary-500)" />
                      {c.totalStudents}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      30-Day Rate
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-500)' }}>
                      <Activity size={16} />
                      {c.monthlyAttendanceRate}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                  <Link
                    to="/teacher/attendance/mark"
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <CalendarCheck size={16} /> Mark Today's Attendance
                  </Link>
                  <Link
                    to="/teacher/attendance/history"
                    className="btn btn-secondary btn-sm"
                  >
                    View Log
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
