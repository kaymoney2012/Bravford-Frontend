import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import type { Exam, ExamResult, Grade } from '../../types';
import { saveAttempt, loadAttempt, clearAttempt, queuePendingResult, type StoredAttempt } from '../../lib/offlineExam';

type Phase = 'list' | 'instructions' | 'cbt' | 'result';

function calcGrade(score: number): Grade {
  if (score >= 70) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

/** Fisher–Yates shuffle — returns a new array, doesn't mutate the input. */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Returns a copy of the exam with its questions in a random order, and each
 * question's answer options also shuffled (with `correctAnswer` remapped to
 * match). Every student — and every attempt — gets a different arrangement,
 * which discourages answer-sharing while marking stays perfectly accurate.
 */
function shuffleExamForAttempt(exam: Exam): Exam {
  const questions = shuffle(exam.questions).map(q => {
    const optionOrder = shuffle(q.options.map((_, i) => i)); // shuffled list of original indices
    return {
      ...q,
      options: optionOrder.map(i => q.options[i]),
      correctAnswer: optionOrder.indexOf(q.correctAnswer),
    };
  });
  return { ...exam, questions };
}

/* ── Proctoring state ── */
interface ProctoringState {
  violations: number;
  warnings: string[];
  tabSwitches: number;
  fullscreenExits: number;
  autoSubmitted: boolean;
  autoSubmitReason: string;
}

const MAX_TAB_SWITCHES = 1; // auto-submit after 1 tab switch
const MAX_FULLSCREEN_EXITS = 2; // warn after each, auto-submit after 2

