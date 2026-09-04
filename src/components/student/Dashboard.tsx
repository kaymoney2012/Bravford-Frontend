import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Student } from '../../types';

export default function StudentDashboard() {
  const { currentUser, exams, results, setPage, updateStudent } = useApp();
  if (!currentUser || currentUser.role !== 'student') return null;
  const stu = currentUser as Student;

  const myResults      = results.filter(r => r.studentId === stu.id);
  const releasedResults = myResults.filter(r => r.released);
  const pendingResults  = myResults.filter(r => !r.released);
  const availableExams  = exams.filter(e => (e.targetClass === stu.studentClass || e.targetClass === 'ALL') && e.status === 'active');
  const attemptedIds   = new Set(myResults.map(r => r.examId));
  const pendingExams   = availableExams.filter(e => !attemptedIds.has(e.id));

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    phone: stu.phone, address: stu.address,
    email: stu.email, guardianName: stu.guardianName, guardianPhone: stu.guardianPhone,
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const saveProfile = () => { updateStudent(stu.id, form); setEditing(false); };

  const gradeColor = (s: number) => s >= 70 ? 'var(--green)' : s >= 60 ? 'var(--blue)' : s >= 50 ? 'var(--gold)' : 'var(--red)';
  const gradeBadge = (s: number) => s >= 70 ? 'badge-green' : s >= 60 ? 'badge-blue' : s >= 50 ? 'badge-gold' : 'badge-red';
  const avgScore = releasedResults.length ? Math.round(releasedResults.reduce((a, r) => a + r.score, 0) / releasedResults.length) : null;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h2>Welcome, {stu.name.split(' ')[0]}! 👋</h2>
        <p style={{ wordBreak: 'break-word' }}>
          {stu.studentClass} · {stu.id} ·{' '}
          {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Exams Taken</div>
          <div className="stat-value">{myResults.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Results Released</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{releasedResults.length}</div>
          <div className="stat-hint">of {myResults.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Exams</div>
          <div className="stat-value" style={{ color: pendingExams.length > 0 ? 'var(--red)' : 'var(--green)' }}>{pendingExams.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Score</div>
          <div className="stat-value" style={{ color: avgScore != null ? gradeColor(avgScore) : 'var(--slate-2)' }}>
            {avgScore != null ? `${avgScore}%` : '—'}
          </div>
        </div>
      </div>

      {/* ── My Results — shows released scores + pending ones ── */}
      {myResults.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="card-title">📊 My Results</div>

          {releasedResults.length > 0 && (
            <div style={{ marginBottom: pendingResults.length > 0 ? '1rem' : 0 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                ✅ Released by Admin
              </div>
              {releasedResults.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', gap: 8, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.88rem' }}>{r.subject}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--slate-2)', marginTop: 2 }}>{r.examTitle.slice(0, 40)}{r.examTitle.length > 40 ? '…' : ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: gradeColor(r.score) }}>{r.score}%</span>
                    <span className={`badge ${gradeBadge(r.score)}`}>{r.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pendingResults.length > 0 && (
            <div>
              {releasedResults.length > 0 && (
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0.75rem 0 0.5rem' }}>
                  ⏳ Awaiting Admin Approval
                </div>
              )}
              {pendingResults.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', gap: 8, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.88rem' }}>{r.subject}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--slate-2)', marginTop: 2 }}>
                      Submitted {new Date(r.submittedAt).toLocaleDateString('en-NG')}
                    </div>
                  </div>
                  <span className="badge badge-gold" style={{ fontSize: '0.62rem' }}>Awaiting Result Under Admin Approval</span>
                </div>
              ))}
            </div>
          )}

          <button className="btn btn-ghost btn-sm" style={{ marginTop: '1rem', width: '100%' }} onClick={() => setPage('results')}>
            View Full Results →
          </button>
        </div>
      )}

      {/* ── 2-col grid: available exams + submitted ── */}
      <div className="grid-2" style={{ marginBottom: '1rem' }}>
        <div className="card">
          <div className="card-title">📝 Available Exams</div>
          {pendingExams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.25rem', color: 'var(--slate-2)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
              <p style={{ fontSize: '0.85rem' }}>All current exams completed!</p>
            </div>
          ) : pendingExams.slice(0, 4).map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-2)', marginTop: 2 }}>⏱ {e.durationMinutes}m · {e.questions.length}q</div>
              </div>
              <button className="btn btn-gold btn-sm" style={{ flexShrink: 0 }} onClick={() => setPage('exams')}>Start</button>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">📋 Submitted Exams</div>
          {myResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.25rem', color: 'var(--slate-2)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div>
              <p style={{ fontSize: '0.85rem' }}>No submissions yet.</p>
            </div>
          ) : myResults.slice(-4).reverse().map(r => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.85rem' }}>{r.subject}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-2)', marginTop: 2 }}>{new Date(r.submittedAt).toLocaleDateString('en-NG')}</div>
              </div>
              {r.released
                ? <span className="badge badge-green">Released</span>
                : <span className="badge badge-gold" style={{ fontSize: '0.62rem' }}>Pending</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Student Profile — editable ── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy)' }}>👤 My Profile</span>
          {!editing
            ? <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
            : <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-green btn-sm" onClick={saveProfile}>✓ Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              </div>
          }
        </div>

        {editing ? (
          <div className="form-grid">
            {[
              ['email', 'Email', form.email],
              ['phone', 'Phone', form.phone],
              ['address', 'Address', form.address],
              ['guardianName', 'Guardian Name', form.guardianName],
              ['guardianPhone', 'Guardian Phone', form.guardianPhone],
            ].map(([k, l, v]) => (
              <div className="form-group" key={k}>
                <label>{l}</label>
                <input value={v} onChange={e => set(k, e.target.value)} />
              </div>
            ))}
            <div className="form-group">
              <label>Student ID (readonly)</label>
              <input value={stu.id} disabled style={{ opacity: 0.5 }} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.875rem' }}>
            {[
              ['Full Name', stu.name], ['Student ID', stu.id], ['Class', stu.studentClass],
              ['Email', stu.email], ['Phone', stu.phone],
              ['Date of Birth', new Date(stu.dob).toLocaleDateString('en-NG')],
              ['Gender', stu.gender], ['Guardian', stu.guardianName],
              ['Guardian Phone', stu.guardianPhone],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: '0.65rem', color: 'var(--slate-2)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{k}</div>
                <div style={{ marginTop: 3, fontWeight: 500, color: 'var(--navy)', fontSize: '0.85rem', wordBreak: 'break-word' }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
