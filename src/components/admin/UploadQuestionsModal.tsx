import { useState, useRef } from 'react';
import type { Exam, Question } from '../../types';

interface Props {
  onClose: () => void;
  onSave:  (exam: Exam) => void;
}

/**
 * Parses a plain-text block of questions in the following format:
 *
 *   Q: What is the capital of Nigeria?
 *   A) Lagos
 *   B) Abuja*    ← asterisk marks the correct answer
 *   C) Kano
 *   D) Ibadan
 *
 * Also accepts numbered questions like "1." or "Question 1".
 */
function parseQuestionsText(raw: string): Question[] {
  const questions: Question[] = [];
  const blocks = raw
    .split(/\n(?=Q:|Question\s+\d+|^\d+[\.\)])/im)
    .map(b => b.trim())
    .filter(Boolean);

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    const qText = lines[0].replace(/^(Q:|Question\s+\d+[:\.]?|\d+[\.\)])\s*/i, '').trim();
    if (!qText) continue;

    const options: string[] = [];
    let correctAnswer = 0;

    for (let i = 1; i < lines.length; i++) {
      const line  = lines[i];
      const match = line.match(/^[A-Da-d][\)\.]\s*(.*)/);
      if (match) {
        const isCorrect = match[1].includes('*') || line.includes('*');
        const optText   = match[1].replace(/\*/g, '').trim();
        if (isCorrect) correctAnswer = options.length;
        options.push(optText);
      }
    }

    if (qText && options.length >= 2) {
      questions.push({ id: Date.now() + questions.length, text: qText, options, correctAnswer });
    }
  }
  return questions;
}

const FORMAT_EXAMPLE = `Q: What is the capital of Nigeria?
A) Lagos
B) Abuja*
C) Kano
D) Ibadan

Q: Solve: 2x + 4 = 10
A) 2
B) 3*
C) 4
D) 5`;

