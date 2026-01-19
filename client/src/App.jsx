import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoutes.jsx";
import Login from "./pages/auth/login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import VerifyOtp from "./pages/auth/VerifyOtp.jsx";
import StudentDashboard from "./pages/student/studentDashboard.jsx";
import InstructorDashboard from "./pages/instructor/instructorDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/instructor-dashboard" element={ <InstructorDashboard />} />
        <Route path="/admin" element={<ProtectedRoute role="ADMIN"> <AdminDashboard /> </ProtectedRoute> }/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
