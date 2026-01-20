import { useState } from "react";
import { login } from "../../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    localStorage.clear();

    // 🔄 loading toast
    const toastId = toast.loading("Logging in...");

    try {
      const res = await login({ email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      const roleRoutes = {
        ADMIN: "/admin",
        STUDENT: "/student-dashboard",
        FA: "/fa-dashboard",
        COURSE_INSTRUCTOR: "/instructor-dashboard",
      };

      toast.success("Login successful", { id: toastId });

      navigate(roleRoutes[res.data.role] || "/");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid email or password",
        { id: toastId }
      );
    }
  };


  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('/iitrpr.jpg')",
      }}
    >
      {/* Glass Card */}
      <div className="bg-white/20 backdrop-blur-lg border border-white/30 w-full max-w-md rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          AIMS Portal Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Institute Email"
            className="w-full px-4 py-2 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-gray-800"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-gray-800"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg transition font-semibold"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center text-white mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-gray-200 font-semibold">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}
