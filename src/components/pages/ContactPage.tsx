import { useState } from 'react';
import { api, ApiError } from '../../lib/apiClient';

const faqs = [
  { q: 'How do I apply for admission?', a: 'Click "Apply for Admission" from the home page, complete the multi-step form (personal, academic, portal login, guardian info) and submit. You will receive a reference number and can log in once your application is approved.' },
  { q: 'How do I check my exam results?', a: 'Log in to the student portal and go to "Results". Results only appear once an administrator has released them for your exam.' },
  { q: 'I forgot my portal password — what do I do?', a: 'Contact the school office using the form below, or call us directly, and an administrator will reset it for you.' },
  { q: 'Can I retake an exam?', a: "If an administrator clears your previous result for a retake, the exam will reappear as available in your portal." },
  { q: 'What happens if my internet disconnects during an exam?', a: 'Your answers are saved on your device as you go. If you lose connection, keep answering normally — everything is submitted automatically the moment your connection is restored.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-question" onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        <span style={{ transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s', color: 'var(--gold)', fontSize: '1.2rem', flexShrink: 0 }}>+</span>
      </button>
      {open && <div className="faq-answer">{a}</div>}
    </div>
  );
}

const EMPTY = { name: '', email: '', phone: '', subject: 'General Enquiry', message: '' };

export default function ContactPage() {
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof EMPTY, v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in your name, email and message.');
      return;
    }
    setSending(true);
    setError('');
    try {
      await api.post('/contact', form);
      setSent(true);
      setForm(EMPTY);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* ── Page hero ── */}
      <section style={{ background: 'var(--grad-navy)', padding: '4.5rem 2rem 3.5rem', textAlign: 'center' }}>
        <div className="pill" style={{ marginBottom: '1rem' }}>Get In Touch</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2.2rem,4vw,3.2rem)', fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>
          We'd Love to Hear From You
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 560, margin: '0 auto', fontSize: '1rem', lineHeight: 1.75 }}>
          Questions about admissions, the student portal, or anything else — reach out and our team will respond promptly.
        </p>
      </section>

      {/* ── Contact info + form ── */}
      <section style={{ padding: '4.5rem 2rem', background: 'white' }}>
        <div className="grid-2" style={{ maxWidth: 1000, margin: '0 auto', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card">
              <div className="card-title" style={{ border: 'none', marginBottom: '0.5rem', paddingBottom: 0 }}>📍 Address</div>
              <p style={{ color: 'var(--slate)', fontSize: '0.9rem' }}>Bravford ASSDA Group of Schools, Ekiti State, Nigeria</p>
            </div>
            <div className="card">
              <div className="card-title" style={{ border: 'none', marginBottom: '0.5rem', paddingBottom: 0 }}>📞 Phone</div>
              <p style={{ color: 'var(--slate)', fontSize: '0.9rem' }}>+234-806-256-4459</p>
            </div>
            <div className="card">
              <div className="card-title" style={{ border: 'none', marginBottom: '0.5rem', paddingBottom: 0 }}>📧 Email</div>
              <p style={{ color: 'var(--slate)', fontSize: '0.9rem' }}>bravfordassdaschools@gmail.com</p>
            </div>
            <div className="card">
              <div className="card-title" style={{ border: 'none', marginBottom: '0.5rem', paddingBottom: 0 }}>🕐 Office Hours</div>
              <p style={{ color: 'var(--slate)', fontSize: '0.9rem' }}>Monday – Friday, 8:00am – 4:00pm</p>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Send Us a Message</div>
            {sent ? (
              <div className="alert alert-success">
                ✓ Thank you — your message has been sent. Our team will get back to you shortly.
                <div style={{ marginTop: 10 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setSent(false)}>Send another message</button>
                </div>
              </div>
            ) : (
              <>
                {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
                <div className="form-grid">
                  <div className="form-group"><label>Full Name *</label><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" /></div>
                  <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" /></div>
                  <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="080XXXXXXXX" /></div>
                  <div className="form-group">
                    <label>Subject</label>
                    <select value={form.subject} onChange={e => set('subject', e.target.value)}>
                      <option>General Enquiry</option>
                      <option>Admissions</option>
                      <option>Student Portal Support</option>
                      <option>Fees</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="form-group full">
                    <label>Message *</label>
                    <textarea rows={5} value={form.message} onChange={e => set('message', e.target.value)} placeholder="How can we help?" />
                  </div>
                </div>
                <button className="btn btn-primary btn-full" style={{ marginTop: '1.25rem' }} onClick={submit} disabled={sending}>
                  {sending ? 'Sending…' : '✉️ Send Message'}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Map placeholder ── */}
      <section style={{ padding: '0 2rem 4.5rem', background: 'white' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', borderRadius: 'var(--r)', overflow: 'hidden', minHeight: 260, background: 'var(--grad-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
          🗺️ Campus map — add your Google Maps embed here
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '4.5rem 2rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="section-label" style={{ textAlign: 'center' }}>Questions</div>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
          <div className="card">
            {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--slate-2)', fontSize: '0.85rem' }}>
            Still have questions? Use the 💬 <strong>Bravford AI</strong> chat button in the corner of the screen for an instant answer.
          </p>
        </div>
      </section>
    </div>
  );
}
