import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, ArrowRight, Shield, BookOpen, GraduationCap } from 'lucide-react';

interface LoginFormProps {
  onSuccess: (role: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setErrorMsg(null);
    setSubmitting(true);
    try {
      const user = await login({ email, password });
      onSuccess(user.role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 1rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)',
            }}
          >
            <Shield size={28} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Sign in to access your school portal
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              background: 'var(--rose-bg)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#fda4af',
              fontSize: '0.8125rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail
              size={18}
              style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="email"
              required
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="name@school.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock
              size={18}
              style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="password"
              required
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.5rem', height: '44px' }}
          disabled={submitting}
        >
          {submitting ? 'Authenticating...' : 'Sign In to Portal'}
          {!submitting && <ArrowRight size={18} />}
        </button>

        {/* Prototype Evaluation Demo Credentials */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1.25rem',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              marginBottom: '0.35rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#818cf8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              ⚡ Prototype Evaluation Mode
            </span>
          </div>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              marginBottom: '0.875rem',
              lineHeight: 1.4,
            }}
          >
            Pre-configured accounts for testing role-based access control (RBAC):
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('admin@school.com', 'admin123')}
              title="Admin role (Full management)"
              style={{ flexDirection: 'column', gap: '0.2rem', padding: '0.5rem 0.25rem', height: 'auto' }}
            >
              <Shield size={16} color="#a78bfa" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Admin</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('teacher@school.com', 'teacher123')}
              title="Teacher role (Homeroom attendance)"
              style={{ flexDirection: 'column', gap: '0.2rem', padding: '0.5rem 0.25rem', height: 'auto' }}
            >
              <BookOpen size={16} color="#60a5fa" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Teacher</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('student@school.com', 'student123')}
              title="Student role (Personal portal)"
              style={{ flexDirection: 'column', gap: '0.2rem', padding: '0.5rem 0.25rem', height: 'auto' }}
            >
              <GraduationCap size={16} color="#34d399" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Student</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
