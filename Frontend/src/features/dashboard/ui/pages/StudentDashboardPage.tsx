import React, { useEffect } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { KpiCard } from '../components/KpiCard';
import { CheckCircle2, XCircle, Clock, Award, Calendar } from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { studentData, isLoading, fetchStudentDashboard } = useDashboard();

  useEffect(() => {
    fetchStudentDashboard();
  }, []);

  if (isLoading && !studentData) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading student record...
      </div>
    );
  }

  const profile = studentData?.profile;
  const stats = studentData?.stats;
  const logs = studentData?.recentLogs || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Student Banner */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--emerald-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Student Portal
          </span>
          <h2 style={{ fontSize: '1.85rem', marginTop: '0.25rem' }}>{profile?.name}</h2>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <span>Class: <strong style={{ color: '#fff' }}>{profile?.className}</strong></span>
            <span>Roll No: <strong style={{ color: '#fff' }}>#{profile?.rollNumber}</strong></span>
            {profile?.institutionalId && (
              <span>Student ID: <strong style={{ color: '#fff' }}>{profile?.institutionalId}</strong></span>
            )}
            <span>Class Teacher: <strong style={{ color: '#fff' }}>{profile?.classTeacher}</strong></span>
          </div>
        </div>

        {/* Big percentage indicator */}
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '20px',
            padding: '1.25rem 2rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--emerald-500)', fontWeight: 600 }}>
            Attendance Rate
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#34d399', lineHeight: 1.1 }}>
            {stats?.attendancePercentage ?? 100}%
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <KpiCard
          title="Total Recorded Days"
          value={stats?.totalDays ?? 0}
          icon={<Calendar size={22} />}
          trendColor="var(--sky-500)"
        />
        <KpiCard
          title="Days Present"
          value={stats?.presentDays ?? 0}
          icon={<CheckCircle2 size={22} />}
          trendColor="var(--emerald-500)"
        />
        <KpiCard
          title="Days Absent"
          value={stats?.absentDays ?? 0}
          icon={<XCircle size={22} />}
          trendColor="var(--rose-500)"
        />
        <KpiCard
          title="Days Late"
          value={stats?.lateDays ?? 0}
          icon={<Clock size={22} />}
          trendColor="var(--amber-500)"
        />
      </div>

      {/* Recent Attendance Logs Table */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Recent Attendance History</h3>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => {
                  let badge = <span className="badge badge-present">Present</span>;
                  if (log.status === 'ABSENT') badge = <span className="badge badge-absent">Absent</span>;
                  if (log.status === 'LATE') badge = <span className="badge badge-late">Late</span>;
                  if (log.status === 'EXCUSED') badge = <span className="badge badge-excused">Excused</span>;

                  return (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 500 }}>{log.date}</td>
                      <td>{badge}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{log.remarks || '—'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No attendance logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
