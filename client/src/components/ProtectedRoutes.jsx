import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // Not logged in
  if (!token || !userRole) {
    return <Navigate to="/login" replace />;
  }

  // Role mismatch
  if (role && userRole !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
