import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const ABOUT_SERVICES = [
  "House Cleaning",
  "Plumbing & Repairs",
  "Electrical Services",
  "Gardening & Landscaping",
  "AC Repair & Maintenance",
  "Painting Services",
  "Carpentry & Furniture",
  "Appliance Repairs",
  "Cooking Service",
];

export default function Layout({ nav, current, onNavigate, badges, children }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleNav(item) {
    onNavigate(item);
    setMenuOpen(false);
  }

  return (
    <div className="app-shell">
      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`hamburger-icon ${menuOpen ? "open" : ""}`} />
      </button>

      {menuOpen && (
        <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <img src="/logo.svg" alt="DigiSeva" width="72" height="72" />
          <div className="brand-name">DigiSeva</div>
        </div>

        {nav && (
          <nav className="nav">
            {nav.map((item) => (
              <div className="nav-item-wrap" key={item}>
                <button
                  className={`nav-item ${current === item ? "active" : ""}`}
                  onClick={() => handleNav(item)}
                  style={{ width: "100%" }}
                >
                  {item}
                </button>
                {badges?.[item] > 0 && (
                  <span className="notif-badge">{badges[item]}</span>
                )}
              </div>
            ))}
          </nav>
        )}

        <div className="about">
          <h4>About DigiSeva</h4>
          <p>
            Your trusted digital platform connecting homeowners with verified
            service professionals.
          </p>
          <p className="about-label">What We Offer</p>
          <ul>
            {ABOUT_SERVICES.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="sidebar-footer">
          <div className="signed-in">
            Signed in as <strong>{user?.username}</strong>
            <span className="role-badge">{user?.user_type}</span>
          </div>
          <button className="btn btn-ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}
