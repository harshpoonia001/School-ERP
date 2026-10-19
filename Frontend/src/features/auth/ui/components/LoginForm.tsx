import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, ArrowRight, Shield, BookOpen, GraduationCap, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onSuccess: (role: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      <form onSubmit={handleSubmit} className="neu-card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              margin: '0 auto 1rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--primary-laurel), var(--primary-laurel-dark))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '4px 4px 12px rgba(74, 124, 89, 0.35)',
            }}
          >
            <GraduationCap size={30} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.35rem' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--slate)', fontSize: '0.85rem', margin: 0 }}>
            Sign in to access your SchoolFlow portal
          </p>
        </div>

        {errorMsg && (
          <div
            className="neu-inset-sm"
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              background: '#FBE6E5',
              borderColor: '#F7C0BD',
              color: '#BA1A1A',
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
              size={17}
              style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--slate-light)',
              }}
            />
            <input
              type="email"
              required
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="name@schoolflow.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock
              size={17}
              style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--slate-light)',
              }}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="form-input"
              style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--slate)',
                cursor: 'pointer',
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.5rem', height: '46px', fontSize: '0.92rem' }}
          disabled={submitting}
        >
          {submitting ? 'Authenticating...' : 'Sign In to Portal'}
          {!submitting && <ArrowRight size={17} />}
        </button>

        {/* Prototype Evaluation Demo Credentials */}
        <div
          className="neu-inset"
          style={{
            marginTop: '1.75rem',
            padding: '1.25rem',
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
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--primary-laurel-dark)',
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
              color: 'var(--slate)',
              textAlign: 'center',
              marginBottom: '0.85rem',
              lineHeight: 1.4,
              margin: '0 0 0.75rem',
            }}
          >
            Click below to autofill pre-configured test credentials:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              className="neu-btn btn-sm"
              onClick={() => handleQuickLogin('admin@school.com', 'admin123')}
              title="Admin role (Full management)"
              style={{ flexDirection: 'column', gap: '0.2rem', padding: '0.5rem 0.25rem', height: 'auto' }}
            >
              <Shield size={16} color="#653A8F" />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--charcoal)' }}>Admin</span>
            </button>
            <button
              type="button"
              className="neu-btn btn-sm"
              onClick={() => handleQuickLogin('teacher@school.com', 'teacher123')}
              title="Teacher role (Homeroom attendance)"
              style={{ flexDirection: 'column', gap: '0.2rem', padding: '0.5rem 0.25rem', height: 'auto' }}
            >
              <BookOpen size={16} color="#235487" />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--charcoal)' }}>Teacher</span>
            </button>
            <button
              type="button"
              className="neu-btn btn-sm"
              onClick={() => handleQuickLogin('student@school.com', 'student123')}
              title="Student role (Personal portal)"
              style={{ flexDirection: 'column', gap: '0.2rem', padding: '0.5rem 0.25rem', height: 'auto' }}
            >
              <GraduationCap size={16} color="#2F593E" />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--charcoal)' }}>Student</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
