import  { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../types';
import SchoolLogo from '../layout/SchoolLogo';

export default function LoginPage() {
  const { login, setPage, authError } = useApp();
  const [role, setRole]         = useState<UserRole>('student');
  const [id, setId]             = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!id || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    const ok = await login(id.trim(), password, role);
    if (!ok) setError(authError || 'Login failed. Please try again.');
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--navy)', padding: '2rem',
        backgroundImage: 'radial-gradient(ellipse at top right,rgba(200,146,42,0.15) 0%,transparent 60%)',
      }}
    >
      <div style={{ background: 'white', borderRadius: 'var(--r)', padding: '2.5rem', width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-lg)' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: 60, height: 60, background: 'rgba(200,146,42,0.1)', border: '2px solid rgba(200,146,42,0.3)', borderRadius: '50%', margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SchoolLogo size={36} />
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy)' }}>Bravford Portal</h2>
          <p style={{ color: 'var(--slate-2)', fontSize: '0.85rem', marginTop: 2 }}>Log in to your account</p>
        </div>

        {/* Role tabs */}
        <div className="tabs">
          <button className={`tab ${role === 'student' ? 'active' : ''}`} onClick={() => { setRole('student'); setError(''); }}>🎓 Student</button>
          <button className={`tab ${role === 'admin'   ? 'active' : ''}`} onClick={() => { setRole('admin');   setError(''); }}>🛡️ Administrator</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label>{role === 'student' ? 'Student ID' : 'Administrator ID'}</label>
          <input
            placeholder={role === 'student' ? 'e.g. STU001' : 'e.g. Enter'}
            value={id}
            onChange={e => setId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.75rem' }}>
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? '⏳ Loging in...' : 'Log In →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--slate-2)' }}>
          New student?{' '}
          <button onClick={() => setPage('register')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
            Apply for admission →
          </button>
        </p>

        <div className="alert alert-info" style={{ marginTop: '1rem', fontSize: '0.78rem' }}>
          <strong>Demo Credentials:</strong> Student: STU001 / password &nbsp;
        </div>
      </div>
    </div>
  );
}
