import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { Student, StudentStatus, Exam, ExamResult } from '../../types';
import UploadQuestionsModal from './UploadQuestionsModal';

type AdminView = 'overview' | 'students' | 'exams' | 'results' | 'applications' | 'reports' | 'settings';

const CLASS_ORDER = ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'];

/* ── Edit Student Modal ─────────────────────────────────────────────────── */
function EditStudentModal({ student, onClose, onSave }: { student: Student; onClose: () => void; onSave: (d: Partial<Student> & { password?: string }) => void }) {
  const [f, setF] = useState({
    name: student.name, email: student.email, phone: student.phone,
    address: student.address, studentClass: student.studentClass,
    gender: student.gender, dob: student.dob, password: '',
    guardianName: student.guardianName, guardianPhone: student.guardianPhone,
  });
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  const handleSave = () => {
    const { password, ...rest } = f;
    onSave(password.trim() ? { ...rest, password: password.trim() } : rest);
  };
  return (
    <div className="edit-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="edit-modal">
        <div style={{ padding: '1.25rem 1.25rem 0', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 800, fontSize: '1.2rem', color: 'var(--navy)' }}>✏️ Edit Student</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--slate-2)', marginTop: 2 }}>{student.id} — {student.name}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '1.25rem' }}>
          <div className="form-grid">
            {[
              ['name','Full Name',''],['email','Email',''],['phone','Phone',''],
              ['address','Address',''],['guardianName','Guardian Name',''],['guardianPhone','Guardian Phone',''],
            ].map(([k,l]) => (
              <div className="form-group" key={k}>
                <label>{l}</label>
                <input value={(f as any)[k]} onChange={e => set(k, e.target.value)} />
              </div>
            ))}
            <div className="form-group">
              <label>Reset Password</label>
              <input placeholder="Leave blank to keep current password" value={f.password} onChange={e => set('password', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Class</label>
              <select value={f.studentClass} onChange={e => set('studentClass', e.target.value)}>
                {['JSS1','JSS2','JSS3','SSS1','SSS2','SSS3'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select value={f.gender} onChange={e => set('gender', e.target.value)}>
                <option>Male</option><option>Female</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" value={f.dob} onChange={e => set('dob', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Student ID (readonly)</label>
              <input value={student.id} disabled style={{ opacity: 0.5 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-green" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { handleSave(); onClose(); }}>✓ Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Exam Questions Modal (view + delete questions) ─────────────────────── */
function ExamQuestionsModal({ exam, onClose, onDeleteQuestion }: {
  exam: Exam;
  onClose: () => void;
  onDeleteQuestion: (examId: string, questionId: number) => void;
}) {
  const [confirmQId, setConfirmQId] = useState<number | null>(null);
  return (
    <div className="edit-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="edit-modal">
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 800, fontSize: '1.2rem', color: 'var(--navy)' }}>📝 {exam.title}</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--slate-2)', marginTop: 2 }}>{exam.questions.length} question(s) · {exam.subject} · {exam.targetClass}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '1.25rem', maxHeight: '65vh', overflowY: 'auto' }}>
          {exam.questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-2)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📭</div>
              <p>All questions have been deleted from this exam.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {exam.questions.map((q, i) => (
                <div key={q.id} style={{
                  background: 'var(--cream)', borderRadius: 10, padding: '0.875rem 1rem',
                  border: confirmQId === q.id ? '2px solid var(--red)' : '1.5px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.9rem', lineHeight: 1.5, flex: 1 }}>
                      {i + 1}. {q.text}
                    </div>
                    {confirmQId === q.id ? (
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button className="btn btn-danger btn-sm" onClick={() => { onDeleteQuestion(exam.id, q.id); setConfirmQId(null); }}>
                          🗑 Confirm
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setConfirmQId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', flexShrink: 0 }} onClick={() => setConfirmQId(q.id)}>
                        🗑
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {q.options.map((opt, oi) => (
                      <span key={oi} style={{
                        padding: '3px 10px', borderRadius: 100, fontSize: '0.78rem',
                        background: oi === q.correctAnswer ? 'rgba(27,107,69,0.15)' : 'white',
                        color: oi === q.correctAnswer ? 'var(--green)' : 'var(--slate)',
                        border: `1px solid ${oi === q.correctAnswer ? 'rgba(27,107,69,0.3)' : 'var(--border)'}`,
                        fontWeight: oi === q.correctAnswer ? 700 : 400,
                      }}>
                        {String.fromCharCode(65 + oi)}. {opt} {oi === q.correctAnswer ? '✓' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main AdminPortal ───────────────────────────────────────────────────── */
export default function AdminPortal() {
  const {
    currentUser, students, exams, results, applications,
    addStudent, updateStudent, updateStudentStatus, updateExamStatus,
    updateApplicationStatus, addExam, deleteStudent,
    deleteExam, deleteQuestion, deleteResult,
    releaseResult, releaseAllForExam, updateAdminCredentials,
  } = useApp() as any;

  if (!currentUser || currentUser.role !== 'admin') return null;

  const [view, setView]             = useState<AdminView>('overview');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteExamId, setConfirmDeleteExamId] = useState<string | null>(null);
  const [confirmDeleteResultId, setConfirmDeleteResultId] = useState<string | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [viewQuestionsExam, setViewQuestionsExam] = useState<Exam | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [addStudentError, setAddStudentError] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [resultFilter, setResultFilter] = useState<'all' | 'pending' | 'released'>('all');
  const [resultSearch, setResultSearch] = useState('');
  const [resultClassFilter, setResultClassFilter] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  /* ── Account settings — change the admin's own login ID / password ───── */
  const [settingsForm, setSettingsForm] = useState({ currentPassword: '', newId: '', newPassword: '', confirmPassword: '' });
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);

  const setSettingsField = (k: string, v: string) => setSettingsForm(p => ({ ...p, [k]: v }));

  const handleUpdateCredentials = async () => {
    setSettingsError(''); setSettingsSuccess('');
    if (!settingsForm.currentPassword) { setSettingsError('Enter your current password to confirm this change.'); return; }
    if (!settingsForm.newId.trim() && !settingsForm.newPassword) { setSettingsError('Enter a new username and/or a new password.'); return; }
    if (settingsForm.newPassword && settingsForm.newPassword.length < 6) { setSettingsError('New password must be at least 6 characters.'); return; }
    if (settingsForm.newPassword && settingsForm.newPassword !== settingsForm.confirmPassword) { setSettingsError("New passwords don't match."); return; }

    setSettingsSaving(true);
    const res = await updateAdminCredentials({
      currentPassword: settingsForm.currentPassword,
      newId: settingsForm.newId.trim() || undefined,
      newPassword: settingsForm.newPassword || undefined,
    });
    setSettingsSaving(false);
    if (!res.ok) { setSettingsError(res.error || 'Failed to update credentials.'); return; }
    setSettingsSuccess('✓ Your login credentials have been updated.');
    setSettingsForm({ currentPassword: '', newId: '', newPassword: '', confirmPassword: '' });
  };
  const [newStudent, setNewStudent] = useState({
    name:'', studentClass:'', email:'', phone:'', gender:'', dob:'', address:'', guardianName:'', guardianPhone:'', username:'', password:''
  });

  const ns = (k: string, v: string) => setNewStudent(p => ({ ...p, [k]: v }));

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.studentClass || !newStudent.username || !newStudent.password) {
      setAddStudentError('Name, class, username and password are required.');
      return;
    }
    setAddStudentError('');
    const res = await addStudent(newStudent);
    if (!res.ok) { setAddStudentError(res.error || 'Failed to add student.'); return; }
    setNewStudent({ name:'', studentClass:'', email:'', phone:'', gender:'', dob:'', address:'', guardianName:'', guardianPhone:'', username:'', password:'' });
    setShowAddStudent(false);
  };

  const toggleGroup = (key: string) => setCollapsedGroups(p => ({ ...p, [key]: !p[key] }));


  const handleExamSaved = (exam: Exam) => {
    addExam(exam);
    setShowUpload(false);
    setUploadSuccess(`✓ "${exam.title}" added with ${exam.questions.length} questions.`);
    setTimeout(() => setUploadSuccess(''), 5000);
    setView('exams');
  };

  const filteredStudents = useMemo(() => {
    const q = studentSearch.toLowerCase().trim();
    if (!q) return students;
    return students.filter((s: Student) =>
      s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) || s.studentClass.toLowerCase().includes(q) || s.phone.includes(q)
    );
  }, [students, studentSearch]);

  const studentById = useMemo(() => {
    const m = new Map<string, Student>();
    students.forEach((s: Student) => m.set(s.id, s));
    return m;
  }, [students]);

  const filteredResults = useMemo(() => {
    let list = results as ExamResult[];
    if (resultFilter === 'pending')  list = list.filter((r) => !r.released);
    if (resultFilter === 'released') list = list.filter((r) => r.released);
    if (resultClassFilter) {
      list = list.filter((r) => (studentById.get(r.studentId)?.studentClass ?? r.studentClass) === resultClassFilter);
    }
    const q = resultSearch.toLowerCase().trim();
    if (q) {
      list = list.filter((r) => {
        const stu = studentById.get(r.studentId);
        return (
          r.studentId.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.examTitle.toLowerCase().includes(q) ||
          (stu?.name.toLowerCase().includes(q) ?? false)
        );
      });
    }
    return list;
  }, [results, resultFilter, resultSearch, resultClassFilter, studentById]);

  // Group filtered results by class, then by subject, for the results tab.
  const resultsByClassAndSubject = useMemo(() => {
    const groups = new Map<string, Map<string, ExamResult[]>>();
    filteredResults.forEach((r) => {
      const cls = studentById.get(r.studentId)?.studentClass ?? r.studentClass ?? 'Unassigned';
      if (!groups.has(cls)) groups.set(cls, new Map());
      const bySubject = groups.get(cls)!;
      if (!bySubject.has(r.subject)) bySubject.set(r.subject, []);
      bySubject.get(r.subject)!.push(r);
    });
    // Sort classes by the standard school order, unknowns last.
    return Array.from(groups.entries()).sort(([a], [b]) => {
      const ia = CLASS_ORDER.indexOf(a), ib = CLASS_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
  }, [filteredResults, studentById]);

  /* ── Reports & Analytics computations ─────────────────────────────────── */
  const reportStats = useMemo(() => {
    const totalResults = results.length;
    const avgScore = totalResults
      ? Math.round(results.reduce((a: number, r: ExamResult) => a + r.score, 0) / totalResults)
      : 0;
    const passCount = results.filter((r: ExamResult) => r.score >= 50).length;
    const passRate = totalResults ? Math.round((passCount / totalResults) * 100) : 0;
    return {
      totalStudents: students.length,
      activeStudents: students.filter((s: Student) => s.status === 'active').length,
      totalResults,
      releasedResults: results.filter((r: ExamResult) => r.released).length,
      avgScore,
      passRate,
      pendingApps: applications.filter((a: any) => a.status === 'pending').length,
    };
  }, [students, results, applications]);

  const classPerformance = useMemo(() => {
    return CLASS_ORDER.map((cls) => {
      const cs  = students.filter((s: Student) => s.studentClass === cls);
      const ids = new Set(cs.map((s: Student) => s.id));
      const cr  = results.filter((r: ExamResult) => ids.has(r.studentId));
      const avg = cr.length ? Math.round(cr.reduce((a: number, r: ExamResult) => a + r.score, 0) / cr.length) : 0;
      const passRate = cr.length ? Math.round((cr.filter((r: ExamResult) => r.score >= 50).length / cr.length) * 100) : 0;
      return { cls, studentCount: cs.length, examCount: cr.length, avg, passRate };
    }).filter((c) => c.studentCount > 0 || c.examCount > 0);
  }, [students, results]);

  const subjectPerformance = useMemo(() => {
    const subjects = Array.from(new Set(results.map((r: ExamResult) => r.subject).filter(Boolean))) as string[];
    return subjects
      .map((subject) => {
        const sr = results.filter((r: ExamResult) => r.subject === subject);
        const avg = sr.length ? Math.round(sr.reduce((a: number, r: ExamResult) => a + r.score, 0) / sr.length) : 0;
        const passRate = sr.length ? Math.round((sr.filter((r: ExamResult) => r.score >= 50).length / sr.length) * 100) : 0;
        return { subject, count: sr.length, avg, passRate };
      })
      .sort((a, b) => b.avg - a.avg);
  }, [results]);

  const gradeDistribution = useMemo(() => {
    const total = results.length || 1;
    return (['A', 'B', 'C', 'D', 'F'] as const).map((grade) => {
      const count = results.filter((r: ExamResult) => r.grade === grade).length;
      return { grade, count, pct: Math.round((count / total) * 100) };
    });
  }, [results]);

  const studentAverages = useMemo(() => {
    const byStudent = new Map<string, { total: number; count: number }>();
    results.forEach((r: ExamResult) => {
      const cur = byStudent.get(r.studentId) || { total: 0, count: 0 };
      cur.total += r.score; cur.count += 1;
      byStudent.set(r.studentId, cur);
    });
    return Array.from(byStudent.entries()).map(([studentId, v]) => ({
      studentId, avg: Math.round(v.total / v.count), examsTaken: v.count,
    }));
  }, [results]);

  const topPerformers = useMemo(
    () => [...studentAverages].sort((a, b) => b.avg - a.avg).slice(0, 5),
    [studentAverages]
  );
  const needsAttention = useMemo(
    () => [...studentAverages].filter((s) => s.avg < 50).sort((a, b) => a.avg - b.avg).slice(0, 5),
    [studentAverages]
  );

  const admissionsFunnel = useMemo(() => {
    const total = applications.length || 1;
    return (['pending', 'approved', 'rejected'] as const).map((status) => {
      const count = applications.filter((a: any) => a.status === status).length;
      return { status, count, pct: Math.round((count / total) * 100) };
    });
  }, [applications]);

  const exportResultsCSV = () => {
    const header = ['Student ID', 'Student Name', 'Class', 'Subject', 'Exam', 'Score (%)', 'Grade', 'Status', 'Submitted At'];
    const rows = results.map((r: ExamResult) => {
      const stu = studentById.get(r.studentId);
      return [
        r.studentId, stu?.name ?? '', stu?.studentClass ?? r.studentClass ?? '',
        r.subject, r.examTitle, r.score, r.grade, r.released ? 'Released' : 'Pending',
        new Date(r.submittedAt).toLocaleString('en-NG'),
      ];
    });
    const csv = [header, ...rows]
      .map((row) => row.map((v: string | number) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bravford-results-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const pendingApps    = applications.filter((a: any) => a.status === 'pending').length;
  const activeStudents = students.filter((s: Student) => s.status === 'active').length;
  const pendingResults = results.filter((r: any) => !r.released).length;

  const sideLinks: { id: AdminView; icon: string; label: string; badge?: number }[] = [
    { id: 'overview',     icon: '📊', label: 'Overview' },
    { id: 'students',     icon: '👥', label: 'Students' },
    { id: 'exams',        icon: '📝', label: 'Exams' },
    { id: 'results',      icon: '📈', label: 'Results', badge: pendingResults },
    { id: 'applications', icon: '📋', label: 'Applications', badge: pendingApps },
    { id: 'reports',      icon: '📑', label: 'Reports' },
    { id: 'settings',     icon: '⚙️', label: 'Account Settings' },
  ];

  const sideStyle = (id: AdminView): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 11px',
    borderRadius: 8, cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
    fontSize: '0.83rem', fontWeight: view === id ? 700 : 500,
    color: view === id ? 'var(--gold)' : 'rgba(255,255,255,0.6)',
    background: view === id ? 'rgba(200,146,42,0.18)' : 'none',
    border: 'none', whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0,
  });

  const gc = (s: number) => s >= 70 ? 'var(--green)' : s >= 60 ? 'var(--blue)' : s >= 50 ? 'var(--gold)' : 'var(--red)';
  const gb = (s: number) => s >= 70 ? 'badge-green' : s >= 60 ? 'badge-blue' : s >= 50 ? 'badge-gold' : 'badge-red';

  /* ── Confirm dialog renderer ────────────────────────────────────────────── */
  const renderConfirmDialog = (
    title: string, body: React.ReactNode, onConfirm: () => void, onCancel: () => void, danger = true,
  ) => (
    <div style={{ position:'fixed', inset:0, background:'rgba(13,31,53,.65)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div style={{ background:'#fff', borderRadius:'var(--r)', padding:'1.5rem', maxWidth:420, width:'100%', boxShadow:'var(--shadow-lg)', textAlign:'center' }}>
        <div style={{ fontSize:'2.5rem', marginBottom:12 }}>⚠️</div>
        <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.4rem', fontWeight:800, color:'var(--navy)', marginBottom:8 }}>{title}</h3>
        <div style={{ color:'var(--slate)', fontSize:'0.88rem', lineHeight:1.6, marginBottom:'1.5rem' }}>{body}</div>
        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>🗑 Delete Permanently</button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showUpload && <UploadQuestionsModal onClose={() => setShowUpload(false)} onSave={handleExamSaved} />}
      {editStudent && <EditStudentModal student={editStudent} onClose={() => setEditStudent(null)} onSave={d => updateStudent(editStudent.id, d)} />}
      {viewQuestionsExam && (
        <ExamQuestionsModal
          exam={exams.find((e: Exam) => e.id === viewQuestionsExam.id) ?? viewQuestionsExam}
          onClose={() => setViewQuestionsExam(null)}
          onDeleteQuestion={(examId, qId) => deleteQuestion(examId, qId)}
        />
      )}

      {/* Delete student confirm */}
      {confirmDeleteId && (() => {
        const s = students.find((x: Student) => x.id === confirmDeleteId);
        return renderConfirmDialog(
          'Delete Student?',
          <><p>Permanently delete <strong>{s?.name}</strong> ({confirmDeleteId}) and all their results?</p><p style={{ marginTop:6 }}><strong>This cannot be undone.</strong></p></>,
          () => { deleteStudent(confirmDeleteId); setConfirmDeleteId(null); },
          () => setConfirmDeleteId(null),
        );
      })()}

      {/* Delete exam confirm */}
      {confirmDeleteExamId && (() => {
        const e = exams.find((x: Exam) => x.id === confirmDeleteExamId);
        return renderConfirmDialog(
          'Delete Exam?',
          <><p>Permanently delete <strong>{e?.title}</strong>?</p><p style={{ marginTop:6 }}>Existing student results will be kept for records. <strong>This cannot be undone.</strong></p></>,
          () => { deleteExam(confirmDeleteExamId); setConfirmDeleteExamId(null); },
          () => setConfirmDeleteExamId(null),
        );
      })()}

      {/* Delete result confirm (allows a retake) */}
      {confirmDeleteResultId && (() => {
        const r = results.find((x: ExamResult) => x.id === confirmDeleteResultId);
        const stu = r ? studentById.get(r.studentId) : null;
        return renderConfirmDialog(
          'Delete Result & Allow Retake?',
          <><p>Delete <strong>{stu?.name ?? r?.studentId}</strong>'s result for <strong>{r?.subject}</strong>?</p><p style={{ marginTop:6 }}>The exam will reappear as available so the student can retake it. <strong>This cannot be undone.</strong></p></>,
          () => { deleteResult(confirmDeleteResultId); setConfirmDeleteResultId(null); },
          () => setConfirmDeleteResultId(null),
        );
      })()}

      <div className="admin-layout">
        {/* ── Sidebar ── */}
        <aside className="admin-sidebar">
          <div className="admin-brand">🛡️ Admin Portal</div>
          <div className="admin-section-label">Navigation</div>
          {sideLinks.map(l => (
            <button key={l.id} style={sideStyle(l.id)} onClick={() => setView(l.id)}>
              <span>{l.icon}</span>
              <span>{l.label}</span>
              {l.badge ? <span style={{ marginLeft:'auto', background:'var(--red)', color:'#fff', borderRadius:100, fontSize:'0.65rem', fontWeight:700, padding:'1px 6px', minWidth:18, textAlign:'center' }}>{l.badge}</span> : null}
            </button>
          ))}
          <div className="admin-user-badge">
            Logged in as<br /><strong style={{ color:'var(--gold)' }}>Bravford Teacher</strong>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="admin-main">
          {uploadSuccess && <div className="alert alert-success" style={{ marginBottom:'1.25rem' }}>{uploadSuccess}</div>}

          {/* ── OVERVIEW ─────────────────────────────────── */}
          {view === 'overview' && (
            <>
              <div className="page-header">
                <h2>Admin Overview</h2>
                <p>Bravford Assda · {new Date().toLocaleDateString('en-NG', { month:'long', year:'numeric' })}</p>
              </div>
              <div className="stats-row">
                <div className="stat-card"><div className="stat-label">Total Students</div><div className="stat-value">{students.length}</div><div className="stat-hint">{activeStudents} active</div></div>
                <div className="stat-card"><div className="stat-label">Active Exams</div><div className="stat-value">{exams.filter((e: Exam) => e.status === 'active').length}</div></div>
                <div className="stat-card"><div className="stat-label">Results Submitted</div><div className="stat-value">{results.length}</div><div className="stat-hint">{pendingResults} pending release</div></div>
                <div className="stat-card"><div className="stat-label">Pending Apps</div><div className="stat-value" style={{ color: pendingApps > 0 ? 'var(--gold)' : 'var(--green)' }}>{pendingApps}</div></div>
              </div>
              {pendingResults > 0 && (
                <div className="alert alert-warn" style={{ marginBottom:'1rem' }}>
                  ⏳ <strong>{pendingResults} result(s)</strong> are awaiting your release. Go to <button onClick={() => setView('results')} style={{ background:'none', border:'none', color:'inherit', fontWeight:700, cursor:'pointer', textDecoration:'underline' }}>Results</button> to release them.
                </div>
              )}
              <div className="grid-2">
                <div className="card">
                  <div className="card-title">Recent Students</div>
                  {students.slice(0, 4).map((s: Student) => (
                    <div key={s.id} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)', alignItems:'center', gap:8 }}>
                      <div><div style={{ fontWeight:600, color:'var(--navy)', fontSize:'0.88rem' }}>{s.name}</div><div style={{ fontSize:'0.75rem', color:'var(--slate-2)' }}>{s.id} · {s.studentClass}</div></div>
                      <span className={`badge ${s.status === 'active' ? 'badge-green' : 'badge-red'}`}>{s.status}</span>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="card-title">Latest Results</div>
                  {results.length === 0
                    ? <p style={{ color:'var(--slate-2)', fontSize:'0.85rem' }}>No results yet.</p>
                    : results.slice(-4).reverse().map((r: any) => {
                        const stu = students.find((s: Student) => s.id === r.studentId);
                        return (
                          <div key={r.id} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)', alignItems:'center', gap:8 }}>
                            <div><div style={{ fontWeight:600, color:'var(--navy)', fontSize:'0.88rem' }}>{stu?.name ?? r.studentId}</div><div style={{ fontSize:'0.75rem', color:'var(--slate-2)' }}>{r.subject}</div></div>
                            <div style={{ textAlign:'right', flexShrink:0 }}>
                              <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.88rem' }}>{r.score}%</div>
                              {r.released ? <span className="badge badge-green" style={{ fontSize:'0.62rem' }}>Released</span> : <span className="badge badge-gold" style={{ fontSize:'0.62rem' }}>Pending</span>}
                            </div>
                          </div>
                        );
                      })}
                </div>
              </div>
            </>
          )}

          {/* ── STUDENTS ─────────────────────────────────── */}
          {view === 'students' && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'1.25rem', flexWrap:'wrap', gap:10 }}>
                <div>
                  <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.75rem', fontWeight:800, color:'var(--navy)' }}>Students</h2>
                  <p style={{ color:'var(--slate-2)', fontSize:'0.85rem' }}>
                    {students.length} enrolled · {activeStudents} active
                    <span style={{ marginLeft:8, padding:'2px 8px', borderRadius:100, background:'rgba(27,107,69,0.1)', color:'var(--green)', fontSize:'0.72rem', fontWeight:600 }}>
                      🔄 Synced across all administrators
                    </span>
                  </p>
                </div>
                <button className="btn btn-gold btn-sm" onClick={() => setShowAddStudent(!showAddStudent)}>+ Add Student</button>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1rem', background:'#fff', border:'1.5px solid var(--border)', borderRadius:10, padding:'8px 14px' }}>
                <span style={{ fontSize:'1rem', color:'var(--slate-2)', flexShrink:0 }}>🔍</span>
                <input
                  placeholder="Search by name, ID, class, email or phone…"
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  style={{ border:'none', outline:'none', background:'transparent', fontFamily:'Outfit,sans-serif', fontSize:'0.88rem', color:'var(--navy)', flex:1, minWidth:0 }}
                />
                {studentSearch && <button onClick={() => setStudentSearch('')} style={{ background:'none', border:'none', color:'var(--slate-2)', cursor:'pointer', fontSize:'1rem', flexShrink:0 }}>✕</button>}
              </div>

              {showAddStudent && (
                <div className="card" style={{ marginBottom:'1.25rem', borderColor:'rgba(200,146,42,0.5)' }}>
                  <div className="card-title">Add New Student</div>
                  {addStudentError && <div className="alert alert-error" style={{ marginBottom:'1rem' }}>{addStudentError}</div>}
                  <div className="form-grid">
                    {[['name','Full Name *','Amara Okafor'],['email','Email','student@edu.ng'],['phone','Phone','080XXXXXXXX'],['address','Address','Street, City']].map(([k,l,p]) => (
                      <div className="form-group" key={k}><label>{l}</label><input placeholder={p} value={(newStudent as any)[k]} onChange={e => ns(k, e.target.value)} /></div>
                    ))}
                    <div className="form-group"><label>Date of Birth</label><input type="date" value={newStudent.dob} onChange={e => ns('dob', e.target.value)} /></div>
                    <div className="form-group">
                      <label>Class</label>
                      <select value={newStudent.studentClass} onChange={e => ns('studentClass', e.target.value)}>
                        <option value="">Select…</option>
                        {['JSS1','JSS2','JSS3','SSS1','SSS2','SSS3'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select value={newStudent.gender} onChange={e => ns('gender', e.target.value)}>
                        <option value="">Select…</option><option>Male</option><option>Female</option><option>Rather not say</option>
                      </select>
                    </div>
                    <div className="form-group"><label>Guardian Name</label><input value={newStudent.guardianName} onChange={e => ns('guardianName', e.target.value)} /></div>
                    <div className="form-group"><label>Guardian Phone</label><input value={newStudent.guardianPhone} onChange={e => ns('guardianPhone', e.target.value)} /></div>
                    <div className="form-group">
                      <label>Login Username *</label>
                      <input placeholder="e.g. STU004 or amara.okafor" value={newStudent.username} onChange={e => ns('username', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Login Password *</label>
                      <input type="text" placeholder="Set a temporary password" value={newStudent.password} onChange={e => ns('password', e.target.value)} />
                      <span className="hint">Share this with the student — they can change it after logging in.</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:10, marginTop:'1.25rem', flexWrap:'wrap' }}>
                    <button className="btn btn-green" onClick={handleAddStudent}>✓ Save Student</button>
                    <button className="btn btn-ghost" onClick={() => { setShowAddStudent(false); setAddStudentError(''); }}>Cancel</button>
                  </div>
                </div>
              )}

              {filteredStudents.length === 0 ? (
                <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
                  <div style={{ fontSize:'2.5rem', marginBottom:8 }}>🔍</div>
                  <p style={{ color:'var(--slate-2)' }}>No available student "{studentSearch}"</p>
                </div>
              ) : (
                <div className="card">
                  <div style={{ fontSize:'0.75rem', color:'var(--slate-2)', marginBottom:'0.75rem' }}>
                    Showing {filteredStudents.length} of {students.length} students
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>ID</th><th>Name</th><th>Class</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {filteredStudents.map((s: Student) => (
                          <tr key={s.id}>
                            <td style={{ fontFamily:'monospace', fontSize:'0.8rem', color:'var(--navy)' }}>{s.id}</td>
                            <td>
                              <div style={{ fontWeight:600, color:'var(--navy)', fontSize:'0.87rem' }}>{s.name}</div>
                              <div style={{ fontSize:'0.72rem', color:'var(--slate-2)' }}>{s.email}</div>
                            </td>
                            <td><span className="badge badge-navy">{s.studentClass}</span></td>
                            <td style={{ fontSize:'0.82rem' }}>{s.phone}</td>
                            <td><span className={`badge ${s.status === 'active' ? 'badge-green' : 'badge-red'}`}>{s.status}</span></td>
                            <td>
                              <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => setEditStudent(s)}>✏️ Edit</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => updateStudentStatus(s.id, s.status === 'active' ? 'inactive' : 'active' as StudentStatus)}>
                                  {s.status === 'active' ? 'Deactivate' : 'Activate'}
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => setConfirmDeleteId(s.id)}>🗑</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── EXAMS ───────────────────────────────────── */}
          {view === 'exams' && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'1.5rem', flexWrap:'wrap', gap:10 }}>
                <div>
                  <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.75rem', fontWeight:800, color:'var(--navy)' }}>Exam Management</h2>
                  <p style={{ color:'var(--slate-2)', fontSize:'0.85rem' }}>{exams.length} exam(s) configured · Questions are customized for each student</p>
                </div>
                <button className="btn btn-gold btn-sm" onClick={() => setShowUpload(true)}>📤 Upload Questions</button>
              </div>

              {exams.length === 0 ? (
                <div className="card" style={{ textAlign:'center', padding:'4rem' }}>
                  <div style={{ fontSize:'3rem', marginBottom:12 }}>📭</div>
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif", marginBottom:8 }}>No Available Exam</h3>
                  <p style={{ color:'var(--slate-2)', marginBottom:'1.5rem' }}>Upload questions to create your first exam.</p>
                  <button className="btn btn-gold" onClick={() => setShowUpload(true)}>📤 Upload Questions</button>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  {exams.map((e: Exam) => (
                    <div key={e.id} className="card">
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', flexWrap:'wrap' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:'1.05rem', color:'var(--navy)', marginBottom:6 }}>{e.title}</h3>
                          <div style={{ display:'flex', gap:10, flexWrap:'wrap', fontSize:'0.8rem', color:'var(--slate)' }}>
                            <span>📚 {e.subject}</span><span>🎓 {e.targetClass}</span>
                            <span>❓ {e.questions.length}q</span><span>⏱ {e.durationMinutes}m</span>
                          </div>
                          {e.scheduledStart && (
                            <div style={{ marginTop:8, display:'flex', gap:8, flexWrap:'wrap', fontSize:'0.78rem' }}>
                              <span style={{ background:'rgba(27,107,69,.08)', border:'1px solid rgba(27,107,69,.2)', borderRadius:6, padding:'2px 9px', color:'var(--green)' }}>
                                🟢 {new Date(e.scheduledStart).toLocaleString('en-NG',{dateStyle:'short',timeStyle:'short'})}
                              </span>
                              {e.scheduledEnd && <span style={{ background:'rgba(181,58,58,.08)', border:'1px solid rgba(181,58,58,.2)', borderRadius:6, padding:'2px 9px', color:'var(--red)' }}>
                                🔒 {new Date(e.scheduledEnd).toLocaleString('en-NG',{dateStyle:'short',timeStyle:'short'})}
                              </span>}
                            </div>
                          )}
                        </div>
                        <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0, flexWrap:'wrap' }}>
                          <span className={`badge ${e.status==='active'?'badge-green':e.status==='upcoming'?'badge-gold':'badge-red'}`}>{e.status}</span>
                          <button className="btn btn-ghost btn-sm" onClick={() => setViewQuestionsExam(e)}>
                            🔍 Questions
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => updateExamStatus(e.id, e.status==='active'?'closed':'active')}>
                            {e.status==='active' ? 'Close' : 'Activate'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirmDeleteExamId(e.id)}>
                            🗑
                          </button>
                        </div>
                      </div>
                      <div style={{ marginTop:10, padding:'7px 12px', background:'var(--cream)', borderRadius:8, fontSize:'0.78rem', color:'var(--slate)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                        <span>Submitted: <strong>{results.filter((r: any) => r.examId===e.id).length}</strong> student(s)</span>
                        <span>Released: <strong>{results.filter((r: any) => r.examId===e.id&&r.released).length}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── RESULTS ─────────────────────────────────── */}
          {view === 'results' && (
            <>
              <div className="page-header">
                <h2>All Exam Results</h2>
                <p>Admin permission required before students can see results</p>
              </div>
              <div className="stats-row">
                <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value">{results.length}</div></div>
                <div className="stat-card"><div className="stat-label">Pending Release</div><div className="stat-value" style={{ color:'var(--gold)' }}>{pendingResults}</div></div>
                <div className="stat-card"><div className="stat-label">Released</div><div className="stat-value" style={{ color:'var(--green)' }}>{results.filter((r: any)=>r.released).length}</div></div>
                <div className="stat-card"><div className="stat-label">Avg Score</div><div className="stat-value">{results.length?Math.round(results.reduce((a: number, r: any)=>a+r.score,0)/results.length):0}%</div></div>
              </div>

              <div className="alert alert-warn" style={{ marginBottom:'1rem' }}>
                🔒 <strong>Admin Control:</strong> Click "Release" to make a result visible to the student. Use "Release All" to publish an entire exam at once.
              </div>

              <div className="tabs" style={{ marginBottom:'1rem' }}>
                <button className={`tab ${resultFilter==='all'?'active':''}`} onClick={()=>setResultFilter('all')}>All ({results.length})</button>
                <button className={`tab ${resultFilter==='pending'?'active':''}`} onClick={()=>setResultFilter('pending')}>⏳ Pending ({pendingResults})</button>
                <button className={`tab ${resultFilter==='released'?'active':''}`} onClick={()=>setResultFilter('released')}>✅ Released ({results.filter((r: any)=>r.released).length})</button>
              </div>

              <div style={{ display:'flex', gap:10, marginBottom:'1rem', flexWrap:'wrap' }}>
                <div className="searchbar" style={{ minWidth:220 }}>
                  <span className="search-icon" style={{ position:'static' }}>🔍</span>
                  <input
                    placeholder="Search by student, ID, subject or exam…"
                    value={resultSearch}
                    onChange={e => setResultSearch(e.target.value)}
                  />
                  {resultSearch && <button onClick={() => setResultSearch('')} style={{ background:'none', border:'none', color:'var(--slate-2)', cursor:'pointer' }}>✕</button>}
                </div>
                <select value={resultClassFilter} onChange={e => setResultClassFilter(e.target.value)}>
                  <option value="">All Classes</option>
                  {CLASS_ORDER.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {resultFilter !== 'released' && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:'1rem' }}>
                  {exams.filter((e: Exam) => results.some((r: any)=>r.examId===e.id && !r.released)).map((e: Exam) => (
                    <button key={e.id} className="btn btn-green btn-sm" onClick={() => releaseAllForExam(e.id)}>
                      ✅ Release All: {e.subject} ({results.filter((r: any)=>r.examId===e.id&&!r.released).length})
                    </button>
                  ))}
                </div>
              )}

              {/* ── Results grouped by Class → Subject ── */}
              {resultsByClassAndSubject.length === 0 ? (
                <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
                  <div style={{ fontSize:'2.5rem', marginBottom:8 }}>🔍</div>
                  <p style={{ color:'var(--slate-2)' }}>No results match your search.</p>
                </div>
              ) : resultsByClassAndSubject.map(([cls, bySubject]) => {
                const classTotal = Array.from(bySubject.values()).reduce((a, arr) => a + arr.length, 0);
                const collapsed = collapsedGroups[cls];
                return (
                  <div key={cls}>
                    <div className={`group-header ${collapsed ? '' : 'open'}`} onClick={() => toggleGroup(cls)}>
                      <span className="chevron">▶</span>
                      <span>🎓 {cls}</span>
                      <span className="count">{classTotal} result{classTotal===1?'':'s'}</span>
                    </div>
                    {!collapsed && (
                      <div className="card" style={{ borderTopLeftRadius:0, borderTopRightRadius:0 }}>
                        {Array.from(bySubject.entries()).map(([subject, list]) => (
                          <div key={subject} style={{ marginBottom:'1rem' }}>
                            <div className="subgroup-header">
                              <span>📚 {subject}</span>
                              <span className="count">{list.length} result{list.length===1?'':'s'}</span>
                            </div>
                            <div className="table-wrap">
                              <table>
                                <thead>
                                  <tr><th>Student</th><th>Score</th><th>Grade</th><th>Date</th><th>Status</th><th>Action</th></tr>
                                </thead>
                                <tbody>
                                  {list.map((r) => {
                                    const stu = studentById.get(r.studentId);
                                    return (
                                      <tr key={r.id}>
                                        <td>
                                          <div style={{ fontWeight:600, color:'var(--navy)', fontSize:'0.85rem' }}>{stu?.name ?? r.studentId}</div>
                                          <div style={{ fontSize:'0.72rem', color:'var(--slate-2)' }}>{r.studentId} · {r.examTitle.slice(0,26)}{r.examTitle.length>26?'…':''}</div>
                                        </td>
                                        <td><span style={{ fontWeight:700, color:gc(r.score) }}>{r.score}%</span></td>
                                        <td><span className={`badge ${gb(r.score)}`}>{r.grade}</span></td>
                                        <td style={{ fontSize:'0.78rem' }}>{new Date(r.submittedAt).toLocaleDateString('en-NG')}</td>
                                        <td>
                                          {r.released
                                            ? <span className="badge badge-green">✅ Released</span>
                                            : <span className="badge badge-gold">⏳ Pending</span>}
                                        </td>
                                        <td>
                                          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                                            {!r.released && (
                                              <button className="btn btn-green btn-sm" onClick={() => releaseResult(r.id)}>Release</button>
                                            )}
                                            <button className="btn btn-danger btn-sm" onClick={() => setConfirmDeleteResultId(r.id)} title="Delete result so the student can retake this exam">
                                              🗑 Retake
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ── APPLICATIONS ─────────────────────────────── */}
          {view === 'applications' && (
            <>
              <div className="page-header"><h2>Admission Applications</h2><p>Review and process incoming student applications</p></div>
              {applications.length === 0 ? (
                <div className="card" style={{ textAlign:'center', padding:'3rem' }}><div style={{ fontSize:'3rem', marginBottom:12 }}>📭</div><p style={{ color:'var(--slate-2)' }}>No applications yet.</p></div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  {applications.map((app: any) => (
                    <div key={app.id} className="card">
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', flexWrap:'wrap' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
                            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:'1.05rem', color:'var(--navy)' }}>{app.firstName} {app.lastName}</h3>
                            <span className={`badge ${app.status==='pending'?'badge-gold':app.status==='approved'?'badge-green':'badge-red'}`}>{app.status}</span>
                          </div>
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'0.4rem', fontSize:'0.8rem', color:'var(--slate)' }}>
                            <span>📚 {app.applyingForClass}</span><span>📧 {app.email}</span>
                            <span>📞 {app.phone}</span><span>📅 {new Date(app.submittedAt).toLocaleDateString()}</span>
                            <span>🏫 {app.previousSchool||'—'}</span><span>👤 {app.guardianName}</span>
                          </div>
                          {app.reasonForApplying && <p style={{ marginTop:8, fontSize:'0.8rem', color:'var(--slate-2)', fontStyle:'italic' }}>"{app.reasonForApplying}"</p>}
                          {app.status === 'approved' && app.createdStudentId && (
                            <div className="alert alert-success" style={{ marginTop:8, fontSize:'0.78rem' }}>
                              ✓ Student account created — login username: <strong>{app.createdStudentId}</strong>
                            </div>
                          )}
                        </div>
                        {app.status==='pending' && (
                          <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                            <button className="btn btn-green btn-sm" onClick={()=>updateApplicationStatus(app.id,'approved')}>✓ Approve</button>
                            <button className="btn btn-danger btn-sm" onClick={()=>updateApplicationStatus(app.id,'rejected')}>✗ Reject</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── REPORTS ──────────────────────────────────── */}
          {view === 'reports' && (
            <>
              <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2>Reports &amp; Analytics</h2>
                  <p>Live school performance summary, generated from current data</p>
                </div>
                <button className="btn btn-outline btn-sm" onClick={exportResultsCSV}>⬇ Export Results (CSV)</button>
              </div>

              {/* ── Key metrics ── */}
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-label">Students</div>
                  <div className="stat-value">{reportStats.totalStudents}</div>
                  <div className="stat-hint">{reportStats.activeStudents} active</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Avg. Score</div>
                  <div className="stat-value">{reportStats.avgScore}%</div>
                  <div className="stat-hint">across {reportStats.totalResults} result{reportStats.totalResults === 1 ? '' : 's'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Pass Rate</div>
                  <div className="stat-value">{reportStats.passRate}%</div>
                  <div className="stat-hint">scoring 50% or higher</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Results Released</div>
                  <div className="stat-value">{reportStats.releasedResults}</div>
                  <div className="stat-hint">of {reportStats.totalResults} recorded</div>
                </div>
              </div>

              <div className="grid-2">
                {/* ── Performance by class ── */}
                <div className="card">
                  <div className="card-title">📚 Performance by Class</div>
                  {classPerformance.length === 0 ? (
                    <p style={{ color: 'var(--slate-2)', fontSize: '0.85rem' }}>No results recorded yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {classPerformance.map((c) => (
                        <div key={c.cls}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 5 }}>
                            <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{c.cls}</span>
                            <span style={{ color: 'var(--slate-2)' }}>{c.studentCount} students · {c.examCount} results · <strong style={{ color: gc(c.avg) }}>{c.avg}%</strong></span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${c.avg}%`, background: gc(c.avg) }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Performance by subject ── */}
                <div className="card">
                  <div className="card-title">📖 Performance by Subject</div>
                  {subjectPerformance.length === 0 ? (
                    <p style={{ color: 'var(--slate-2)', fontSize: '0.85rem' }}>No results recorded yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {subjectPerformance.map((s) => (
                        <div key={s.subject}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 5 }}>
                            <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{s.subject}</span>
                            <span style={{ color: 'var(--slate-2)' }}>{s.count} result{s.count === 1 ? '' : 's'} · <strong style={{ color: gc(s.avg) }}>{s.avg}%</strong></span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${s.avg}%`, background: gc(s.avg) }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid-2">
                {/* ── Grade distribution ── */}
                <div className="card">
                  <div className="card-title">🎯 Grade Distribution</div>
                  {results.length === 0 ? (
                    <p style={{ color: 'var(--slate-2)', fontSize: '0.85rem' }}>No results recorded yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {gradeDistribution.map((g) => (
                        <div key={g.grade} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className={`badge ${gb(g.grade === 'A' ? 90 : g.grade === 'B' ? 65 : g.grade === 'C' ? 55 : g.grade === 'D' ? 46 : 0)}`} style={{ width: 26, justifyContent: 'center' }}>{g.grade}</span>
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div className="progress-fill" style={{ width: `${g.pct}%`, background: 'var(--navy)' }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--slate-2)', width: 64, textAlign: 'right' }}>{g.count} ({g.pct}%)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Admissions funnel ── */}
                <div className="card">
                  <div className="card-title">📋 Admissions Funnel</div>
                  {applications.length === 0 ? (
                    <p style={{ color: 'var(--slate-2)', fontSize: '0.85rem' }}>No applications submitted yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {admissionsFunnel.map((f) => (
                        <div key={f.status}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 5 }}>
                            <span style={{ fontWeight: 600, color: 'var(--navy)', textTransform: 'capitalize' }}>
                              {f.status === 'pending' ? '⏳' : f.status === 'approved' ? '✅' : '❌'} {f.status}
                            </span>
                            <span style={{ color: 'var(--slate-2)' }}>{f.count} ({f.pct}%)</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{
                              width: `${f.pct}%`,
                              background: f.status === 'approved' ? 'var(--green)' : f.status === 'rejected' ? 'var(--red)' : 'var(--gold)',
                            }} />
                          </div>
                        </div>
                      ))}
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-2)', marginTop: 4 }}>{applications.length} total application{applications.length === 1 ? '' : 's'}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid-2">
                {/* ── Top performers ── */}
                <div className="card">
                  <div className="card-title">🏆 Top Performers</div>
                  {topPerformers.length === 0 ? (
                    <p style={{ color: 'var(--slate-2)', fontSize: '0.85rem' }}>No results recorded yet.</p>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead><tr><th>Student</th><th>Class</th><th>Avg. Score</th><th>Exams</th></tr></thead>
                        <tbody>
                          {topPerformers.map((s, i) => {
                            const stu = studentById.get(s.studentId);
                            return (
                              <tr key={s.studentId}>
                                <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} {stu?.name ?? s.studentId}</td>
                                <td>{stu?.studentClass ?? '—'}</td>
                                <td><span style={{ fontWeight: 700, color: gc(s.avg) }}>{s.avg}%</span></td>
                                <td>{s.examsTaken}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* ── Needs attention ── */}
                <div className="card">
                  <div className="card-title">⚠️ Students Needing Attention</div>
                  {needsAttention.length === 0 ? (
                    <p style={{ color: 'var(--slate-2)', fontSize: '0.85rem' }}>{results.length === 0 ? 'No results recorded yet.' : 'No student is currently averaging below 50%. 🎉'}</p>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead><tr><th>Student</th><th>Class</th><th>Avg. Score</th><th>Exams</th></tr></thead>
                        <tbody>
                          {needsAttention.map((s) => {
                            const stu = studentById.get(s.studentId);
                            return (
                              <tr key={s.studentId}>
                                <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{stu?.name ?? s.studentId}</td>
                                <td>{stu?.studentClass ?? '—'}</td>
                                <td><span style={{ fontWeight: 700, color: 'var(--red)' }}>{s.avg}%</span></td>
                                <td>{s.examsTaken}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── ACCOUNT SETTINGS ─────────────────────────── */}
          {view === 'settings' && (
            <>
              <div className="page-header">
                <h2>Account Settings</h2>
                <p>Change the username and/or password you use to log in to this Admin Portal</p>
              </div>

              <div className="card" style={{ maxWidth: 480 }}>
                <div className="card-title">🔐 Change Login Credentials</div>

                {settingsError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{settingsError}</div>}
                {settingsSuccess && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{settingsSuccess}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div className="form-group">
                    <label>Current Username</label>
                    <input value={currentUser.id} disabled style={{ opacity: 0.6 }} />
                  </div>
                  <div className="form-group">
                    <label>New Username</label>
                    <input
                      placeholder="Leave blank to keep current username"
                      value={settingsForm.newId}
                      onChange={e => setSettingsField('newId', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current password"
                      value={settingsForm.newPassword}
                      onChange={e => setSettingsField('newPassword', e.target.value)}
                    />
                  </div>
                  {settingsForm.newPassword && (
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Re-enter new password"
                        value={settingsForm.confirmPassword}
                        onChange={e => setSettingsField('confirmPassword', e.target.value)}
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Current Password *</label>
                    <input
                      type="password"
                      placeholder="Required to confirm this change"
                      value={settingsForm.currentPassword}
                      onChange={e => setSettingsField('currentPassword', e.target.value)}
                    />
                    <span className="hint">For security, we need your current password before changing anything.</span>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-full"
                  style={{ marginTop: '1.25rem' }}
                  onClick={handleUpdateCredentials}
                  disabled={settingsSaving}
                >
                  {settingsSaving ? 'Saving…' : '✓ Save Changes'}
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
