import React, { useEffect, useState } from 'react';
import { useAttendance } from '@/features/attendance/hooks/useAttendance';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { classesApi } from '@/features/classes/api/classes.api';
import type { SchoolClass, AttendanceStatus } from '@/shared/types';
import { Download, Calendar, Filter } from 'lucide-react';
import { Pagination } from '@/shared/ui/Pagination/Pagination';

export const AttendanceHistoryPage: React.FC = () => {
  const { role, user } = useAuth();
  const { history, isLoading, fetchHistory, exportCsv } = useAttendance();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    classesApi.getAll().then((data) => {
      let filtered = data;
      if (role === 'TEACHER' && user?.profile?.teacherId) {
        filtered = data.filter((c) => c.classTeacherId === user.profile.teacherId);
      }
      setClasses(filtered);

      if (role === 'TEACHER' && filtered.length > 0) {
        setSelectedClass(filtered[0].id);
        fetchHistory({ classId: filtered[0].id });
      } else {
        fetchHistory();
      }
    });
  }, [role, user, fetchHistory]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchHistory({
      classId: selectedClass !== 'all' ? selectedClass : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleExport = () => {
    exportCsv({
      classId: selectedClass !== 'all' ? selectedClass : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return <span className="badge badge-present">Present</span>;
      case 'ABSENT':
        return <span className="badge badge-absent">Absent</span>;
      case 'LATE':
        return <span className="badge badge-late">Late</span>;
      case 'EXCUSED':
        return <span className="badge badge-excused">Excused</span>;
      default:
        return null;
    }
  };

  const paginatedHistory = history.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem' }}>Attendance Records & Reports</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Historical session logs, student participation, and downloadable attendance sheets
          </p>
        </div>

        <button onClick={handleExport} className="btn btn-secondary">
          <Download size={16} /> Export to CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <form onSubmit={handleFilter} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--primary-500)" />
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '180px' }}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {role === 'ADMIN' && <option value="all">All Classes & Sections</option>}
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.section}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>From:</span>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>To:</span>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-sm">
            Apply Filter
          </button>
        </form>
      </div>

      {/* Data Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Marked By</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && history.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    Loading attendance history...
                  </td>
                </tr>
              ) : history.length > 0 ? (
                paginatedHistory.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} color="var(--text-muted)" />
                        {r.date}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{r.rollNumber}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.studentName}</div>
                      {r.institutionalId && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.institutionalId}</div>
                      )}
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                        {r.className}
                      </span>
                    </td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.remarks || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{r.markedBy}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No attendance records match the selected date range and class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {history.length > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <Pagination
              currentPage={currentPage}
              totalItems={history.length}
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