export default function ExamsPage() {
  const { currentUser, exams, results, addResult, isOnline, pendingSyncCount } = useApp();
  if (!currentUser || currentUser.role !== 'student') return null;

  const [phase, setPhase]           = useState<Phase>('list');
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [answers, setAnswers]       = useState<Record<number, number>>({});
  const [currentQ, setCurrentQ]     = useState(0);
  const [timeLeft, setTimeLeft]     = useState(0);
  const [startTime, setStartTime]   = useState(0);
  const [lastResult, setLastResult] = useState<ExamResult | null>(null);
  const [savedOffline, setSavedOffline] = useState(false); // true if the just-finished result was queued locally
  const [resumedFromDevice, setResumedFromDevice] = useState(false);
  const [pendingResume, setPendingResume] = useState(false); // true once the "Start" click found a saved in-progress attempt
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isResumingRef = useRef(false); // true for one render when we're restoring a saved attempt (skip resetting the clock)

  /* ── Proctoring ── */
  const [proctoring, setProctoring] = useState<ProctoringState>({
    violations: 0, warnings: [], tabSwitches: 0, fullscreenExits: 0,
    autoSubmitted: false, autoSubmitReason: '',
  });
  const [showWarningBanner, setShowWarningBanner] = useState(false);
  const [warningMsg, setWarningMsg]               = useState('');
  const [fullscreenPrompt, setFullscreenPrompt]   = useState(false);
  const proctoringActive = phase === 'cbt';
  const proctoringRef    = useRef(proctoring);
  proctoringRef.current  = proctoring;

  const attemptedIds   = new Set(results.filter(r => r.studentId === currentUser.id).map(r => r.examId));
  const availableExams = exams.filter(
    e => (e.targetClass === (currentUser as any).studentClass || e.targetClass === 'ALL') && e.status === 'active',
  );

  /* ──────────────────────────────────────────────────────────────────────────
     SUBMIT — works even if the connection drops mid-exam. Answers are already
     autosaved to this device as the student goes (see the autosave effect
     below); on submit we score locally and either send the result straight
     to the server, or — if we're offline — queue it so AppContext syncs it
     the moment the connection comes back.
  ────────────────────────────────────────────────────────────────────────── */
  const submitExam = useCallback((reason?: string) => {
    if (!activeExam) return;
    if (timerRef.current) clearInterval(timerRef.current);

    // Exit fullscreen gracefully
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch {}

    const correct   = activeExam.questions.filter((q, i) => answers[i] === q.correctAnswer).length;
    const score     = Math.round((correct / activeExam.questions.length) * 100);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const res: ExamResult = {
      id: `RES-${Date.now()}`,
      studentId: currentUser.id,
      examId: activeExam.id,
      examTitle: activeExam.title,
      subject: activeExam.subject,
      score, correctCount: correct,
      totalQuestions: activeExam.questions.length,
      grade: calcGrade(score),
      submittedAt: new Date().toISOString(),
      answers, timeTakenSeconds: timeTaken,
      released: false,
    };

    // The exam is finished either way — clear the autosaved in-progress copy.
    clearAttempt(currentUser.id);

    if (navigator.onLine) {
      addResult(res).catch(() => {
        // Network dropped right at submission — fall back to the offline queue.
        queuePendingResult(res);
        setSavedOffline(true);
      });
    } else {
      queuePendingResult(res);
      setSavedOffline(true);
    }

    setLastResult(res);
    if (reason) {
      setProctoring(p => ({ ...p, autoSubmitted: true, autoSubmitReason: reason }));
    }
    setPhase('result');
  }, [activeExam, answers, startTime, currentUser, addResult]);

  /* ──────────────────────────────────────────────────────────────────────────
     FULLSCREEN
  ────────────────────────────────────────────────────────────────────────── */
  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setFullscreenPrompt(false);
    } catch {
      setFullscreenPrompt(true);
    }
  };

  const handleFullscreenChange = useCallback(() => {
    if (!proctoringActive) return;
    if (!document.fullscreenElement) {
      const exits = proctoringRef.current.fullscreenExits + 1;
      const msg = exits >= MAX_FULLSCREEN_EXITS
        ? `⚠️ You exited fullscreen ${exits} times. Your exam is being auto-submitted.`
        : `⚠️ Fullscreen exited! (${exits}/${MAX_FULLSCREEN_EXITS} allowed). Return to fullscreen immediately.`;

      setProctoring(p => ({ ...p, fullscreenExits: exits, violations: p.violations + 1, warnings: [...p.warnings, msg] }));
      setWarningMsg(msg);
      setShowWarningBanner(true);

      if (exits >= MAX_FULLSCREEN_EXITS) {
        setTimeout(() => submitExam('Fullscreen exited too many times'), 1500);
      } else {
        setFullscreenPrompt(true);
        setTimeout(() => setShowWarningBanner(false), 5000);
      }
    }
  }, [proctoringActive, submitExam]);

  /* ──────────────────────────────────────────────────────────────────────────
     TAB / VISIBILITY CHANGE → auto-submit
  ────────────────────────────────────────────────────────────────────────── */
  const handleVisibilityChange = useCallback(() => {
    if (!proctoringActive) return;
    if (document.hidden) {
      const switches = proctoringRef.current.tabSwitches + 1;
      setProctoring(p => ({ ...p, tabSwitches: switches, violations: p.violations + 1 }));

      if (switches > MAX_TAB_SWITCHES) {
        // Already warned — auto-submit now
        submitExam('Tab switched / window changed during exam');
      } else {
        const msg = `⛔ Tab switch detected! (Warning ${switches}/${MAX_TAB_SWITCHES}). Next switch will auto-submit your exam.`;
        setProctoring(p => ({ ...p, warnings: [...p.warnings, msg] }));
        setWarningMsg(msg);
        setShowWarningBanner(true);
        setTimeout(() => setShowWarningBanner(false), 7000);
      }
    }
  }, [proctoringActive, submitExam]);

  /* ──────────────────────────────────────────────────────────────────────────
     RIGHT-CLICK + KEYBOARD SHORTCUTS block
  ────────────────────────────────────────────────────────────────────────── */
  const blockContextMenu = useCallback((e: MouseEvent) => {
    if (proctoringActive) e.preventDefault();
  }, [proctoringActive]);

  const blockKeys = useCallback((e: KeyboardEvent) => {
    if (!proctoringActive) return;
    const blocked = (
      e.key === 'F12' ||
      (e.ctrlKey && ['u', 'p', 's', 'a'].includes(e.key.toLowerCase())) ||
      (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) ||
      e.key === 'PrintScreen'
    );
    if (blocked) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [proctoringActive]);

  /* ──────────────────────────────────────────────────────────────────────────
     ATTACH / DETACH EVENT LISTENERS
  ────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockKeys);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockKeys);
    };
  }, [handleFullscreenChange, handleVisibilityChange, blockContextMenu, blockKeys]);

  /* ──────────────────────────────────────────────────────────────────────────
     TIMER — resumed attempts keep their real elapsed time (skip the reset)
     so a student can't extend their time by disconnecting and reloading.
  ────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (phase === 'cbt' && activeExam) {
      const resuming = isResumingRef.current;
      isResumingRef.current = false;
      const effectiveStart = resuming ? startTime : Date.now();
      if (!resuming) setStartTime(effectiveStart);
      const total = activeExam.durationMinutes * 60;
      const elapsed = Math.floor((Date.now() - effectiveStart) / 1000);
      setTimeLeft(Math.max(0, total - elapsed));
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { submitExam('Time expired'); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, activeExam]);

  /* ──────────────────────────────────────────────────────────────────────────
     ENTER FULLSCREEN when CBT starts
  ────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (phase === 'cbt') {
      enterFullscreen();
      // Reset proctoring state for new exam
      setProctoring({ violations: 0, warnings: [], tabSwitches: 0, fullscreenExits: 0, autoSubmitted: false, autoSubmitReason: '' });
      setShowWarningBanner(false);
    }
  }, [phase]);

  /* ──────────────────────────────────────────────────────────────────────────
     OFFLINE-RESILIENT AUTOSAVE — every answer (and page-navigation) is saved
     straight to this device, so a lost connection or an accidental reload
     never costs the student their progress.
  ────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'cbt' || !activeExam) return;
    saveAttempt({
      studentId: currentUser.id,
      examId: activeExam.id,
      exam: activeExam,
      answers,
      currentQ,
      startTime,
      savedAt: Date.now(),
    });
  }, [phase, activeExam, answers, currentQ, startTime, currentUser.id]);

  /* ──────────────────────────────────────────────────────────────────────────
     RESUME — if the student reloaded the page (or lost connection) mid-exam,
     restore exactly where they left off from this device's local storage,
     rather than losing everything and forcing a fresh, re-shuffled attempt.
  ────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'list') return;
    const saved = loadAttempt(currentUser.id);
    if (!saved) return;
    // Ignore stale attempts for exams that no longer exist, were closed, or
    // were already submitted (e.g. an admin released/queued result since).
    const stillAvailable = exams.some(e => e.id === saved.examId && e.status === 'active');
    const alreadySubmitted = attemptedIds.has(saved.examId);
    if (!stillAvailable || alreadySubmitted) {
      clearAttempt(currentUser.id);
      return;
    }
    restoreAttempt(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restoreAttempt = (saved: StoredAttempt) => {
    isResumingRef.current = true;
    setActiveExam(saved.exam);
    setAnswers(saved.answers);
    setCurrentQ(saved.currentQ);
    setStartTime(saved.startTime);
    setResumedFromDevice(true);
    setPhase('cbt');
  };

  const fmt    = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const urgent = timeLeft < 60;

  // ── Schedule helpers ─────────────────────────────────────────────────────
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const getScheduleState = (e: Exam): 'open' | 'not-yet' | 'closed' | 'unscheduled' => {
    if (!e.scheduledStart) return 'unscheduled';
    const start = new Date(e.scheduledStart).getTime();
    const end   = e.scheduledEnd ? new Date(e.scheduledEnd).getTime() : null;
    if (now < start) return 'not-yet';
    if (end && now > end) return 'closed';
    return 'open';
  };

  const fmtCountdown = (ms: number) => {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  // ─── LIST ────────────────────────────────────────────────────────────────
  if (phase === 'list') return (
    <div className="page-wrap">
      <div className="page-header">
        <h2>CBT Examinations</h2>
        <p>Computer-based tests available for {(currentUser as any).studentClass}</p>
      </div>

      {!isOnline && (
        <div className="offline-banner offline">
          <span className="offline-dot" />
          You're offline. You can still browse — if you resume an in-progress exam, your answers will keep saving to this device.
        </div>
      )}
      {isOnline && pendingSyncCount > 0 && (
        <div className="offline-banner syncing">
          <span className="offline-dot" />
          Syncing {pendingSyncCount} saved result{pendingSyncCount === 1 ? '' : 's'} to the school now…
        </div>
      )}

      {availableExams.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", marginBottom: 8 }}>No Exams Scheduled</h3>
          <p style={{ color: 'var(--slate-2)' }}>No active examinations for your class right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {availableExams.map(e => {
            const done         = attemptedIds.has(e.id);
            const schedState   = getScheduleState(e);
            const isLocked     = !done && (schedState === 'not-yet' || schedState === 'closed');
            const canStart     = !done && (schedState === 'open' || schedState === 'unscheduled');
            const msUntilStart = e.scheduledStart ? new Date(e.scheduledStart).getTime() - now : 0;

            return (
              <div key={e.id} className="card" style={{ borderColor: isLocked ? 'rgba(181,58,58,0.25)' : schedState === 'open' ? 'rgba(27,107,69,0.3)' : 'var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: '1.1rem', color: 'var(--navy)' }}>{e.title}</h3>
                      {done && <span className="badge badge-green">Submitted</span>}
                      {!done && schedState === 'open'    && <span className="badge badge-green">🟢 Open Now</span>}
                      {!done && schedState === 'not-yet' && <span className="badge badge-gold">🕐 Upcoming</span>}
                      {!done && schedState === 'closed'  && <span className="badge badge-red">🔒 Closed</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.83rem', color: 'var(--slate)' }}>
                      <span>📚 {e.subject}</span>
                      <span>⏱ {e.durationMinutes} minutes</span>
                      <span>❓ {e.questions.length} questions</span>
                      <span>🎓 {e.targetClass}</span>
                    </div>

                    {e.scheduledStart && (
                      <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--slate-2)' }}>
                        🗓 {new Date(e.scheduledStart).toLocaleString('en-NG')}
                        {e.scheduledEnd && ` → ${new Date(e.scheduledEnd).toLocaleString('en-NG')}`}
                      </div>
                    )}
                    {schedState === 'not-yet' && (
                      <div className="alert alert-info" style={{ marginTop: 10, fontSize: '0.8rem' }}>
                        ⏳ Opens in <strong>{fmtCountdown(msUntilStart)}</strong>
                      </div>
                    )}
                  </div>

                  <div style={{ flexShrink: 0 }}>
                    {done ? (
                      <span className="badge badge-navy">✓ Done</span>
                    ) : canStart ? (
                      <button className="btn btn-gold" onClick={() => {
                        const saved = loadAttempt(currentUser.id);
                        setSavedOffline(false);
                        if (saved && saved.examId === e.id) {
                          // Resume an interrupted attempt instead of reshuffling from scratch.
                          setActiveExam(saved.exam); setAnswers(saved.answers); setCurrentQ(saved.currentQ);
                          setStartTime(saved.startTime);
                          setPendingResume(true);
                          setResumedFromDevice(true);
                        } else {
                          setActiveExam(shuffleExamForAttempt(e)); setAnswers({}); setCurrentQ(0);
                          setPendingResume(false);
                          setResumedFromDevice(false);
                        }
                        setPhase('instructions');
                      }}>
                        Start →
                      </button>
                    ) : (
                      <button className="btn btn-ghost" disabled>{schedState === 'not-yet' ? '⏳ Not Yet' : '🔒 Closed'}</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ─── INSTRUCTIONS ────────────────────────────────────────────────────────
  if (phase === 'instructions' && activeExam) return (
    <div className="page-wrap" style={{ maxWidth: 680 }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>📋</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 800, fontSize: '1.75rem', color: 'var(--navy)', marginBottom: 4 }}>{activeExam.title}</h2>
        <p style={{ color: 'var(--slate-2)' }}>{activeExam.subject} · {activeExam.targetClass}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(100px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          ['⏱', `${activeExam.durationMinutes} Minutes`, 'Duration'],
          ['❓', `${activeExam.questions.length} Questions`, 'Total'],
          ['📊', 'Admin Only', 'Results'],
        ].map(([icon, val, lbl]) => (
          <div key={lbl} style={{ background: 'var(--cream)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem' }}>{icon}</div>
            <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '1.1rem', marginTop: 4 }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{lbl}</div>
          </div>
        ))}
      </div>

      <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
        <strong>Instructions:</strong><br />
        {activeExam.instructions || 'Read each question carefully. Select the best answer from the options provided. You can navigate between questions using the question panel. Submit when you have answered all questions or when time runs out.'}
      </div>

      {/* Anti-cheat notice */}
      <div style={{ background: 'rgba(181,58,58,0.06)', border: '1.5px solid rgba(181,58,58,0.25)', borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontWeight: 700, color: 'var(--red)', marginBottom: '0.6rem', fontSize: '0.9rem' }}>🛡️ Proctoring & Anti-Cheat Policy</div>
        <ul style={{ paddingLeft: '1.2rem', color: 'var(--slate)', fontSize: '0.84rem', lineHeight: 1.8, margin: 0 }}>
          <li>This exam will automatically enter <strong>Protoring Mode</strong> when you begin.</li>
          <li>Switching tabs or minimising this window will be detected.</li>
          <li>A <strong>tab switch</strong> triggers a warning; a second will <strong>auto-submit</strong> your exam.</li>
          <li>Exiting fullscreen  <strong>once</strong> will <strong>auto-submit</strong> your exam.</li>
          <li>Right-click and common shortcuts (F12, Ctrl+U, etc.) are disabled.</li>
          <li>All violations are recognized and visible to your admin.</li>
        </ul>
      </div>

      <div className="alert alert-warn">
        ⚠️ <strong>Warning:</strong> The timer starts the moment you click "Begin Exam". Do not try to close or refresh this page to avoid "Auto-Submitting".
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: '1.75rem' }}>
        <button className="btn btn-ghost" onClick={() => setPhase('list')}>← Back</button>
        <button className="btn btn-gold btn-lg" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { if (pendingResume) isResumingRef.current = true; setPhase('cbt'); }}>
          🚀 Begin Exam (Fullscreen)
        </button>
      </div>
    </div>
  );

  // ─── CBT ─────────────────────────────────────────────────────────────────
  if (phase === 'cbt' && activeExam) {
    const q        = activeExam.questions[currentQ];
    const answered = Object.keys(answers).length;

    return (
      <div style={{ userSelect: 'none' }}>
        {/* ── Violation warning banner ── */}
        {showWarningBanner && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            background: 'rgba(181,58,58,0.97)', color: 'white',
            padding: '14px 20px', textAlign: 'center',
            fontWeight: 700, fontSize: '0.92rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            {warningMsg}
            <button onClick={() => setShowWarningBanner(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
          </div>
        )}

        {/* ── Fullscreen re-entry prompt ── */}
        {fullscreenPrompt && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(13,31,53,0.96)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '1.25rem', padding: '2rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '3.5rem' }}>⛔</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", color: 'white', fontSize: '1.8rem', fontWeight: 800 }}>
              Fullscreen Required
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 400, lineHeight: 1.7 }}>
              You exited fullscreen mode. This is a proctored exam and fullscreen is mandatory.
              {proctoring.fullscreenExits >= MAX_FULLSCREEN_EXITS
                ? ' You have exceeded the allowed exits — your exam will be submitted shortly.'
                : ` You have ${MAX_FULLSCREEN_EXITS - proctoring.fullscreenExits} exit(s) remaining before auto-submit.`}
            </p>
            {proctoring.fullscreenExits < MAX_FULLSCREEN_EXITS && (
              <button className="btn btn-gold btn-lg" onClick={enterFullscreen} style={{ minWidth: 220 }}>
                🔲 Return to Fullscreen
              </button>
            )}
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>
              Violations: {proctoring.violations} · Tab switches: {proctoring.tabSwitches} · Fullscreen exits: {proctoring.fullscreenExits}
            </div>
          </div>
        )}

        <div className="page-wrap" style={{ maxWidth: 820, paddingTop: showWarningBanner ? '3.5rem' : undefined }}>
          {!isOnline && (
            <div className="offline-banner offline">
              <span className="offline-dot" />
              You're offline — your answers are saving to this device and will be submitted automatically once you're reconnected. Keep going.
            </div>
          )}
          {resumedFromDevice && isOnline && (
            <div className="offline-banner synced">
              ✓ Resumed your saved progress on this device.
            </div>
          )}
          {/* ── Exam header ── */}
          <div style={{
            background: 'var(--navy)', borderRadius: 'var(--r)',
            padding: '1.25rem 1.5rem', marginBottom: '1.25rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
          }}>
            <div>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{activeExam.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 2 }}>{answered}/{activeExam.questions.length} answered</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {/* Proctoring status pill */}
              <div style={{
                background: proctoring.violations > 0 ? 'rgba(181,58,58,0.25)' : 'rgba(27,107,69,0.25)',
                border: `1px solid ${proctoring.violations > 0 ? 'rgba(181,58,58,0.5)' : 'rgba(27,107,69,0.5)'}`,
                borderRadius: 100, padding: '4px 12px',
                fontSize: '0.72rem', fontWeight: 700,
                color: proctoring.violations > 0 ? '#FC8181' : '#68D391',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                🛡️ {proctoring.violations > 0 ? `${proctoring.violations} Violation${proctoring.violations > 1 ? 's' : ''}` : 'Proctored'}
              </div>
              {/* Timer */}
              <div style={{
                background: urgent ? 'rgba(181,58,58,0.2)' : 'rgba(200,146,42,0.2)',
                border: `1px solid ${urgent ? 'rgba(181,58,58,0.4)' : 'rgba(200,146,42,0.4)'}`,
                borderRadius: 8, padding: '8px 16px',
                color: urgent ? '#FC8181' : 'var(--gold)',
                fontWeight: 700, fontSize: '1.1rem', fontFamily: 'monospace',
              }}>
                ⏱ {fmt(timeLeft)}
              </div>
            </div>
          </div>

          {/* Question navigator */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>Question Navigator</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {activeExam.questions.map((_, i) => (
                <button key={i} onClick={() => setCurrentQ(i)}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: `2px solid ${i === currentQ ? 'var(--navy)' : answers[i] !== undefined ? 'var(--green)' : 'var(--border)'}`,
                    background: answers[i] !== undefined ? 'var(--green)' : i === currentQ ? 'var(--navy)' : 'white',
                    color: answers[i] !== undefined || i === currentQ ? 'white' : 'var(--slate)',
                    fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                  {i + 1}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--slate-2)' }}>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--green)', marginRight: 4 }} />Answered</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--border)', marginRight: 4, border: '1px solid var(--border-2)' }} />Unanswered</span>
            </div>
          </div>

          {/* Question card */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-2)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '0.75rem' }}>
              Question {currentQ + 1} of {activeExam.questions.length}
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '1.5rem', lineHeight: 1.65 }}>{q.text}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {q.options.map((opt, oi) => {
                const selected = answers[currentQ] === oi;
                return (
                  <div key={oi}
                    onClick={() => setAnswers(a => ({ ...a, [currentQ]: oi }))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '13px 16px', borderRadius: 10,
                      border: `2px solid ${selected ? 'var(--navy)' : 'var(--border)'}`,
                      background: selected ? 'rgba(13,31,53,0.05)' : 'white',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: selected ? 'var(--navy)' : 'var(--cream)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.83rem',
                      color: selected ? 'white' : 'var(--navy)', flexShrink: 0,
                    }}>
                      {String.fromCharCode(65 + oi)}
                    </div>
                    <span style={{ fontSize: '0.92rem', fontWeight: selected ? 600 : 400, color: 'var(--navy)' }}>{opt}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nav buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setCurrentQ(c => Math.max(0, c - 1))} disabled={currentQ === 0}>← Previous</button>
            {currentQ < activeExam.questions.length - 1
              ? <button className="btn btn-primary" onClick={() => setCurrentQ(c => c + 1)}>Next →</button>
              : <button className="btn btn-green btn-lg" onClick={() => submitExam()}>✓ Submit Exam</button>}
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULT ──────────────────────────────────────────────────────────────
  if (phase === 'result' && lastResult && activeExam) {
    const wasAutoSubmitted = proctoring.autoSubmitted;
    return (
      <div className="page-wrap" style={{ maxWidth: 600 }}>
        {savedOffline && (
          <div className="offline-banner syncing" style={{ marginBottom: '1.25rem' }}>
            <span className="offline-dot" />
            You were offline when you submitted — your result is saved on this device and will reach your school automatically as soon as you're back online.
          </div>
        )}
        {wasAutoSubmitted && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            ⚠️ <strong>Auto-submitted:</strong> {proctoring.autoSubmitReason}. All violations have been logged.
          </div>
        )}
        <div style={{ background: 'var(--navy)', borderRadius: 'var(--r)', padding: '2.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12 }}>
            Exam Complete — {lastResult.examTitle}
          </div>
          <div style={{ fontSize: '4rem', marginBottom: 12 }}>{wasAutoSubmitted ? '⚠️' : '✅'}</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", color: 'white', fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>
            {wasAutoSubmitted ? 'Auto-Submitted' : 'Submitted Successfully!'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.65 }}>
            Your result has been evaluated.<br />
            Results will be released by your administrator.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            {[
              ['❓', `${lastResult.totalQuestions}`, 'Questions'],
              ['⏱', `${Math.floor(lastResult.timeTakenSeconds / 60)}m ${lastResult.timeTakenSeconds % 60}s`, 'Time Taken'],
            ].map(([icon, val, lbl]) => (
              <div key={String(lbl)} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '1rem' }}>
                <div style={{ fontSize: '1.4rem' }}>{icon}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.8rem', fontWeight: 800, color: 'white', marginTop: 4 }}>{val}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
