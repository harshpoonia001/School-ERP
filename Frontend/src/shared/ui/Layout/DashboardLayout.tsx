import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ChangePasswordModal } from '@/features/auth/ui/components/ChangePasswordModal';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers,
  CalendarCheck,
  History,
  LogOut,
  Menu,
  X,
  Shield,
  BookOpen,
  UserCheck,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, role, mustChangePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-role-admin"><Shield size={12} /> Admin</span>;
      case 'TEACHER':
        return <span className="badge badge-role-teacher"><BookOpen size={12} /> Teacher</span>;
      case 'STUDENT':
        return <span className="badge badge-role-student"><GraduationCap size={12} /> Student</span>;
      default:
        return null;
    }
  };

  const navItemStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: isActive ? '#ffffff' : 'var(--text-secondary)',
    background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(79, 70, 229, 0.15))' : 'transparent',
    border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
    transition: 'all var(--transition-fast)',
    textDecoration: 'none',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          transform: mobileMenuOpen ? 'translateX(0)' : undefined,
          transition: 'transform var(--transition-normal)',
        }}
        className="sidebar-responsive"
      >
        {/* Brand */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px var(--primary-glow)',
              }}
            >
              <GraduationCap size={20} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                School<span style={{ color: 'var(--primary-500)' }}>Flow</span>
              </span>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Mini ERP System
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'none',
            }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Identity Pill */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.profile?.name || user?.email}
            </span>
            {getRoleBadge()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {user?.email}
          </span>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1, overflowY: 'auto' }}>
          {role === 'ADMIN' && (
            <>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.5rem 0.75rem 0.25rem', letterSpacing: '0.05em' }}>
                Overview
              </div>
              <NavLink to="/admin" end style={navItemStyle}>
                <LayoutDashboard size={18} /> Dashboard
              </NavLink>

              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.75rem 0.75rem 0.25rem', letterSpacing: '0.05em' }}>
                Management
              </div>
              <NavLink to="/admin/teachers" style={navItemStyle}>
                <Users size={18} /> Teachers & Staff
              </NavLink>
              <NavLink to="/admin/classes" style={navItemStyle}>
                <Layers size={18} /> Classes & Sections
              </NavLink>
              <NavLink to="/admin/students" style={navItemStyle}>
                <GraduationCap size={18} /> Students
              </NavLink>

              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.75rem 0.75rem 0.25rem', letterSpacing: '0.05em' }}>
                Attendance
              </div>
              <NavLink to="/admin/attendance" style={navItemStyle}>
                <History size={18} /> Attendance Records
              </NavLink>
            </>
          )}

          {role === 'TEACHER' && (
            <>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.5rem 0.75rem 0.25rem', letterSpacing: '0.05em' }}>
                Teacher Portal
              </div>
              <NavLink to="/teacher" end style={navItemStyle}>
                <LayoutDashboard size={18} /> My Dashboard
              </NavLink>
              <NavLink to="/teacher/attendance/mark" style={navItemStyle}>
                <CalendarCheck size={18} /> Mark Attendance
              </NavLink>
              <NavLink to="/teacher/attendance/history" style={navItemStyle}>
                <History size={18} /> Class Attendance Log
              </NavLink>
              <NavLink to="/teacher/students" style={navItemStyle}>
                <UserCheck size={18} /> Student Roster
              </NavLink>
            </>
          )}

          {role === 'STUDENT' && (
            <>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.5rem 0.75rem 0.25rem', letterSpacing: '0.05em' }}>
                Student Portal
              </div>
              <NavLink to="/student" end style={navItemStyle}>
                <LayoutDashboard size={18} /> My Dashboard
              </NavLink>
              <NavLink to="/student/attendance" style={navItemStyle}>
                <CalendarCheck size={18} /> My Attendance
              </NavLink>
            </>
          )}
        </nav>

        {/* Footer / Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            height: '64px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(9, 13, 22, 0.75)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
              className="mobile-hamburger-btn"
            >
              <Menu size={22} />
            </button>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setPasswordModalOpen(true)}
              className="btn btn-secondary btn-sm"
              title="Change Account Password"
            >
              <KeyRound size={14} /> Change Password
            </button>
          </div>
        </header>

        {/* Initial Password Warning Notification Banner */}
        {mustChangePassword && (
          <div
            style={{
              margin: '1.5rem 2rem 0',
              padding: '1rem 1.25rem',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={20} color="var(--amber-500)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: '#fef3c7', fontSize: '0.875rem' }}>
                  Default Initial Password in Use
                </div>
                <div style={{ color: '#d1d5db', fontSize: '0.8125rem' }}>
                  You are currently using the default initial password assigned by the administration. Please update your password to secure your account.
                </div>
              </div>
            </div>
            <button
              onClick={() => setPasswordModalOpen(true)}
              className="btn btn-sm"
              style={{
                background: 'rgba(245, 158, 11, 0.25)',
                border: '1px solid var(--amber-500)',
                color: '#fef08a',
                fontWeight: 600,
              }}
            >
              <KeyRound size={14} /> Update Password Now
            </button>
          </div>
        )}

        {/* Change Password Dialog Modal */}
        <ChangePasswordModal
          isOpen={passwordModalOpen}
          onClose={() => setPasswordModalOpen(false)}
        />

        {/* Nested Route View */}
        <main style={{ padding: '2rem', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
