import React, { useEffect } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { KpiCard } from '../components/KpiCard';
import { InitialsAvatar } from '@/shared/ui/Avatar/InitialsAvatar';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Building,
  UserCheck,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Phone,
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { studentData, isLoading, fetchStudentDashboard } = useDashboard();

  useEffect(() => {
    fetchStudentDashboard();
  }, []);

  if (isLoading && !studentData) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate)' }}>
        Loading student record...
      </div>
    );
  }

  const profile = studentData?.profile;
  const stats = studentData?.stats;
  const logs = studentData?.recentLogs || [];
  const timeline = studentData?.thirtyDaysTimeline || [];

  const exceptionCount = (stats?.absentDays || 0) + (stats?.lateDays || 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      {/* Profile Hero Card */}
      <div
        className="neu-card"
        style={{
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <InitialsAvatar name={profile?.name} size="xl" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
              <span
                className="badge badge-present"
                style={{ fontSize: '0.75rem', fontWeight: 700 }}
              >
                <GraduationCap size={13} /> Active Student
              </span>
              {profile?.roomNumber && (
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
                  <Building size={12} /> {profile.roomNumber}
                </span>
              )}
            </div>

            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--charcoal)', margin: 0 }}>
              {profile?.name}
            </h2>

            <div
              style={{
                display: 'flex',
                gap: '1.25rem',
                marginTop: '0.5rem',
                flexWrap: 'wrap',
                color: 'var(--slate)',
                fontSize: '0.85rem',
              }}
            >
              <span>
                Class: <strong style={{ color: 'var(--charcoal)' }}>{profile?.className}</strong>
              </span>
              <span>
                Roll No: <strong style={{ color: 'var(--charcoal)' }}>#{profile?.rollNumber}</strong>
              </span>
              {profile?.institutionalId && (
                <span>
                  ID: <strong style={{ color: 'var(--charcoal)' }}>{profile?.institutionalId}</strong>
                </span>
              )}
              {profile?.classTeacher && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <UserCheck size={14} color="var(--primary-laurel)" />
                  Advisor: <strong style={{ color: 'var(--charcoal)' }}>{profile?.classTeacher}</strong>
                  {profile?.advisorSubject ? ` (${profile.advisorSubject})` : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tactile Circular / Pill Rate Meter */}
        <div
          className="neu-inset"
          style={{
            padding: '1.25rem 2rem',
            textAlign: 'center',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--surface-inset)',
            minWidth: '170px',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              color: 'var(--primary-laurel-dark)',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            Cumulative Rate
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-laurel-dark)', lineHeight: 1.1, marginTop: '0.2rem' }}>
            {stats?.attendancePercentage ?? 100}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--slate)', marginTop: '0.2rem' }}>
            Good Standing
          </div>
        </div>
      </div>

      {/* 4 Precision Metric KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
        <KpiCard
          title="Overall Attendance Rate"
          value={`${stats?.attendancePercentage ?? 100}%`}
          subtitle="Target threshold: ≥ 85%"
          icon={<Sparkles size={20} />}
          trendColor="var(--primary-laurel)"
        />
        <KpiCard
          title="Curriculum Days"
          value={stats?.totalDays ?? 0}
          subtitle="Total recorded sessions"
          icon={<Calendar size={20} />}
          trendColor="var(--slate)"
        />
        <KpiCard
          title="Verified Present"
          value={stats?.presentDays ?? 0}
          subtitle="Full day attendances"
          icon={<CheckCircle2 size={20} />}
          trendColor="#2F593E"
        />
        <KpiCard
          title="Attendance Exceptions"
          value={exceptionCount}
          subtitle={`${stats?.absentDays ?? 0} Absences, ${stats?.lateDays ?? 0} Lates`}
          icon={<AlertTriangle size={20} />}
          trendColor={exceptionCount > 0 ? '#BA1A1A' : 'var(--primary-laurel)'}
        />
      </div>

      {/* Rolling 30-Day Chrono-Strip Heatmap Ribbon */}
      <div className="neu-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--charcoal)' }}>
              Rolling 30-Day Chrono-Strip Heatmap
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate)', margin: '0.2rem 0 0' }}>
              Daily compliance tracking over the past 30 school days
            </p>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#2F593E' }} /> Present
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#94621A' }} /> Late
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#BA1A1A' }} /> Absent
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#385579' }} /> Excused
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#EDEBE4', border: '1px solid #DDD8CE' }} /> Off/Unrecorded
            </span>
          </div>
        </div>

        {/* Heatmap Row */}
        <div
          className="neu-inset"
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            overflowX: 'auto',
          }}
        >
          {timeline.length > 0 ? (
            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', minWidth: '600px' }}>
              {timeline.map((item, idx) => {
                const dateObj = new Date(item.date);
                const dayNum = dateObj.getDate();
                const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' });
                const statusClass = item.status.toLowerCase();

                let label = 'P';
                if (item.status === 'LATE') label = 'L';
                if (item.status === 'ABSENT') label = 'A';
                if (item.status === 'EXCUSED') label = 'E';
                if (item.status === 'UNRECORDED') label = '·';

                return (
                  <div
                    key={item.date || idx}
                    className={`chrono-cell ${statusClass}`}
                    style={{
                      flex: 1,
                      minWidth: '28px',
                      height: '42px',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      gap: '0.15rem',
                    }}
                    title={`${item.date}: ${item.status}${item.remarks ? ` - "${item.remarks}"` : ''}`}
                  >
                    <span style={{ fontSize: '0.62rem', opacity: 0.8 }}>{dayNum}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>{label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--slate)', fontSize: '0.85rem' }}>
              No timeline sessions recorded in the last 30 days.
            </div>
          )}
        </div>
      </div>

      {/* Recent Attendance Logs Table */}
      <div className="neu-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--charcoal)' }}>
          Session Attendance Register Log
        </h3>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Remarks / Observations</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => {
                  let badgeClass = 'badge-present';
                  if (log.status === 'ABSENT') badgeClass = 'badge-absent';
                  if (log.status === 'LATE') badgeClass = 'badge-late';
                  if (log.status === 'EXCUSED') badgeClass = 'badge-excused';

                  return (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 600 }}>
                        {new Date(log.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td>
                        <span className={`badge ${badgeClass}`}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--slate)' }}>
                        {log.remarks || '—'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate)' }}>
                    No recent attendance logs recorded yet.
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
