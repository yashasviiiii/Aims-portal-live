import { useState } from "react";
import { signup } from "../../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(form);
    navigate("/verify-otp", { state: { email: form.email } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            name="firstName"
            placeholder="First Name"
            className="input"
            onChange={handleChange}
            required
          />

          <input
            name="lastName"
            placeholder="Last Name"
            className="input"
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Institute Email"
            className="input col-span-2"
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="input col-span-2"
            onChange={handleChange}
            required
          />

          <select
            name="role"
            className="input col-span-2"
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="STUDENT">Student</option>
            <option value="FA">Faculty Advisor</option>
            <option value="COURSE_INSTRUCTOR">Instructor</option>
          </select>

          <input
            name="department"
            placeholder="Department"
            className="input col-span-2"
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="col-span-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Signup & Send OTP
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
