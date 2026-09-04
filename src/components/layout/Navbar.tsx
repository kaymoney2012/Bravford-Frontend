import { useState } from "react";
import { useApp } from "../../context/AppContext";
import type { PageName } from "../../types";
import SchoolLogo from "./SchoolLogo";

export default function Navbar() {
  const { currentUser, page, setPage, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (p: PageName) => {
    setPage(p);
    setMenuOpen(false);
  };

  const linkStyle = (p: PageName): React.CSSProperties => ({
    background: "none",
    border: "none",
    color: page === p ? "var(--gold)" : "rgba(255,255,255,0.7)",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "Outfit, sans-serif",
    fontSize: "0.85rem",
    fontWeight: 600,
    backgroundColor: page === p ? "rgba(200,146,42,0.18)" : "transparent",
    transition: "all 0.2s",
    display: "block",
    textAlign: "left",
    width: "100%",
  });

  const studentLinks = [
    { p: "dashboard" as PageName, label: "🏠 Dashboard" },
    { p: "exams" as PageName, label: "📝 CBT Exams" },
    { p: "results" as PageName, label: "📊 Results" },
  ];

  return (
    <>
      {!currentUser && (
        <div className="topbar">
          <div className="topbar-inner">
            <span>📞 +234-806-256-4459</span>
            <span>📧 bravfordassdaschools@gmail.com</span>
            <span style={{ marginLeft: "auto" }}>Mon–Fri · 8:00am–4:00pm</span>
          </div>
        </div>
      )}
      <nav
        style={{
          background: "var(--navy)",
          height: "var(--nav-h)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1rem",
          position: "sticky",
          top: 0,
          zIndex: 200,
          boxShadow: "0 2px 20px rgba(0,0,0,0.25)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            cursor: "pointer",
            flexShrink: 0,
          }}
          onClick={() => go("home")}
        >
          <div
            style={{
              width: 38,
              height: 38,
              background: "rgba(200,146,42,0.12)",
              border: "1.5px solid rgba(200,146,42,0.4)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <SchoolLogo size={30} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                color: "white",
                fontSize: "0.95rem",
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              Bravford ASSDA Group Of School
            </div>
            <div
              style={{
                color: "var(--gold)",
                fontSize: "0.52rem",
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Learning to Excel
            </div>
          </div>
        </div>

        {/* Desktop nav links */}
        <div
          style={{ display: "flex", gap: 2, alignItems: "center", width: "29%" }}
          className="desktop-nav"
        >
          <style>{`.desktop-nav{display:none!important;}@media(min-width:640px){.desktop-nav{display:flex!important;}}`}</style>
          {!currentUser ? (
            <>
              <button
                style={{
                  ...linkStyle("home"),
                  fontSize: "12px",
                }}
                onClick={() => go("home")}
              >
                Home
              </button>
              <button
                style={{
                  ...linkStyle("about"),
                  fontSize: "12px",
                }}
                onClick={() => go("about")}
              >
                About Us
              </button>
              <button
                style={{
                  ...linkStyle("register"),
                  fontSize: "12px",
                }}
                onClick={() => go("register")}
              >
                Admission
              </button>
              <button
                style={{
                  ...linkStyle("contact"),
                  fontSize: "12px",
                }}
                onClick={() => go("contact")}
              >
                Contact Us
              </button>
            </>
          ) : currentUser.role === "admin" ? (
            <button style={linkStyle("admin")} onClick={() => go("admin")}>
              Admin Portal
            </button>
          ) : (
            studentLinks.map((l) => (
              <button key={l.p} style={linkStyle(l.p)} onClick={() => go(l.p)}>
                {l.label}
              </button>
            ))
          )}
        </div>

        {/* Desktop auth */}
        <div
          style={{ display: "flex", gap: 7, alignItems: "center" }}
          className="desktop-auth"
        >
          <style>{`.desktop-auth{display:none!important;}@media(min-width:640px){.desktop-auth{display:flex!important;}}`}</style>
          {currentUser ? (
            <>
              <span
                style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem" }}
              >
                👤 {currentUser.name.split(" ")[0]}
              </span>
              <button
                className="btn btn-outline btn-sm"
                style={{
                  color: "rgba(255,255,255,0.8)",
                  borderColor: "rgba(255,255,255,0.25)",
                }}
                onClick={logout}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-outline btn-sm"
                style={{
                  color: "rgba(255,255,255,0.8)",
                  borderColor: "rgba(255,255,255,0.25)",
                }}
                onClick={() => go("login")}
              >
                Sign In
              </button>
              <button
                className="btn btn-gold btn-sm"
                onClick={() => go("register")}
              >
                Apply Now
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            padding: 8,
            fontSize: "1.3rem",
            flexShrink: 0,
          }}
          className="mobile-hamburger"
        >
          <style>{`.mobile-hamburger{display:block!important;}@media(min-width:640px){.mobile-hamburger{display:none!important;}}`}</style>
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: "var(--nav-h)",
            left: 0,
            right: 0,
            background: "var(--navy)",
            zIndex: 190,
            padding: "0.75rem 1rem 1rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          {!currentUser ? (
            <>
              <button style={linkStyle("home")} onClick={() => go("home")}>
                🏠 Home
              </button>
              <button style={linkStyle("about")} onClick={() => go("about")}>
                ℹ️ About Us
              </button>
              <button
                style={linkStyle("register")}
                onClick={() => go("register")}
              >
                🎓 Admission
              </button>
              <button
                style={linkStyle("contact")}
                onClick={() => go("contact")}
              >
                ✉️ Contact Us
              </button>
              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.1)",
                  margin: "0.5rem 0",
                }}
              />
              <button style={linkStyle("login")} onClick={() => go("login")}>
                🔑 Sign In
              </button>
              <button
                className="btn btn-gold btn-sm"
                style={{ width: "100%", marginTop: 6 }}
                onClick={() => go("register")}
              >
                Apply Now
              </button>
            </>
          ) : currentUser.role === "admin" ? (
            <>
              <button style={linkStyle("admin")} onClick={() => go("admin")}>
                🛡️ Admin Portal
              </button>
              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.1)",
                  margin: "0.5rem 0",
                }}
              />
              <button
                style={{
                  ...linkStyle("home"),
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.82rem",
                }}
                onClick={logout}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              {studentLinks.map((l) => (
                <button
                  key={l.p}
                  style={linkStyle(l.p)}
                  onClick={() => go(l.p)}
                >
                  {l.label}
                </button>
              ))}
              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.1)",
                  margin: "0.5rem 0",
                }}
              />
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.4)",
                  padding: "4px 12px",
                  marginBottom: 4,
                }}
              >
                👤 {currentUser.name}
              </div>
              <button
                style={{
                  ...linkStyle("home"),
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.82rem",
                }}
                onClick={logout}
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
