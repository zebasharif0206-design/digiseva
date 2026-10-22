import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

function Spinner({ text }) {
  return <div className="spinner">{text || "Loading..."}</div>;
}

function ServiceRequests({ onCountChange }) {
  const [requests, setRequests] = useState(null);
  const [msg, setMsg] = useState(null);

  function load() {
    api.requests().then((r) => {
      setRequests(r);
      const pending = r.filter((x) => x.status === "pending").length;
      onCountChange(pending);
    });
  }
  useEffect(load, []);

  useEffect(() => {
    if (msg?.type === "success") {
      const t = setTimeout(() => setMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  async function act(id, accept) {
    try {
      if (accept) await api.acceptRequest(id);
      else await api.declineRequest(id);
      setMsg({ type: "success", text: accept ? "Request accepted" : "Request declined" });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  }

  if (requests === null) return <Spinner text="Loading requests..." />;

  return (
    <div>
      <h2>Incoming Service Requests</h2>
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}
      {requests.length === 0 ? (
        <p className="muted">No service requests at the moment.</p>
      ) : (
        <div className="cards">
          {requests.map((r) => (
            <div className="card" key={r.id}>
              <div className="pro-head">
                <div>
                  <div className="pro-name">{r.service_name}</div>
                  <div className="muted">Customer: {r.customer_name}</div>
                  <div className="muted small">&#8377;{r.price}</div>
                </div>
                <span className={`pill ${r.status}`}>{r.status}</span>
              </div>
              {r.status === "pending" && (
                <div className="row-actions">
                  <button className="btn btn-primary" onClick={() => act(r.id, true)}>
                    Accept
                  </button>
                  <button className="btn btn-ghost" onClick={() => act(r.id, false)}>
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState(null);

  function load() {
    api.getProfile().then((p) => {
      setProfile(p);
      setForm(p);
    });
  }
  useEffect(load, []);

  useEffect(() => {
    if (msg?.type === "success") {
      const t = setTimeout(() => setMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function save(e) {
    e.preventDefault();
    setMsg(null);
    try {
      const payload = {
        full_name: form.full_name || "",
        bio: form.bio || "",
        specializations: form.specializations || "",
        certifications: form.certifications || "",
        work_history: form.work_history || "",
        portfolio_links: form.portfolio_links || "",
        hourly_rate: Number(form.hourly_rate) || 0,
        service_areas: form.service_areas || "",
        languages_spoken: form.languages_spoken || "",
        experience_years: Number(form.experience_years) || 0,
        availability: form.availability || "available",
      };
      const res = await api.updateProfile(payload);
      setMsg({ type: "success", text: res.message });
      setEditing(false);
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  }

  if (!profile) return <Spinner text="Loading profile..." />;

  if (!editing) {
    return (
      <div>
        <h2>Professional Profile</h2>
        {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}
        <div className="card profile-view">
          <div className="grid-2">
            <p><strong>Full Name:</strong> {profile.full_name || "Not set"}</p>
            <p><strong>Experience:</strong> {profile.experience_years} years</p>
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Rating:</strong> {profile.rating}/5.0</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Hourly Rate:</strong> &#8377;{profile.hourly_rate}</p>
            <p><strong>Phone:</strong> {profile.phone}</p>
            <p><strong>Availability:</strong> {profile.availability}</p>
            <p><strong>Location:</strong> {profile.location}</p>
            <p><strong>Languages:</strong> {profile.languages_spoken || "—"}</p>
          </div>
          <p><strong>Bio:</strong> {profile.bio || "No bio provided"}</p>
          <p><strong>Specializations:</strong> {profile.specializations || "—"}</p>
          <p><strong>Service Areas:</strong> {profile.service_areas || "—"}</p>
          {profile.certifications && (
            <p><strong>Certifications:</strong> {profile.certifications}</p>
          )}
          {profile.work_history && (
            <p><strong>Work History:</strong> {profile.work_history}</p>
          )}
          {profile.portfolio_links && (
            <p><strong>Portfolio:</strong> {profile.portfolio_links}</p>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => setEditing(true)}>
          Edit Profile
        </button>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={save}>
      <h2>Edit Profile</h2>
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}
      <div className="grid-2">
        <div>
          <label>Full Name</label>
          <input value={form.full_name || ""} onChange={set("full_name")} />
        </div>
        <div>
          <label>Availability</label>
          <select value={form.availability || "available"} onChange={set("availability")}>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
        <div>
          <label>Years of Experience</label>
          <input type="number" min="0" max="50" value={form.experience_years || 0} onChange={set("experience_years")} />
        </div>
        <div>
          <label>Hourly Rate (&#8377;)</label>
          <input type="number" min="0" step="5" value={form.hourly_rate || 0} onChange={set("hourly_rate")} />
        </div>
        <div>
          <label>Languages Spoken</label>
          <input value={form.languages_spoken || ""} onChange={set("languages_spoken")} />
        </div>
        <div>
          <label>Service Areas</label>
          <input value={form.service_areas || ""} onChange={set("service_areas")} />
        </div>
      </div>
      <label>Bio</label>
      <textarea value={form.bio || ""} onChange={set("bio")} />
      <label>Specializations</label>
      <textarea value={form.specializations || ""} onChange={set("specializations")} />
      <label>Certifications</label>
      <textarea value={form.certifications || ""} onChange={set("certifications")} />
      <label>Work History</label>
      <textarea value={form.work_history || ""} onChange={set("work_history")} />
      <label>Portfolio Links</label>
      <textarea value={form.portfolio_links || ""} onChange={set("portfolio_links")} />
      <div className="row-actions">
        <button className="btn btn-primary" type="submit">Update Profile</button>
        <button className="btn btn-ghost" type="button" onClick={() => setEditing(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function ManageServices() {
  const [mine, setMine] = useState([]);
  const [all, setAll] = useState([]);
  const [pick, setPick] = useState("");
  const [msg, setMsg] = useState(null);

  function load() {
    api.myServices().then(setMine);
    api.services().then((s) => {
      setAll(s);
      if (s.length) setPick(String(s[0].id));
    });
  }
  useEffect(load, []);

  useEffect(() => {
    if (msg?.type === "success") {
      const t = setTimeout(() => setMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  async function add() {
    setMsg(null);
    try {
      const res = await api.addService(Number(pick));
      setMsg({ type: "success", text: res.message });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  }

  return (
    <div>
      <h2>My Services</h2>
      {mine.length === 0 ? (
        <p className="muted">You don't offer any services yet.</p>
      ) : (
        <ul className="chip-list">
          {mine.map((s) => (
            <li className="chip" key={s.id}>{s.name}</li>
          ))}
        </ul>
      )}

      <h3>Add a Service</h3>
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}
      <div className="field-row">
        <select value={pick} onChange={(e) => setPick(e.target.value)}>
          {all.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={add}>Add Service</button>
      </div>
    </div>
  );
}

export default function ProfessionalDashboard() {
  const { user } = useAuth();
  const [page, setPage] = useState("Service Requests");
  const [pendingCount, setPendingCount] = useState(0);

  const navItems = ["Service Requests", "My Profile", "My Services"];
  const badges = { "Service Requests": pendingCount };

  return (
    <Layout
      nav={navItems}
      current={page}
      onNavigate={setPage}
      badges={badges}
    >
      <h1>Professional Dashboard</h1>
      <p className="subtitle">Welcome, {user.full_name || user.username}</p>
      {page === "Service Requests" && <ServiceRequests onCountChange={setPendingCount} />}
      {page === "My Profile" && <Profile />}
      {page === "My Services" && <ManageServices />}
    </Layout>
  );
}
