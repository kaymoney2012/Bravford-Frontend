import { useApp } from '../../context/AppContext';
import SCHOOL_LOGO_B64 from '../../assets/schoolLogoB64';

const features = [
  {
    icon: '📋', bg: '#FFF5F5',
    title: 'Student Registration / Admission',
    desc: "Complete a guided admission application online — personal, academic, and guardian info — and set your own portal login as you apply.",
  },
  {
    icon: '📝', bg: '#EBF5EE',
    title: 'CBT Examinations',
    desc: 'Timed computer-based tests with question navigation and proctoring safeguards. Fair, cheat-resistant, and easy on the eyes.',
  },
  {
    icon: '📊', bg: '#EDF2F7',
    title: 'Result Checking',
    desc: 'Students see grades the moment an administrator releases them, broken down by subject and exam, with full history.',
  },
  {
    icon: '🤖', bg: '#F3EEFB',
    title: 'AI Help Desk',
    desc: "Stuck on something? Our AI assistant answers questions about admissions, the portal, and school life — any time, day or night.",
  },
];

const stats = [
  { value: '350+', label: 'Enrolled Students' },
  { value: '20+', label: 'Years of Excellence' },
  { value: '40+', label: 'Teaching Staff' },
];

const testimonials = [
  { name: 'Mrs. Adebayo O.', role: 'Parent, SSS2 student', quote: 'The portal keeps me in the loop — I always know when results are released and how my daughter is doing.' },
  { name: 'Tunde A.', role: 'SSS3 student', quote: 'The CBT exams feel just like real computer-based tests. It prepared me well for JAMB practice too.' },
  { name: 'Mrs. Chukwu I.', role: 'Parent, JSS1 student', quote: 'Applying for admission online took minutes, and I got updates without having to call the school office.' },
];

const announcements = [
  { date: 'Next Term', title: 'New Academic Session Admissions Open', body: 'We are now accepting applications for JSS1–SSS3 for the upcoming session. Apply early to secure a spot.' },
  { date: 'Ongoing', title: 'CBT Mid-Term Examinations', body: 'Mid-term computer-based tests are being administered across all classes via the student portal.' },
  { date: 'New', title: '24/7 AI Help Desk Now Live', body: 'Have a question outside office hours? Chat with Bravford AI using the button in the corner of any page.' },
];

const gallery = [
  { emoji: '🏫', color: '#0B1B30' },
  { emoji: '📚', color: '#C8922A' },
  { emoji: '🔬', color: '#0F8B8D' },
  { emoji: '⚽', color: '#1B6B45' },
  { emoji: '🎓', color: '#6E4FA6' },
  { emoji: '🖥️', color: '#1d6fa4' },
];

export default function HomePage() {
  const { setPage } = useApp();

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--navy)', minHeight: '90vh',
          display: 'flex', alignItems: 'center',
          padding: '5rem 2rem', position: 'relative', overflow: 'hidden',
          backgroundImage: `url(${SCHOOL_LOGO_B64})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,27,48,0.85)' }} />

        <div style={{ position: 'relative', maxWidth: 680 }}>
          <div className="pill">🏫 Est. 2003 · Ekiti, Nigeria</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2.6rem,5vw,4.2rem)', fontWeight: 900, color: 'white', lineHeight: 1.12, marginTop: '1.25rem', marginBottom: '1.25rem' }}>
            Bringing Out <span style={{ color: 'var(--gold)' }}>The Best</span> In Your Wards.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: 520 }}>
            Bravford Assda brings five-star education to your fingertips — a digital portal for admissions,
            computer-based exams, results, and round-the-clock AI support. Enrol your wards today.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-gold btn-lg" onClick={() => setPage('register')}>
              🎓 Apply for Admission
            </button>
            <button
              onClick={() => setPage('login')}
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1.5px solid rgba(255,255,255,0.2)', padding: '13px 28px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: '0.98rem' }}
            >
              🔑 Log in to Portal
            </button>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', maxWidth: 'calc(100% - 4rem)' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.2rem', fontWeight: 900, color: 'var(--gold)' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ANNOUNCEMENTS TICKER ────────────────────── */}
      <section style={{ padding: '2.5rem 2rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">Latest Updates</div>
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Announcements</h2>
          <div className="grid-3">
            {announcements.map((a, i) => (
              <div className="announce-card" key={i}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>{a.date}</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy)', marginBottom: 6 }}>{a.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate)', lineHeight: 1.6 }}>{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">Our Platform</div>
          <h2 className="section-title">Everything Your Family Needs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.25rem', marginTop: '2.5rem' }}>
            {features.map((f, i) => (
              <div
                key={i}
                style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '1.75rem', transition: 'all 0.25s', cursor: 'default' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = 'var(--shadow-lg)'; el.style.transform = 'translateY(-4px)'; el.style.borderColor = 'rgba(200,146,42,0.4)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = ''; el.style.transform = ''; el.style.borderColor = ''; }}
              >
                <div style={{ width: 50, height: 50, borderRadius: 10, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.4rem', color: 'var(--navy)' }}>{f.title}</h3>
                <p style={{ color: 'var(--slate)', fontSize: '0.88rem', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US (teaser) ────────────────────── */}
      <section style={{ padding: '4.5rem 2rem', background: 'var(--navy)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div className="section-label">Why Bravford</div>
          <h2 className="section-title" style={{ color: '#fff' }}>Small Classes. Modern Tools. Real Results.</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 560, margin: '0.75rem auto 2rem', fontSize: '0.95rem', lineHeight: 1.75 }}>
            From individual attention in the classroom to a fully digital admissions and exam experience,
            everything at Bravford is built around your ward's success.
          </p>
          <button className="btn btn-gold btn-lg" onClick={() => setPage('about')}>Learn More About Us →</button>
        </div>
      </section>

      {/* ── GALLERY ──────────────────────────────────── */}
      <section style={{ padding: '5rem 2rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">Campus Life</div>
          <h2 className="section-title">A Glimpse of Bravford</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1rem', marginTop: '2rem' }}>
            {gallery.map((g, i) => (
              <div key={i} className="gallery-tile" style={{ background: g.color }}>{g.emoji}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────── */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">Testimonials</div>
          <h2 className="section-title">What Our Community Says</h2>
          <div className="grid-3" style={{ marginTop: '2.5rem' }}>
            {testimonials.map((t, i) => (
              <div className="testimonial-card" key={i}>
                <span className="quote-mark">"</span>
                <p style={{ fontSize: '0.9rem', color: 'var(--slate)', lineHeight: 1.7, marginBottom: '1.25rem', position: 'relative' }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.88rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-2)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT (teaser) ─────────────────────────── */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div className="card" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="card-title" style={{ border: 'none', paddingBottom: 0, marginBottom: 6 }}>📍 Visit or Reach Us</div>
            <p style={{ fontSize: '0.88rem', color: 'var(--slate)' }}>Ekiti State, Nigeria · +234-806-256-4459 · bravfordassdaschools@gmail.com</p>
          </div>
          <button className="btn btn-outline" onClick={() => setPage('contact')}>✉️ Contact Us →</button>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section style={{ padding: '4rem 2rem', background: 'var(--cream)', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 className="section-title">Ready to Join Bravford?</h2>
          <p className="section-sub" style={{ margin: '0.75rem auto 2rem' }}>Take your first of many steps toward an outstanding future.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => setPage('register')}> 🎓 Apply Now →</button>
            <button className="btn btn-outline btn-lg" onClick={() => setPage('login')}> 🔑 Log in to Portal</button>
          </div>
        </div>
      </section>
    </div>
  );
}
