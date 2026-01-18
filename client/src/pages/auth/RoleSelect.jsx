import { useNavigate } from "react-router-dom";

const RoleSelect = () => {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    // store role temporarily (simple & safe for now)
    localStorage.setItem("selectedRole", role);

    // navigate to login page
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
          AIMS Portal – IIT Ropar
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Select your role to continue
        </p>

        <div className="space-y-4">
          <button
            onClick={() => handleSelect("STUDENT")}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            Student
          </button>

          <button
            onClick={() => handleSelect("FACULTY_ADVISOR")}
            className="w-full py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700"
          >
            Faculty Advisor
          </button>

          <button
            onClick={() => handleSelect("COURSE_INSTRUCTOR")}
            className="w-full py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700"
          >
            Course Instructor
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