export default function UploadQuestionsModal({ onClose, onSave }: Props) {
  const [tab, setTab]             = useState<'file' | 'url' | 'manual'>('file');
  const [fileName, setFileName]   = useState('');
  const [fileContent, setFileContent] = useState('');
  const [url, setUrl]             = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError]   = useState('');
  const [rawText, setRawText]     = useState('');
  const [parsed, setParsed]       = useState<Question[]>([]);
  const [parseError, setParseError] = useState('');
  const [examMeta, setExamMeta]   = useState({
    title: '', subject: '', targetClass: 'ALL', durationMinutes: 30,
    useSchedule: false,
    scheduledStart: '', scheduledEnd: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── File handling ────────────────────────────────── */
  const handleFileRead = async (file: File) => {
    setFileName(file.name);
    // Try mammoth for .docx, otherwise read as text
    if (file.name.endsWith('.docx')) {
      try {
        // @ts-ignore — mammoth loaded via CDN in browser
        const mammoth = (window as any).mammoth;
        if (mammoth) {
          const buf    = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer: buf });
          setRawText(result.value);
          setFileContent(result.value);
          return;
        }
      } catch { /* fall through to text read */ }
    }
    const text = await file.text();
    setRawText(text);
    setFileContent(text);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileRead(file);
  };

  /* ── URL fetch ────────────────────────────────────── */
  const handleUrlFetch = async () => {
    if (!url.trim()) return;
    setUrlLoading(true); setUrlError('');
    try {
      const res  = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      setRawText(data.contents ?? '');
    } catch {
      setUrlError('Could not fetch from that URL. Try pasting the content into the text area below.');
    }
    setUrlLoading(false);
  };

  /* ── Parse ───────────────────────────────────────── */
  const handleParse = () => {
    const qs = parseQuestionsText(rawText);
    if (qs.length === 0) {
      setParseError(`No valid questions found. Expected format:\n${FORMAT_EXAMPLE}`);
      setParsed([]);
    } else {
      setParsed(qs);
      setParseError('');
    }
  };

  /* ── Save ────────────────────────────────────────── */
  const handleSave = () => {
    if (!examMeta.title)     { setParseError('Please enter an exam title.'); return; }
    if (!examMeta.subject)   { setParseError('Please enter a subject.');     return; }
    if (parsed.length === 0) { setParseError('Parse your questions first.'); return; }
    if (examMeta.useSchedule && !examMeta.scheduledStart) {
      setParseError('Please set a scheduled start date & time.'); return;
    }
    if (examMeta.useSchedule && examMeta.scheduledEnd && examMeta.scheduledStart &&
        new Date(examMeta.scheduledEnd) <= new Date(examMeta.scheduledStart)) {
      setParseError('End time must be after the start time.'); return;
    }

    const exam: Exam = {
      id:              `EX${String(Date.now()).slice(-5)}`,
      title:           examMeta.title,
      subject:         examMeta.subject,
      targetClass:     examMeta.targetClass,
      durationMinutes: Number(examMeta.durationMinutes),
      questions:       parsed,
      status:          'upcoming',
      createdAt:       new Date().toISOString().split('T')[0],
      instructions:    'Read each question carefully and select the best option.',
      ...(examMeta.useSchedule && examMeta.scheduledStart
        ? { scheduledStart: new Date(examMeta.scheduledStart).toISOString() } : {}),
      ...(examMeta.useSchedule && examMeta.scheduledEnd
        ? { scheduledEnd: new Date(examMeta.scheduledEnd).toISOString() }   : {}),
    };
    onSave(exam);
  };

  const meta = (k: keyof typeof examMeta, v: string) =>
    setExamMeta(p => ({ ...p, [k]: v }));

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'white', borderRadius: 'var(--r)', width: '100%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 800, fontSize: '1.3rem', color: 'var(--navy)' }}>📤 Upload Exam Questions</h3>
            <p style={{ color: 'var(--slate-2)', fontSize: '0.83rem', marginTop: 2 }}>Import from a DOCX file, a URL, or paste directly</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ Close</button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Exam meta */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div className="card-title">Exam Details</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Exam Title *</label>
                <input placeholder="e.g. Mathematics Mid-Term CBT" value={examMeta.title} onChange={e => meta('title', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <input placeholder="e.g. Mathematics" value={examMeta.subject} onChange={e => meta('subject', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Target Class</label>
                <select value={examMeta.targetClass} onChange={e => meta('targetClass', e.target.value)}>
                  <option value="ALL">All Classes</option>
                  {['JSS1','JSS2','JSS3','SSS1','SSS2','SSS3'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input type="number" min={5} max={180} value={examMeta.durationMinutes} onChange={e => meta('durationMinutes', e.target.value)} />
              </div>
            </div>
          </div>

          {/* ── SCHEDULING ───────────────────────────────────────── */}
          <div className="card" style={{ marginBottom: '1.25rem', borderColor: examMeta.useSchedule ? 'rgba(200,146,42,0.5)' : 'var(--border)' }}>
            {/* Toggle row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: examMeta.useSchedule ? '1rem' : 0 }}>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: '1rem', color: 'var(--navy)' }}>
                  ⏰ Schedule Exam Window
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-2)', marginTop: 2 }}>
                  Restrict access to a specific date & time window
                </div>
              </div>
              {/* Toggle switch */}
              <div
                onClick={() => setExamMeta(p => ({ ...p, useSchedule: !p.useSchedule }))}
                style={{ width: 48, height: 26, borderRadius: 100, background: examMeta.useSchedule ? 'var(--navy)' : 'var(--border-2)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
              >
                <div style={{ position: 'absolute', top: 3, left: examMeta.useSchedule ? 24 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
              </div>
            </div>

            {examMeta.useSchedule && (
              <>
                <div style={{ height: 1, background: 'var(--border)', marginBottom: '1rem' }} />
                <div className="form-grid">
                  <div className="form-group">
                    <label>Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={examMeta.scheduledStart}
                      onChange={e => meta('scheduledStart', e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <span style={{ fontSize: '0.76rem', color: 'var(--slate-2)' }}>Students cannot start before this time</span>
                  </div>
                  <div className="form-group">
                    <label>End Date & Time (optional)</label>
                    <input
                      type="datetime-local"
                      value={examMeta.scheduledEnd}
                      onChange={e => meta('scheduledEnd', e.target.value)}
                      min={examMeta.scheduledStart || new Date().toISOString().slice(0, 16)}
                    />
                    <span style={{ fontSize: '0.76rem', color: 'var(--slate-2)' }}>Exam auto-closes at this time</span>
                  </div>
                </div>

                {/* Preview banner */}
                {examMeta.scheduledStart && (
                  <div style={{ marginTop: '0.75rem', background: 'rgba(200,146,42,0.08)', border: '1px solid rgba(200,146,42,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', color: 'var(--navy)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>📅</span>
                    <div>
                      <strong>Window:</strong>{' '}
                      {new Date(examMeta.scheduledStart).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                      {examMeta.scheduledEnd
                        ? ` → ${new Date(examMeta.scheduledEnd).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}`
                        : ' (no end time set)'}
                      <br />
                      <span style={{ color: 'var(--slate-2)' }}>Students will see a countdown and cannot open the exam outside this window.</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Source tabs */}
          <div className="tabs">
            <button className={`tab ${tab === 'file'   ? 'active' : ''}`} onClick={() => setTab('file')}>📄 DOCX / TXT File</button>
            <button className={`tab ${tab === 'url'    ? 'active' : ''}`} onClick={() => setTab('url')}>🔗 From URL</button>
            <button className={`tab ${tab === 'manual' ? 'active' : ''}`} onClick={() => setTab('manual')}>⌨️ Type / Paste</button>
          </div>

          {/* ── FILE ── */}
          {tab === 'file' && (
            <div>
              <label
                className={`upload-zone ${fileContent ? 'active' : ''}`}
                style={{ display: 'block', cursor: 'pointer' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept=".docx,.txt,.doc" style={{ display: 'none' }} onChange={handleFileChange} />
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📁</div>
                <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>
                  {fileName || 'Click to upload or drag & drop'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-2)' }}>Supports .docx and .txt files</div>
                {fileName && <div style={{ marginTop: 8 }}><span className="badge badge-green">✓ {fileName} loaded</span></div>}
              </label>
              {fileContent && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-2)', marginBottom: 4 }}>Preview (first 400 chars):</div>
                  <div style={{ background: 'var(--cream)', borderRadius: 8, padding: '0.75rem', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--navy)', maxHeight: 120, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                    {fileContent.slice(0, 400)}…
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── URL ── */}
          {tab === 'url' && (
            <div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{ flex: 1, padding: '10px 13px', border: '1.5px solid var(--border)', borderRadius: 8, fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', outline: 'none' }}
                  placeholder="https://docs.google.com/document/…"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleUrlFetch()}
                />
                <button className="btn btn-primary" onClick={handleUrlFetch} disabled={urlLoading}>
                  {urlLoading ? 'Fetching…' : 'Fetch →'}
                </button>
              </div>
              {urlError && <div className="alert alert-error" style={{ marginTop: 8 }}>{urlError}</div>}
              <div className="alert alert-info" style={{ marginTop: 8, fontSize: '0.8rem' }}>
                💡 Works best with plain-text URLs. For Google Docs, use <strong>File → Download → Plain Text (.txt)</strong> and upload instead.
              </div>
              {rawText && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-2)', marginBottom: 4 }}>Fetched content preview:</div>
                  <div style={{ background: 'var(--cream)', borderRadius: 8, padding: '0.75rem', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--navy)', maxHeight: 120, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                    {rawText.slice(0, 400)}…
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MANUAL ── */}
          {tab === 'manual' && (
            <div className="form-group">
              <label>Paste or type your questions below</label>
              <textarea
                style={{ minHeight: 200, fontFamily: 'monospace', fontSize: '0.83rem' }}
                placeholder={FORMAT_EXAMPLE}
                value={rawText}
                onChange={e => setRawText(e.target.value)}
              />
            </div>
          )}

          {/* Format help */}
          <div style={{ marginTop: '1rem', background: 'rgba(200,146,42,0.06)', border: '1px solid rgba(200,146,42,0.2)', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--slate)' }}>
            <strong style={{ color: 'var(--navy)' }}>Required format:</strong> Start each question with <code>Q:</code>, list options as <code>A)</code> <code>B)</code> etc., mark the correct answer with <code>*</code>
            <pre style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--navy)', whiteSpace: 'pre-wrap', background: 'white', borderRadius: 6, padding: '0.5rem 0.75rem', border: '1px solid var(--border)' }}>{FORMAT_EXAMPLE}</pre>
          </div>

          {/* Parse */}
          <div style={{ display: 'flex', gap: 10, marginTop: '1.25rem', alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={handleParse} disabled={!rawText.trim()}>
              🔍 Parse Questions
            </button>
            {parsed.length > 0 && (
              <span className="badge badge-green" style={{ padding: '8px 14px' }}>
                ✓ {parsed.length} question{parsed.length !== 1 ? 's' : ''} parsed
              </span>
            )}
          </div>

          {parseError && (
            <div className="alert alert-error" style={{ marginTop: '0.75rem', whiteSpace: 'pre-wrap' }}>{parseError}</div>
          )}

          {/* Preview */}
          {parsed.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: '1rem', color: 'var(--navy)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                Preview — {parsed.length} Questions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 300, overflowY: 'auto' }}>
                {parsed.map((q, i) => (
                  <div key={i} style={{ background: 'var(--cream)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.88rem', marginBottom: 6 }}>
                      {i + 1}. {q.text}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {q.options.map((opt, oi) => (
                        <span key={oi} style={{ padding: '2px 10px', borderRadius: 100, fontSize: '0.78rem', background: oi === q.correctAnswer ? 'rgba(27,107,69,0.15)' : 'white', color: oi === q.correctAnswer ? 'var(--green)' : 'var(--slate)', border: `1px solid ${oi === q.correctAnswer ? 'rgba(27,107,69,0.3)' : 'var(--border)'}`, fontWeight: oi === q.correctAnswer ? 700 : 400 }}>
                          {String.fromCharCode(65 + oi)}. {opt} {oi === q.correctAnswer ? '✓' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button
              className="btn btn-green btn-lg"
              onClick={handleSave}
              disabled={parsed.length === 0 || !examMeta.title || !examMeta.subject}
            >
              ✓ Save Exam ({parsed.length} questions)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
