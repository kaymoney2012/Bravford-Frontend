import { useApp } from '../../context/AppContext';

export default function ResultsPage() {
  const { currentUser, results } = useApp();
  if (!currentUser || currentUser.role !== 'student') return null;

  // Only results for subjects this student actually sat — filtered by their studentId
  const myResults = results
    .filter(r => r.studentId === currentUser.id)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const releasedResults = myResults.filter(r => r.released);
  const pendingResults  = myResults.filter(r => !r.released);

  const gradeColor = (s: number) => s >= 70 ? 'var(--green)' : s >= 60 ? 'var(--blue)' : s >= 50 ? 'var(--gold)' : 'var(--red)';
  const gradeBadge = (s: number) => s >= 70 ? 'badge-green' : s >= 60 ? 'badge-blue' : s >= 50 ? 'badge-gold' : 'badge-red';

  const avgScore = releasedResults.length
    ? Math.round(releasedResults.reduce((a, r) => a + r.score, 0) / releasedResults.length)
    : null;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h2>My Results</h2>
        <p>{currentUser.name} · {(currentUser as any).studentClass} · Results for exams you sat</p>
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
        </div>
        <div className="stat-card">
          <div className="stat-label">Awaiting Release</div>
          <div className="stat-value" style={{ color: pendingResults.length > 0 ? 'var(--gold)' : 'var(--green)' }}>{pendingResults.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Score</div>
          <div className="stat-value" style={{ color: avgScore != null ? gradeColor(avgScore) : 'var(--slate-2)' }}>
            {avgScore != null ? `${avgScore}%` : '—'}
          </div>
          {avgScore != null && <div className="stat-hint">released exams only</div>}
        </div>
      </div>

      {myResults.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", marginBottom: 8 }}>No Exams Submitted Yet</h3>
          <p style={{ color: 'var(--slate-2)', fontSize: '0.9rem' }}>Take a CBT exam — your results will appear here once released by your admin.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Released results */}
          {releasedResults.length > 0 && (
            <div className="card">
              <div className="card-title">✅ Released Results</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Subject</th><th>Exam</th><th>Score</th><th>Correct</th><th>Grade</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {releasedResults.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{r.subject}</td>
                        <td style={{ fontSize: '0.8rem', maxWidth: 180 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{r.examTitle}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, fontSize: '1rem', color: gradeColor(r.score) }}>{r.score}%</span>
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>{r.correctCount}/{r.totalQuestions}</td>
                        <td><span className={`badge ${gradeBadge(r.score)}`}>{r.grade}</span></td>
                        <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                          {r.releasedAt
                            ? new Date(r.releasedAt).toLocaleDateString('en-NG')
                            : new Date(r.submittedAt).toLocaleDateString('en-NG')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pending results */}
          {pendingResults.length > 0 && (
            <div className="card" style={{ borderColor: 'rgba(200,146,42,0.3)' }}>
              <div className="card-title" style={{ color: '#a07020' }}>⏳ Awaiting Admin Approval</div>
              <div className="alert alert-warn" style={{ marginBottom: '1rem', fontSize: '0.83rem' }}>
                📢 The following results are pending release. You will be notified once your teacher/admin approves them.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {pendingResults.map(r => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)', gap: 8, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.9rem' }}>{r.subject}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-2)', marginTop: 2 }}>
                        Submitted: {new Date(r.submittedAt).toLocaleDateString('en-NG')} · {r.totalQuestions} questions
                      </div>
                    </div>
                    <span className="badge badge-gold">Awaiting Result Under Admin Approval</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
