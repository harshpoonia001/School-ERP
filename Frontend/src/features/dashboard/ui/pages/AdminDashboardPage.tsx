import React, { useEffect, useState } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { KpiCard } from '../components/KpiCard';
import { attendanceApi } from '@/features/attendance/api/attendance.api';
import { useToast } from '@/shared/ui/Toast/ToastContext';
import {
  Users,
  GraduationCap,
  Layers,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  Rocket,
  Flame,
  Radio,
  History,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const { adminData, isLoading, fetchAdminDashboard } = useDashboard();
  const [isLaunching, setIsLaunching] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  const handleLaunchDay = async () => {
    setIsLaunching(true);
    try {
      const res = await attendanceApi.launchDay();
      toast.success(res.message || "Today's attendance session launched successfully!");
      await fetchAdminDashboard();
    } catch (err: any) {
      toast.error(err.message || 'Failed to launch attendance session');
    } finally {
      setIsLaunching(false);
    }
  };

  if (isLoading && !adminData) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate)' }}>
        Loading administrative metrics...
      </div>
    );
  }

  const metrics = adminData?.metrics;
  const isLaunched = adminData?.isAttendanceDayLaunched;
  const getTodayDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const activeDate = adminData?.activeAttendanceDate || getTodayDateStr();
  const rankedAbsences = adminData?.rankedAbsenceHighlights || [];
  const recentSubmissions = adminData?.recentSubmissions || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      {/* Title & Top Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--charcoal)', margin: 0 }}>
            Executive Operations Command
          </h2>
          <p style={{ color: 'var(--slate)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
            Live school-wide attendance intelligence and classroom roll call control
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <Link to="/admin/students" className="neu-btn btn-sm">
            + Student Directory
          </Link>
          <Link to="/admin/attendance" className="btn btn-primary btn-sm">
            <History size={14} /> Full Records
          </Link>
        </div>
      </div>

      {/* Live Roll Call Launch Card */}
      <div
        className="neu-card"
        style={{
          padding: '1.25rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: isLaunched ? 'linear-gradient(135deg, #F6F4EF 0%, #EAF2EC 100%)' : '#F6F4EF',
          borderLeft: isLaunched ? '5px solid var(--primary-laurel)' : '5px solid #94621A',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            className="neu-circle-inset-lg"
            style={{
              color: isLaunched ? 'var(--primary-laurel)' : '#94621A',
            }}
          >
            {isLaunched ? <Radio size={24} className="animate-pulse" /> : <Rocket size={24} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--charcoal)', margin: 0 }}>
                {isLaunched ? "Today's Live Roll Call is Active" : 'Morning Roll Call Not Yet Launched'}
              </h3>
              <span className={`badge ${isLaunched ? 'badge-present' : 'badge-late'}`}>
                {activeDate}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate)', margin: '0.2rem 0 0' }}>
              {isLaunched
                ? 'Teachers across all classrooms have active roll call workspaces open for submissions.'
                : "Initiate today's formal attendance session to signal all homeroom teachers to begin roll call."}
            </p>
          </div>
        </div>

        <button
          onClick={handleLaunchDay}
          disabled={isLaunching || isLaunched}
          className={isLaunched ? 'btn btn-success' : 'btn btn-primary'}
          style={{ padding: '0.65rem 1.35rem', fontWeight: 700 }}
        >
          {isLaunching ? (
            'Launching Session...'
          ) : isLaunched ? (
            <>
              <CheckCircle2 size={16} /> Session Launched for Today
            </>
          ) : (
            <>
              <Rocket size={16} /> Launch Today's Attendance (Live Roll Call)
            </>
          )}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <KpiCard
          title="Total Students"
          value={metrics?.totalStudents ?? 0}
          subtitle="Enrolled in active cohorts"
          icon={<GraduationCap size={22} />}
          trendColor="var(--primary-laurel)"
        />
        <KpiCard
          title="Faculty Members"
          value={metrics?.totalTeachers ?? 0}
          subtitle="Assigned teaching staff"
          icon={<Users size={22} />}
          trendColor="var(--secondary-sage)"
        />
        <KpiCard
          title="Classrooms"
          value={metrics?.totalClasses ?? 0}
          subtitle="Academic year 2025–26"
          icon={<Layers size={22} />}
          trendColor="var(--slate)"
        />
        <KpiCard
          title="Today's Attendance Rate"
          value={metrics?.todayAttendanceRate ?? '0%'}
          subtitle={`${metrics?.presentToday ?? 0} of ${metrics?.totalMarkedToday ?? 0} marked present`}
          icon={<Activity size={22} />}
          trendColor="#2F593E"
        />
      </div>

      {/* 2-Column Section: Class Attendance Breakdown + Ranked Absence Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Class Attendance Table */}
        <div className="neu-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--charcoal)' }}>
                Classroom Attendance Status
              </h3>
              <p style={{ color: 'var(--slate)', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>
                Today's submission progress across all grades & sections
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Classroom</th>
                  <th>In-Charge</th>
                  <th>Enrolled</th>
                  <th>Present</th>
                  <th>Absent / Late</th>
                  <th>Attendance Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {adminData?.classSummaries && adminData.classSummaries.length > 0 ? (
                  adminData.classSummaries.map((c) => {
                    const isMarked = c.status === 'Marked';
                    const isPartial = c.status === 'Partially Marked';
                    const pct = c.totalEnrolled > 0 ? Math.round((c.presentCount / c.totalEnrolled) * 100) : 0;

                    return (
                      <tr key={c.classId}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--charcoal)' }}>{c.className}</div>
                          {c.roomNumber && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--slate)' }}>
                              {c.roomNumber}
                            </div>
                          )}
                        </td>
                        <td>{c.teacherName}</td>
                        <td>{c.totalEnrolled} students</td>
                        <td>
                          <span style={{ color: '#2F593E', fontWeight: 700 }}>
                            {c.presentCount}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}>
                            <span style={{ color: c.absentCount > 0 ? 'var(--rose-500)' : 'var(--slate)', fontWeight: c.absentCount > 0 ? 700 : 500 }}>
                              {c.absentCount} abs
                            </span>
                            {c.lateCount > 0 && (
                              <span style={{ color: '#94621A', fontWeight: 600 }}>
                                • {c.lateCount} late
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div
                              className="neu-inset-sm"
                              style={{
                                width: '70px',
                                height: '6px',
                                borderRadius: '3px',
                                overflow: 'hidden',
                                background: '#EDEBE4',
                              }}
                            >
                              <div
                                style={{
                                  width: `${pct}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #4A7C59, #2F593E)',
                                  borderRadius: '3px',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{pct}%</span>
                          </div>
                        </td>
                        <td>
                          {isMarked ? (
                            <span className="badge badge-present">
                              <CheckCircle2 size={12} /> Marked
                            </span>
                          ) : isPartial ? (
                            <span className="badge badge-late">
                              <Clock size={12} /> Partial
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
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--slate)', padding: '2rem' }}>
                      No classrooms registered in the system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ranked Absence Highlights Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="neu-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <Flame size={18} color="#BA1A1A" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--charcoal)' }}>
                Ranked Absence Watchlist
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--slate)', margin: '0 0 1rem' }}>
              Classrooms ranked by highest absent count today
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {rankedAbsences.length > 0 ? (
                rankedAbsences.map((item, idx) => (
                  <div
                    key={item.classId}
                    className="neu-inset-sm"
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--slate)' }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--charcoal)' }}>
                          {item.className}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate)', marginTop: '0.1rem' }}>
                        {item.roomNumber || 'Room 304'} • {item.totalEnrolled} enrolled
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {item.absentCount > 0 ? (
                        <span className="badge badge-absent" style={{ fontWeight: 800 }}>
                          {item.absentCount} Absent
                        </span>
                      ) : item.lateCount > 0 ? (
                        <span className="badge badge-late" style={{ fontWeight: 800 }}>
                          {item.lateCount} Late
                        </span>
                      ) : (
                        <span className="badge badge-present" style={{ fontWeight: 800 }}>
                          0 Absent
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--slate)', fontSize: '0.8rem' }}>
                  No absences recorded for today's session.
                </div>
              )}
            </div>
          </div>

          {/* Recent Submissions Feed */}
          <div className="neu-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <Radio size={16} color="var(--primary-laurel)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--charcoal)' }}>
                Recent Roll Call Submissions
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {recentSubmissions.length > 0 ? (
                recentSubmissions.map((sub, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.5rem 0',
                      borderBottom: i < recentSubmissions.length - 1 ? '1px solid var(--sand-border)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--charcoal)' }}>
                        {sub.className}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate)' }}>
                        By {sub.teacherName} • {sub.time}
                      </div>
                    </div>
                    <span className="badge badge-present" style={{ fontSize: '0.72rem' }}>
                      {sub.presentCount}/{sub.totalCount} Present
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--slate)', fontSize: '0.8rem' }}>
                  No roll calls submitted yet today.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
