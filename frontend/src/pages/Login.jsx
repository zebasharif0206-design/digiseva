import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const emptyProf = {
  full_name: "",
  experience_years: 1,
  hourly_rate: 25,
  availability: "available",
  languages_spoken: "",
  service_areas: "",
  bio: "",
  specializations: "",
  work_history: "",
  certifications: "",
  portfolio_links: "",
};

function PasswordInput({ value, onChange, placeholder, id }) {
  const [show, setShow] = useState(false);
  return (
    <div className="password-wrapper">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        id={id}
        required
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShow(!show)}
        tabIndex={-1}
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}

function getPasswordStrength(pw) {
  if (!pw) return { label: "", cls: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "Weak", cls: "pw-weak" };
  if (score <= 3) return { label: "Fair", cls: "pw-fair" };
  return { label: "Strong", cls: "pw-strong" };
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [reg, setReg] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    phone: "",
    location: "",
    user_type: "customer",
  });
  const [prof, setProf] = useState(emptyProf);
  const [regMsg, setRegMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    setBusy(true);
    try {
      const u = await login(loginForm.username.trim(), loginForm.password);
      navigate(`/${u.user_type}`);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setRegMsg(null);

    if (reg.password.length < 8) {
      setRegMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    if (reg.password !== reg.confirmPassword) {
      setRegMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    setBusy(true);
    try {
      const { confirmPassword, ...payload } = { ...reg, username: reg.username.trim() };
      if (reg.user_type === "professional") {
        payload.professional = {
          ...prof,
          experience_years: Number(prof.experience_years),
          hourly_rate: Number(prof.hourly_rate),
        };
      }
      const res = await api.register(payload);
      setRegMsg({ type: "success", text: res.message + " Please log in." });
      setTab("login");
      setLoginForm({ username: reg.username.trim(), password: "" });
    } catch (err) {
      setRegMsg({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  const setProfField = (k) => (e) => setProf({ ...prof, [k]: e.target.value });
  const setRegField = (k) => (e) => setReg({ ...reg, [k]: e.target.value });
  const strength = getPasswordStrength(reg.password);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-hero">
          <img src="/logo.svg" alt="DigiSeva" width="84" height="84" />
          <h1>DigiSeva</h1>
          <p>Connect with trusted professionals for all your home service needs</p>
        </div>

        <div className="tabs">
          <button
            className={`tab ${tab === "login" ? "active" : ""}`}
            onClick={() => setTab("login")}
          >
            Login
          </button>
          <button
            className={`tab ${tab === "register" ? "active" : ""}`}
            onClick={() => setTab("register")}
          >
            Register
          </button>
        </div>

        {tab === "login" && (
          <form className="form" onSubmit={handleLogin}>
            <h2>Login to Your Account</h2>
            {regMsg && regMsg.type === "success" && (
              <div className="alert success">{regMsg.text}</div>
            )}
            <label>Username</label>
            <input
              value={loginForm.username}
              onChange={(e) =>
                setLoginForm({ ...loginForm, username: e.target.value })
              }
              autoFocus
            />
            <label>Password</label>
            <PasswordInput
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
            />
            {loginError && <div className="alert error">{loginError}</div>}
            <button className="btn btn-primary" disabled={busy} type="submit">
              {busy ? "Signing in..." : "Login"}
            </button>
            <p className="hint">
              Try <code>admin / admin123</code>, <code>customer / customer123</code>,
              or <code>rajesh_cleaner / pass123</code>
            </p>
          </form>
        )}

        {tab === "register" && (
          <form className="form" onSubmit={handleRegister}>
            <h2>Create New Account</h2>
            {regMsg && regMsg.type === "error" && (
              <div className="alert error">{regMsg.text}</div>
            )}

            <div className="grid-2">
              <div>
                <label>Username</label>
                <input value={reg.username} onChange={setRegField("username")} required />
              </div>
              <div>
                <label>Email</label>
                <input type="email" value={reg.email} onChange={setRegField("email")} required />
              </div>
              <div>
                <label>Password</label>
                <PasswordInput value={reg.password} onChange={setRegField("password")} />
                {reg.password && (
                  <div className={`pw-strength ${strength.cls}`}>{strength.label}</div>
                )}
              </div>
              <div>
                <label>Confirm Password</label>
                <PasswordInput
                  value={reg.confirmPassword}
                  onChange={setRegField("confirmPassword")}
                />
                {reg.confirmPassword && reg.password !== reg.confirmPassword && (
                  <div className="pw-strength pw-weak">Passwords do not match</div>
                )}
              </div>
              <div>
                <label>Phone</label>
                <input value={reg.phone} onChange={setRegField("phone")} required />
              </div>
              <div>
                <label>Location</label>
                <input value={reg.location} onChange={setRegField("location")} required />
              </div>
              <div>
                <label>Account Type</label>
                <select value={reg.user_type} onChange={setRegField("user_type")}>
                  <option value="customer">Customer</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
            </div>

            {reg.user_type === "professional" && (
              <div className="prof-section">
                <h3>Professional Information</h3>
                <div className="grid-2">
                  <div>
                    <label>Full Name</label>
                    <input value={prof.full_name} onChange={setProfField("full_name")} required />
                  </div>
                  <div>
                    <label>Availability</label>
                    <select value={prof.availability} onChange={setProfField("availability")}>
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>
                  <div>
                    <label>Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={prof.experience_years}
                      onChange={setProfField("experience_years")}
                    />
                  </div>
                  <div>
                    <label>Hourly Rate (&#8377;)</label>
                    <input
                      type="number"
                      min="10"
                      max="500"
                      step="5"
                      value={prof.hourly_rate}
                      onChange={setProfField("hourly_rate")}
                    />
                  </div>
                  <div>
                    <label>Languages Spoken</label>
                    <input
                      placeholder="English, Hindi"
                      value={prof.languages_spoken}
                      onChange={setProfField("languages_spoken")}
                    />
                  </div>
                  <div>
                    <label>Service Areas</label>
                    <input
                      placeholder="Downtown, Suburbs"
                      value={prof.service_areas}
                      onChange={setProfField("service_areas")}
                    />
                  </div>
                </div>
                <label>Professional Bio</label>
                <textarea value={prof.bio} onChange={setProfField("bio")} required />
                <label>Specializations &amp; Skills</label>
                <textarea value={prof.specializations} onChange={setProfField("specializations")} />
                <label>Certifications &amp; Licenses</label>
                <textarea value={prof.certifications} onChange={setProfField("certifications")} />
              </div>
            )}

            <button className="btn btn-primary" disabled={busy} type="submit">
              {busy ? "Creating..." : "Register"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
