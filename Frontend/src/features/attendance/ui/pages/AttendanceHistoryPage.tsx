import React, { useEffect, useState } from 'react';
import { useAttendance } from '@/features/attendance/hooks/useAttendance';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { classesApi } from '@/features/classes/api/classes.api';
import type { SchoolClass, AttendanceStatus } from '@/shared/types';
import { InitialsAvatar } from '@/shared/ui/Avatar/InitialsAvatar';
import { Download, Calendar, Filter, History } from 'lucide-react';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--charcoal)', margin: 0 }}>
            Attendance Records & Ledger
          </h2>
          <p style={{ color: 'var(--slate)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
            Historical session logs, student participation records, and exportable ledger sheets
          </p>
        </div>

        <button onClick={handleExport} className="neu-btn btn-sm" style={{ padding: '0.55rem 1rem' }}>
          <Download size={15} /> Export Ledger CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="neu-card" style={{ padding: '1.25rem 1.5rem' }}>
        <form onSubmit={handleFilter} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--primary-laurel)" />
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '190px' }}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {role === 'ADMIN' && <option value="all">All Classes & Sections</option>}
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.section} {c.roomNumber ? `(${c.roomNumber})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--slate)', fontWeight: 600 }}>From:</span>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--slate)', fontWeight: 600 }}>To:</span>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-sm">
            Apply Filters
          </button>
        </form>
      </div>

      {/* Data Table */}
      <div className="neu-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th style={{ width: '60px' }}>Roll</th>
                <th>Student</th>
                <th>Classroom</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && history.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate)' }}>
                    Loading attendance history...
                  </td>
                </tr>
              ) : history.length > 0 ? (
                paginatedHistory.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                        <Calendar size={13} color="var(--primary-laurel)" />
                        {new Date(r.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td>
                      <span
                        className="neu-inset-sm"
                        style={{
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          color: 'var(--primary-laurel-dark)',
                          padding: '0.15rem 0.45rem',
                          display: 'inline-block',
                        }}
                      >
                        #{r.rollNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <InitialsAvatar name={r.studentName} size="sm" />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--charcoal)' }}>{r.studentName}</div>
                          {r.institutionalId && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--slate)' }}>{r.institutionalId}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: '#EAF2EC',
                          color: '#3E6B4C',
                          borderColor: '#D0E3D3',
                        }}
                      >
                        {r.className}
                      </span>
                    </td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td style={{ color: 'var(--slate)' }}>{r.remarks || '—'}</td>
                    <td style={{ color: 'var(--slate)', fontSize: '0.8125rem' }}>{r.markedBy || 'Teacher'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate)' }}>
                    No attendance records match the selected date range and class filter.
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
