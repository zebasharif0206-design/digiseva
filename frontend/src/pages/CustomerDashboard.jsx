import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

function Stars({ rating }) {
  const full = Math.round(rating);
  return (
    <span className="stars">
      {"★".repeat(full)}
      {"☆".repeat(Math.max(0, 5 - full))}
    </span>
  );
}

function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="row-actions">
          <button className="btn btn-primary" onClick={onConfirm}>Confirm</button>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Spinner({ text }) {
  return <div className="spinner">{text || "Loading..."}</div>;
}

function BrowseServices() {
  const [services, setServices] = useState(null);
  const [selected, setSelected] = useState(null);
  const [pros, setPros] = useState([]);
  const [msg, setMsg] = useState(null);
  const [loadingPros, setLoadingPros] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.services().then((s) => {
      setServices(s);
      if (s.length) setSelected(s[0]);
    });
  }, []);

  useEffect(() => {
    if (selected) {
      setPros([]);
      setLoadingPros(true);
      api.professionalsForService(selected.id).then((p) => {
        setPros(p);
        setLoadingPros(false);
      });
    }
  }, [selected]);

  useEffect(() => {
    if (msg?.type === "success") {
      const t = setTimeout(() => setMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  function requestBook(professionalId, professionalName) {
    setConfirm({
      title: "Confirm Booking",
      message: professionalName
        ? `Book ${professionalName} for ${selected.name} at ₹${selected.base_price}?`
        : `Book the best available professional for ${selected.name} at ₹${selected.base_price}?`,
      onConfirm: () => doBook(professionalId),
    });
  }

  async function doBook(professionalId) {
    setConfirm(null);
    setMsg(null);
    try {
      const res = await api.book({ service_id: selected.id, professional_id: professionalId });
      setMsg({ type: "success", text: res.message });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  }

  if (services === null) return <Spinner text="Loading services..." />;

  const filtered = search
    ? services.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
      )
    : services;

  return (
    <div>
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <h2>Available Services</h2>
      <input
        className="search-input"
        type="text"
        placeholder="Search services..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="service-grid">
        {filtered.map((s) => (
          <div
            key={s.id}
            className={`service-card ${selected?.id === s.id ? "selected" : ""}`}
            onClick={() => setSelected(s)}
          >
            <h4>{s.name}</h4>
            <p>{s.description}</p>
            <div className="price">&#8377;{s.base_price}</div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="muted">No services match your search.</p>
        )}
      </div>

      {selected && (
        <div className="service-detail card">
          <div>
            <p>
              <strong>{selected.name}</strong> — {selected.description}
            </p>
            <p>
              <strong>Base Price:</strong> &#8377;{selected.base_price}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => requestBook(null, null)}>
            Book Best Available
          </button>
        </div>
      )}

      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

      <h3>Available Professionals</h3>
      {loadingPros ? (
        <Spinner text="Loading professionals..." />
      ) : pros.length === 0 ? (
        <p className="muted">No professionals currently available for this service.</p>
      ) : (
        <div className="cards">
          {pros.map((p) => (
            <div className="card pro-card" key={p.id}>
              <div className="pro-head">
                <div>
                  <div className="pro-name">{p.full_name || p.username}</div>
                  <div className="muted">
                    {p.location} &nbsp;|&nbsp; {p.phone}
                  </div>
                </div>
                <span className={`status-badge ${p.availability}`}>
                  {p.availability}
                </span>
              </div>
              {p.bio && <p className="pro-bio">{p.bio}</p>}
              <div className="pro-meta">
                <span>
                  <Stars rating={p.rating} /> {p.rating}/5.0
                </span>
                <span>{p.experience_years} yrs experience</span>
                {p.hourly_rate > 0 && <span>&#8377;{p.hourly_rate}/hr</span>}
              </div>
              {p.specializations && (
                <div className="muted small">Skills: {p.specializations}</div>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => requestBook(p.id, p.full_name || p.username)}
              >
                Book {p.full_name?.split(" ")[0] || p.username}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MyBookings() {
  const [bookings, setBookings] = useState(null);
  const [msg, setMsg] = useState(null);
  const [confirm, setConfirm] = useState(null);

  function load() {
    api.myBookings().then(setBookings);
  }
  useEffect(load, []);

  useEffect(() => {
    if (msg?.type === "success") {
      const t = setTimeout(() => setMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  function requestCancel(booking) {
    setConfirm({
      title: "Cancel Booking",
      message: `Cancel your ${booking.service_name} booking with ${booking.professional_name}?`,
      onConfirm: () => doCancel(booking.id),
    });
  }

  async function doCancel(id) {
    setConfirm(null);
    setMsg(null);
    try {
      const res = await api.cancelBooking(id);
      setMsg({ type: "success", text: res.message });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  }

  if (bookings === null) return <Spinner text="Loading bookings..." />;

  return (
    <div>
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <h2>Your Service Bookings</h2>
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}
      {bookings.length === 0 ? (
        <p className="muted">You haven't made any bookings yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Professional</th>
              <th>Status</th>
              <th>Price</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.service_name}</td>
                <td>{b.professional_name}</td>
                <td>
                  <span className={`pill ${b.status}`}>{b.status}</span>
                </td>
                <td>&#8377;{b.price}</td>
                <td>{new Date(b.booking_date).toLocaleDateString()}</td>
                <td>
                  {(b.status === "pending" || b.status === "accepted") && (
                    <button
                      className="btn btn-danger-outline"
                      onClick={() => requestCancel(b)}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [page, setPage] = useState("Browse Services");

  return (
    <Layout
      nav={["Browse Services", "My Bookings"]}
      current={page}
      onNavigate={setPage}
    >
      <h1>Welcome, {user.username}</h1>
      <p className="subtitle">Book Home Services</p>
      {page === "Browse Services" ? <BrowseServices /> : <MyBookings />}
    </Layout>
  );
}
