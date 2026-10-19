import React, { useEffect, useState } from 'react';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import type { AttendanceStatus } from '@/shared/types';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Pagination } from '@/shared/ui/Pagination/Pagination';

export const StudentAttendancePage: React.FC = () => {
  const { studentData, isLoading, fetchStudentDashboard } = useDashboard();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchStudentDashboard();
  }, [fetchStudentDashboard]);

  if (isLoading && !studentData) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate)' }}>
        Loading your attendance log...
      </div>
    );
  }

  const logs = studentData?.recentLogs || [];
  const stats = studentData?.stats;
  const paginatedLogs = logs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return <span className="badge badge-present"><CheckCircle2 size={12} /> Present</span>;
      case 'ABSENT':
        return <span className="badge badge-absent"><XCircle size={12} /> Absent</span>;
      case 'LATE':
        return <span className="badge badge-late"><Clock size={12} /> Late</span>;
      case 'EXCUSED':
        return <span className="badge badge-excused">Excused</span>;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--charcoal)', margin: 0 }}>
            My Personal Attendance Record
          </h2>
          <p style={{ color: 'var(--slate)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
            Comprehensive historical ledger of your daily class attendance and participation
          </p>
        </div>

        <div className="badge badge-present" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', boxShadow: 'var(--neu-flat-sm)' }}>
          Overall Rate: <strong>{stats?.attendancePercentage ?? 100}%</strong>
        </div>
      </div>

      <div className="neu-card" style={{ padding: '1.5rem' }}>
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
                paginatedLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600 }}>
                        <Calendar size={13} color="var(--primary-laurel)" />
                        {new Date(log.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                    <td>{getStatusBadge(log.status)}</td>
                    <td style={{ color: 'var(--slate)' }}>{log.remarks || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate)' }}>
                    No personal attendance entries recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {logs.length > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <Pagination
              currentPage={currentPage}
              totalItems={logs.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
