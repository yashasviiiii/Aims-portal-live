import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoleSelect from "./pages/auth/RoleSelect.jsx";
import Login from "./pages/auth/login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import VerifyOtp from "./pages/auth/VerifyOtp.jsx";
import StudentDashboard from "./pages/student/studentDashboard.jsx";
import InstructorDashboard from "./pages/instructor/instructorDashboard.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
