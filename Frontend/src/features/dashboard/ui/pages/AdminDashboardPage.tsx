import React, { useEffect } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { KpiCard } from '../components/KpiCard';
import { Users, GraduationCap, Layers, Activity, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const { adminData, isLoading, fetchAdminDashboard } = useDashboard();

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  if (isLoading && !adminData) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading administrative metrics...
      </div>
    );
  }

  const metrics = adminData?.metrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title & Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem' }}>School Executive Overview</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Real-time analytics and attendance tracking across all academic branches
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/students" className="btn btn-secondary btn-sm">
            + Manage Students
          </Link>
          <Link to="/admin/attendance" className="btn btn-primary btn-sm">
            View All Attendance
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <KpiCard
          title="Total Students"
          value={metrics?.totalStudents ?? 0}
          subtitle="Enrolled across all classes"
          icon={<GraduationCap size={24} />}
          trendColor="var(--emerald-500)"
        />
        <KpiCard
          title="Teaching Staff"
          value={metrics?.totalTeachers ?? 0}
          subtitle="Active faculty members"
          icon={<Users size={24} />}
          trendColor="var(--primary-500)"
        />
        <KpiCard
          title="Classes & Sections"
          value={metrics?.totalClasses ?? 0}
          subtitle="Academic year 2026-2027"
          icon={<Layers size={24} />}
          trendColor="var(--sky-500)"
        />
        <KpiCard
          title="Today's Attendance Rate"
          value={metrics?.todayAttendanceRate ?? '0%'}
          subtitle={`${metrics?.presentToday ?? 0} of ${metrics?.totalMarkedToday ?? 0} students present`}
          icon={<Activity size={24} />}
          trendColor="var(--amber-500)"
        />
      </div>

      {/* Class Attendance Breakdown Table */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Today's Class Attendance Status</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
              Submission status for each classroom for today's session
            </p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Class & Section</th>
                <th>Class In-Charge</th>
                <th>Enrolled</th>
                <th>Marked</th>
                <th>Present</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {adminData?.classSummaries && adminData.classSummaries.length > 0 ? (
                adminData.classSummaries.map((c) => {
                  const isMarked = c.status === 'Marked';
                  const isPartial = c.status === 'Partially Marked';

                  return (
                    <tr key={c.classId}>
                      <td style={{ fontWeight: 600 }}>{c.className}</td>
                      <td>{c.teacherName}</td>
                      <td>{c.totalEnrolled} students</td>
                      <td>{c.markedCount}</td>
                      <td>
                        <span style={{ color: 'var(--emerald-500)', fontWeight: 600 }}>
                          {c.presentCount}
                        </span>
                      </td>
                      <td>
                        {isMarked ? (
                          <span className="badge badge-present">
                            <CheckCircle2 size={12} /> Marked
                          </span>
                        ) : isPartial ? (
                          <span className="badge badge-late">
                            <Clock size={12} /> Incomplete
                          </span>
                        ) : (
                          <span className="badge badge-absent">
                            <AlertCircle size={12} /> Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No classes registered yet.
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
