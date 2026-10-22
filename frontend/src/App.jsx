import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";
import ProfessionalDashboard from "./pages/ProfessionalDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.user_type === "customer") return <Navigate to="/customer" replace />;
  if (user.user_type === "professional") return <Navigate to="/professional" replace />;
  if (user.user_type === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/login" replace />;
}

function RequireRole({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.user_type !== role) return <HomeRedirect />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <HomeRedirect /> : <Login />} />
      <Route
        path="/customer"
        element={
          <RequireRole role="customer">
            <CustomerDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/professional"
        element={
          <RequireRole role="professional">
            <ProfessionalDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireRole role="admin">
            <AdminDashboard />
          </RequireRole>
        }
      />
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
