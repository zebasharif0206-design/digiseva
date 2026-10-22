import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

function Stats() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.adminStats().then(setStats);
  }, []);
  if (!stats) return <div className="spinner">Loading statistics...</div>;

  const cards = [
    { label: "Total Users", value: stats.total_users },
    { label: "Professionals", value: stats.total_professionals },
    { label: "Customers", value: stats.customers },
    { label: "Bookings", value: stats.total_bookings },
    { label: "Services", value: stats.total_services },
  ];

  return (
    <div>
      <h2>System Statistics</h2>
      <div className="metrics">
        {cards.map((c) => (
          <div className="metric" key={c.label}>
            <div className="metric-value">{c.value}</div>
            <div className="metric-label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Users() {
  const [users, setUsers] = useState(null);
  useEffect(() => {
    api.adminUsers().then(setUsers);
  }, []);
  if (!users) return <div className="spinner">Loading users...</div>;

  return (
    <div>
      <h2>All Users</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Location</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>{u.location}</td>
              <td>
                <span className={`pill ${u.user_type}`}>{u.user_type}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Professionals() {
  const [pros, setPros] = useState(null);
  useEffect(() => {
    api.adminProfessionals().then(setPros);
  }, []);
  if (!pros) return <div className="spinner">Loading professionals...</div>;

  return (
    <div>
      <h2>All Professionals</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Location</th>
            <th>Rating</th>
            <th>Experience</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {pros.map((p) => (
            <tr key={p.id}>
              <td>{p.full_name || p.username}</td>
              <td>{p.email}</td>
              <td>{p.location}</td>
              <td>{p.rating}/5.0</td>
              <td>{p.experience_years} yrs</td>
              <td>
                <span className={`status-badge ${p.availability}`}>
                  {p.availability}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [page, setPage] = useState("System Stats");

  return (
    <Layout
      nav={["System Stats", "Users Overview", "Professionals"]}
      current={page}
      onNavigate={setPage}
    >
      <h1>Admin Dashboard — {user.username}</h1>
      {page === "System Stats" && <Stats />}
      {page === "Users Overview" && <Users />}
      {page === "Professionals" && <Professionals />}
    </Layout>
  );
}
