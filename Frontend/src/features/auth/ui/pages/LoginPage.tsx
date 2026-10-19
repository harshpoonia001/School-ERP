import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === 'ADMIN') navigate('/admin', { replace: true });
      else if (role === 'TEACHER') navigate('/teacher', { replace: true });
      else if (role === 'STUDENT') navigate('/student', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleSuccess = (userRole: string) => {
    if (userRole === 'ADMIN') navigate('/admin');
    else if (userRole === 'TEACHER') navigate('/teacher');
    else if (userRole === 'STUDENT') navigate('/student');
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
        }}
      >
        Loading portal session...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', letterSpacing: '-0.03em' }}>
          School<span style={{ color: 'var(--primary-500)' }}>Flow</span> ERP
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
          Integrated Staff, Teacher & Student Operations
        </p>
      </div>

      <LoginForm onSuccess={handleSuccess} />

      <div style={{ marginTop: '2.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'center' }}>
        &copy; {new Date().getFullYear()} SchoolFlow Mini ERP &bull; 24h Engineering Challenge
      </div>
    </div>
  );
};
