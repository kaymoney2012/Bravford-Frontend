import { useApp } from '../../context/AppContext';

const timeline = [
  { year: '2003', label: 'Founded', desc: 'Bravford ASSDA opens its doors in Ekiti State with a single block of classrooms.' },
  { year: '2011', label: 'Senior School Added', desc: 'SSS1–SSS3 introduced alongside expanded science laboratories.' },
  { year: '2019', label: 'Digital Learning', desc: 'ICT lab and computer literacy became part of the core curriculum.' },
  { year: '2026', label: 'Bravford Portal Launches', desc: 'Admissions, CBT exams, results and an AI help desk move fully online.' },
];

const values = [
  { icon: '🎓', title: 'Academic Excellence', desc: 'Rigorous, well-structured teaching aligned with national curriculum standards.' },
  { icon: '🤝', title: 'Integrity', desc: 'Honesty and accountability in the classroom, on the exam, and in the community.' },
  { icon: '🌱', title: 'Growth Mindset', desc: 'Every student is capable of improvement with the right support and effort.' },
  { icon: '🛡️', title: 'Discipline & Safety', desc: 'A structured, secure environment where students can focus on learning.' },
];

const programs = [
  { icon: '🔬', title: 'Sciences', desc: 'Physics, Chemistry, Biology and Further Mathematics with well-equipped laboratories.' },
  { icon: '📐', title: 'Arts & Commercial', desc: 'Literature, Government, Economics, Accounting and Business Studies.' },
  { icon: '💻', title: 'Computer Studies', desc: 'Practical ICT literacy alongside our CBT-based examination platform.' },
  { icon: '⚽', title: 'Sports & Clubs', desc: 'Football, athletics, debate, JETS and cultural clubs for a well-rounded student.' },
];

const staff = [
  { name: 'Bravford Teacher', role: 'School Administrator', initials: 'BT' },
  { name: 'Head of Sciences', role: 'Academics — Sciences', initials: 'HS' },
  { name: 'Head of Arts', role: 'Academics — Arts & Commercial', initials: 'HA' },
  { name: 'Admissions Officer', role: 'Admissions & Records', initials: 'AO' },
];

export default function AboutPage() {
  const { setPage } = useApp();

  return (
    <div>
      {/* ── Page hero ── */}
      <section style={{ background: 'var(--grad-navy)', padding: '4.5rem 2rem 3.5rem', textAlign: 'center' }}>
        <div className="pill" style={{ marginBottom: '1rem' }}>About Bravford</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2.2rem,4vw,3.2rem)', fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>
          Learning to Excel, Since 2003
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 620, margin: '0 auto', fontSize: '1rem', lineHeight: 1.75 }}>
          Bravford ASSDA Group of Schools is a JSS1–SSS3 secondary school in Ekiti State, Nigeria,
          committed to disciplined academics, character formation, and — now — a fully digital student experience.
        </p>
      </section>

      {/* ── Mission / Vision ── */}
      <section style={{ padding: '4.5rem 2rem', background: 'white' }}>
        <div className="grid-2" style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="card">
            <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>🎯</div>
            <div className="card-title" style={{ border: 'none', marginBottom: '0.5rem', paddingBottom: 0 }}>Our Mission</div>
            <p style={{ color: 'var(--slate)', fontSize: '0.92rem', lineHeight: 1.75 }}>
              To provide affordable, high-quality secondary education that equips every student with the
              academic foundation, character, and confidence to excel in further study and in life.
            </p>
          </div>
          <div className="card">
            <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>🔭</div>
            <div className="card-title" style={{ border: 'none', marginBottom: '0.5rem', paddingBottom: 0 }}>Our Vision</div>
            <p style={{ color: 'var(--slate)', fontSize: '0.92rem', lineHeight: 1.75 }}>
              To be Ekiti State's most trusted institution for secondary education — known for academic
              excellence, strong values, and a modern, transparent learning experience for every family.
            </p>
          </div>
        </div>
      </section>

      {/* ── Core values ── */}
      <section style={{ padding: '4.5rem 2rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">What Guides Us</div>
          <h2 className="section-title">Our Core Values</h2>
          <div className="grid-3" style={{ marginTop: '2.5rem' }}>
            {values.map((v, i) => (
              <div className="card" key={i}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>{v.icon}</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy)', marginBottom: 6 }}>{v.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate)', lineHeight: 1.65 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section style={{ padding: '4.5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="section-label" style={{ textAlign: 'center' }}>Our Journey</div>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>Milestones</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {timeline.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: '1.25rem', paddingBottom: i < timeline.length - 1 ? '1.75rem' : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--grad-gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem', fontFamily: "'Cormorant Garamond',serif" }}>
                    {t.year}
                  </div>
                  {i < timeline.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', marginTop: 4 }} />}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy)', marginBottom: 4 }}>{t.label}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--slate)', lineHeight: 1.65 }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Academic programs ── */}
      <section style={{ padding: '4.5rem 2rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">Academics</div>
          <h2 className="section-title">Programs We Offer</h2>
          <div className="grid-3" style={{ marginTop: '2.5rem' }}>
            {programs.map((p, i) => (
              <div className="card" key={i}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>{p.icon}</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy)', marginBottom: 6 }}>{p.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate)', lineHeight: 1.65 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Leadership ── */}
      <section style={{ padding: '4.5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">Our People</div>
          <h2 className="section-title">Leadership &amp; Staff</h2>
          <div className="grid-3" style={{ marginTop: '2.5rem' }}>
            {staff.map((s, i) => (
              <div className="card" key={i} style={{ textAlign: 'center' }}>
                <div className="testimonial-avatar" style={{ margin: '0 auto 0.75rem', width: 56, height: 56, fontSize: '1.3rem' }}>{s.initials}</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: '1rem', color: 'var(--navy)' }}>{s.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--slate-2)', marginTop: 2 }}>{s.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '4rem 2rem', background: 'var(--cream)', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 className="section-title">Want to Learn More?</h2>
          <p className="section-sub" style={{ margin: '0.75rem auto 2rem' }}>Reach out to our admissions team or start your application today.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-gold btn-lg" onClick={() => setPage('register')}>🎓 Apply for Admission</button>
            <button className="btn btn-outline btn-lg" onClick={() => setPage('contact')}>✉️ Contact Us</button>
          </div>
        </div>
      </section>
    </div>
  );
}
