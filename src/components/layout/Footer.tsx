import { useApp } from '../../context/AppContext';
import type { PageName } from '../../types';
import SchoolLogo from './SchoolLogo';

export default function Footer() {
  const { setPage, currentUser } = useApp();
  const go = (p: PageName) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <footer style={{ background: 'var(--navy)', color: 'rgba(255,255,255,0.55)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3.5rem 2rem 2.5rem', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr', gap: '2.5rem' }} className="footer-grid">
        <style>{`.footer-grid{grid-template-columns:1fr!important;}@media(min-width:640px){.footer-grid{grid-template-columns:1.4fr 1fr 1fr!important;}}@media(min-width:900px){.footer-grid{grid-template-columns:1.4fr 1fr 1fr 1.2fr!important;}}`}</style>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
            <div style={{ width: 36, height: 36, background: 'rgba(200,146,42,0.12)', border: '1.5px solid rgba(200,146,42,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <SchoolLogo size={28} />
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", color: 'white', fontWeight: 700, fontSize: '1rem' }}>Bravford ASSDA</div>
          </div>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 280 }}>
            A JSS1–SSS3 secondary school in Ekiti State, Nigeria, committed to academic excellence and character formation.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: '1.25rem' }}>
            {['Facebook', 'X', 'Instagram'].map((s) => (
              <div key={s} title={s} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)' }}>
                {s.charAt(0)}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="footer-heading">Quick Links</div>
          <ul className="footer-list">
            <li><button onClick={() => go('home')}>Home</button></li>
            <li><button onClick={() => go('about')}>About Us</button></li>
            <li><button onClick={() => go('register')}>Admissions</button></li>
            <li><button onClick={() => go('contact')}>Contact Us</button></li>
            {!currentUser && <li><button onClick={() => go('login')}>Portal Login</button></li>}
          </ul>
        </div>

        <div>
          <div className="footer-heading">Academics</div>
          <ul className="footer-list">
            <li><span>Sciences</span></li>
            <li><span>Arts &amp; Commercial</span></li>
            <li><span>Computer Studies</span></li>
            <li><span>Sports &amp; Clubs</span></li>
          </ul>
        </div>

        <div>
          <div className="footer-heading">Contact</div>
          <ul className="footer-list" style={{ gap: 10 }}>
            <li style={{ display: 'block' }}><span>📍 Ekiti State, Nigeria</span></li>
            <li style={{ display: 'block' }}><span>📞 +234-806-256-4459</span></li>
            <li style={{ display: 'block' }}><span>📧 bravfordassdaschools@gmail.com</span></li>
            <li style={{ display: 'block' }}><span>🕐 Mon–Fri, 8:00am–4:00pm</span></li>
          </ul>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 2rem', textAlign: 'center', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
        © {new Date().getFullYear()} Bravford ASSDA Group of Schools · All Rights Reserved
      </div>
    </footer>
  );
}
