import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ChangePasswordModal } from '@/features/auth/ui/components/ChangePasswordModal';
import { InitialsAvatar } from '@/shared/ui/Avatar/InitialsAvatar';
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
  Building2,
  Calendar,
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
    fontWeight: isActive ? 700 : 500,
    color: isActive ? 'var(--primary-laurel-dark)' : 'var(--slate)',
    background: isActive ? 'var(--surface-inset)' : 'transparent',
    boxShadow: isActive ? 'var(--neu-inset-sm)' : 'none',
    borderLeft: isActive ? '3px solid var(--primary-laurel)' : '3px solid transparent',
    transition: 'all var(--transition-fast)',
    textDecoration: 'none',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--canvas)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          background: 'var(--surface)',
          borderRight: '1px solid var(--sand-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          boxShadow: '4px 0 16px rgba(188, 182, 168, 0.15)',
          transform: mobileMenuOpen ? 'translateX(0)' : undefined,
          transition: 'transform var(--transition-normal)',
        }}
        className="sidebar-responsive"
      >
        {/* Brand */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--sand-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary-laurel), var(--primary-laurel-dark))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '2px 2px 8px rgba(74, 124, 89, 0.35)',
              }}
            >
              <GraduationCap size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--charcoal)', letterSpacing: '-0.02em' }}>
                School<span style={{ color: 'var(--primary-laurel)' }}>Flow</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--slate-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Neumorphic ERP
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="neu-btn btn-sm"
            style={{ display: 'none', padding: '0.25rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* User Identity Pill (Sunken tactile well) */}
        <div style={{ padding: '1rem 1.25rem' }}>
          <div
            className="neu-inset-sm"
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <InitialsAvatar name={user?.profile?.name || user?.email} size="md" />
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--charcoal)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={user?.profile?.name || user?.email}
                >
                  {user?.profile?.name || user?.email}
                </span>
              </div>
              <div style={{ marginTop: '0.25rem' }}>
                {getRoleBadge()}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, overflowY: 'auto' }}>
          {role === 'ADMIN' && (
            <>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--slate-light)', textTransform: 'uppercase', padding: '0.5rem 0.75rem 0.2rem', letterSpacing: '0.06em' }}>
                Overview
              </div>
              <NavLink to="/admin" end style={navItemStyle}>
                <LayoutDashboard size={18} /> Admin Dashboard
              </NavLink>

              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--slate-light)', textTransform: 'uppercase', padding: '0.75rem 0.75rem 0.2rem', letterSpacing: '0.06em' }}>
                Academic Management
              </div>
              <NavLink to="/admin/teachers" style={navItemStyle}>
                <Users size={18} /> Teachers & Staff
              </NavLink>
              <NavLink to="/admin/classes" style={navItemStyle}>
                <Layers size={18} /> Classes & Sections
              </NavLink>
              <NavLink to="/admin/students" style={navItemStyle}>
                <GraduationCap size={18} /> Student Directory
              </NavLink>

              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--slate-light)', textTransform: 'uppercase', padding: '0.75rem 0.75rem 0.2rem', letterSpacing: '0.06em' }}>
                Attendance Intelligence
              </div>
              <NavLink to="/admin/attendance" style={navItemStyle}>
                <History size={18} /> Attendance Records
              </NavLink>
            </>
          )}

          {role === 'TEACHER' && (
            <>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--slate-light)', textTransform: 'uppercase', padding: '0.5rem 0.75rem 0.2rem', letterSpacing: '0.06em' }}>
                Teacher Desk
              </div>
              <NavLink to="/teacher" end style={navItemStyle}>
                <LayoutDashboard size={18} /> Teacher Dashboard
              </NavLink>
              <NavLink to="/teacher/attendance/mark" style={navItemStyle}>
                <CalendarCheck size={18} /> Roll Call Workspace
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
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--slate-light)', textTransform: 'uppercase', padding: '0.5rem 0.75rem 0.2rem', letterSpacing: '0.06em' }}>
                Student Desk
              </div>
              <NavLink to="/student" end style={navItemStyle}>
                <LayoutDashboard size={18} /> My Portal
              </NavLink>
              <NavLink to="/student/attendance" style={navItemStyle}>
                <CalendarCheck size={18} /> Attendance Heatmap
              </NavLink>
            </>
          )}
        </nav>

        {/* Institution Info & Sign Out */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--sand-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div
            className="neu-inset-sm"
            style={{
              padding: '0.6rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.72rem',
              color: 'var(--slate)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Building2 size={16} color="var(--primary-laurel)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--charcoal)' }}>Saint Jude Academy</div>
              <div>Academic Session 2025–26</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="neu-btn"
            style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--rose-500)', borderColor: '#F7C0BD' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Sticky Top Header */}
        <header
          style={{
            height: '64px',
            borderBottom: '1px solid var(--sand-border)',
            background: 'rgba(246, 244, 239, 0.90)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
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
              className="neu-btn btn-sm"
              style={{ display: 'none' }}
            >
              <Menu size={20} />
            </button>
            <div
              className="neu-inset-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--slate)',
              }}
            >
              <Calendar size={14} color="var(--primary-laurel)" />
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setPasswordModalOpen(true)}
              className="neu-btn btn-sm"
              title="Change Account Password"
            >
              <KeyRound size={14} /> Change Password
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.5rem' }}>
              <InitialsAvatar name={user?.profile?.name || user?.email} size="sm" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--charcoal)' }}>
                {user?.profile?.name || user?.email?.split('@')[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Initial Password Warning Notification Banner */}
        {mustChangePassword && (
          <div
            className="neu-inset"
            style={{
              margin: '1.5rem 2rem 0',
              padding: '1rem 1.25rem',
              background: '#FDF3E3',
              borderColor: '#F7DCAD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={22} color="#94621A" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#94621A', fontSize: '0.875rem' }}>
                  Action Required: Default Initial Password In Use
                </div>
                <div style={{ color: 'var(--slate)', fontSize: '0.8125rem' }}>
                  You are currently using the default system credentials assigned by administration. Please set a personalized password to secure your portal access.
                </div>
              </div>
            </div>
            <button
              onClick={() => setPasswordModalOpen(true)}
              className="btn btn-sm"
              style={{
                background: '#94621A',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                boxShadow: '2px 2px 6px rgba(148, 98, 26, 0.35)',
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
