import { useState } from "react";
import { loginUser } from "../../api/auth";

const Login = () => {
  const role = localStorage.getItem("selectedRole");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const data = await loginUser(email, password);

    try {
    const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    
    // SAVE BOTH TOKEN AND EMAIL
    localStorage.setItem("token", res.data.token); 
    localStorage.setItem("userEmail", email); // This is the backup for the dashboard
    
    navigate("/student-dashboard");
  } catch (err) {
    console.error("Login failed", err);
  }

    if (data.message === "Login successful") {
      if (data.role === "STUDENT") {
        window.location.href = "/student-dashboard";
      } else if (data.role === "FA") {
        window.location.href = "/fa-dashboard";
      } else if (data.role === "COURSE_INSTRUCTOR") {
        window.location.href = "/instructor-dashboard";
      }
    } else {
      alert(data.message);
    }

    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-bold text-center text-blue-600 mb-2">
          Login
        </h2>

        {role && (
          <p className="text-center text-sm text-gray-500 mb-6">
            Logging in as:{" "}
            <span className="font-semibold">
              {role.replace("_", " ")}
            </span>
          </p>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Institute Email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>

      </div>
    </div>
  );
};

export default Login;
