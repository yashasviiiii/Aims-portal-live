import { useState } from "react";
import { signup } from "../../api/auth";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Signup() {

  const DEPARTMENTS = [
    "Computer Science and Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Artificial Intelligence",
    "Chemical Engineering",
    "Humanities and Social Science"
  ];
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const isInstituteEmail = (email) =>
  email.endsWith("@iitrpr.ac.in");

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Institute email check
  if (!isInstituteEmail(form.email)) {
    toast.error("Only @iitrpr.ac.in emails allowed");
    return;
  }

  // Optional: student email format check
  if (form.role === "STUDENT") {
    const local = form.email.split("@")[0];
    if (!/^\d{4}/.test(local)) {
      toast.error("Student email must start with admission year");
      return;
    }
  }

  const toastId = toast.loading("Creating account...");

  try {
    await signup(form);
    toast.success("OTP sent to institute email", { id: toastId });
    navigate("/verify-otp", { state: { email: form.email } });
  } catch (err) {
    toast.error(
      err.response?.data?.message || "Signup failed",
      { id: toastId }
    );
  }
};


  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/iitrpr.jpg')" }}
    >
      {/* Glass Card */}
      <div className="bg-white/20 backdrop-blur-lg border border-white/30 w-full max-w-lg rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            name="firstName"
            placeholder="First Name"
            className="input bg-white/80"
            onChange={handleChange}
            required
          />

          <input
            name="lastName"
            placeholder="Last Name"
            className="input bg-white/80"
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Institute Email"
            className="input bg-white/80 col-span-2"
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="input bg-white/80 col-span-2"
            onChange={handleChange}
            required
          />

          <select
            name="role"
            className="input bg-white/80 col-span-2"
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="STUDENT">Student</option>
            <option value="FA">Faculty Advisor</option>
            <option value="COURSE_INSTRUCTOR">Instructor</option>
          </select>

          <select
            name="department"
            className="input bg-white/80 col-span-2"
            onChange={handleChange}
            required
          >
            <option value="">Select Department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <button
            type="submit"
            className="col-span-2 bg-black text-white py-2 rounded-lg transition font-semibold"
          >
            Signup
          </button>
        </form>

        <p className="text-sm text-center text-white mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-gray-200 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
