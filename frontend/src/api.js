// Minimal fetch wrapper for the DigiSeva API.
// Requests go to /api/* and are proxied to the FastAPI backend by Vite.

const TOKEN_KEY = "digiseva_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    if (res.status === 401 && auth) {
      setToken(null);
      localStorage.removeItem("digiseva_user");
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }
    const detail =
      (data && data.detail) ||
      (typeof data === "string" ? data : "Request failed");
    throw new Error(Array.isArray(detail) ? detail[0]?.msg || "Invalid input" : detail);
  }
  return data;
}

export const api = {
  // auth
  login: (username, password) =>
    request("/auth/login", { method: "POST", body: { username, password }, auth: false }),
  register: (payload) =>
    request("/auth/register", { method: "POST", body: payload, auth: false }),

  // services
  services: () => request("/services"),
  professionalsForService: (serviceId) =>
    request(`/services/${serviceId}/professionals`),

  // customer bookings
  book: (payload) => request("/bookings", { method: "POST", body: payload }),
  myBookings: () => request("/bookings/my"),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: "POST" }),

  // professional
  requests: () => request("/professional/requests"),
  acceptRequest: (id) =>
    request(`/professional/requests/${id}/accept`, { method: "POST" }),
  declineRequest: (id) =>
    request(`/professional/requests/${id}/decline`, { method: "POST" }),
  getProfile: () => request("/professional/profile"),
  updateProfile: (payload) =>
    request("/professional/profile", { method: "PUT", body: payload }),
  myServices: () => request("/professional/services"),
  addService: (serviceId) =>
    request(`/professional/services/${serviceId}`, { method: "POST" }),

  // admin
  adminUsers: () => request("/admin/users"),
  adminProfessionals: () => request("/admin/professionals"),
  adminStats: () => request("/admin/stats"),
};
