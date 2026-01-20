import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/" replace />;

    const { exp } = jwtDecode(token);
    if (Date.now() >= exp * 1000) {
      localStorage.removeItem("token");
      localStorage.setItem("logout", Date.now());
      return <Navigate to="/" replace />;
    }
  }, []);
  // Not logged in
  if (!token || !userRole) {
    return <Navigate to="/" replace />;
  }

  // Role mismatch
  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
