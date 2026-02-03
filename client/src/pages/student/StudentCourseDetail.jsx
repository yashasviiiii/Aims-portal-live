import { useEffect, useState } from "react";
import axios from "axios";

const StudentCourseDetail = ({ course, onBack }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseInfo, setCourseInfo] = useState(null);
  const c = courseInfo || course; // always use populated data when available
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
  try {
    const res = await axios.get(
      `/api/student/course-students/${course._id}`,
      config
    );

    setCourseInfo(res.data.course);   // ✅ NEW
    setStudents(res.data.students);   // existing

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700";
      case "pending_instructor": return "bg-amber-100 text-amber-700";
      case "pending_fa": return "bg-purple-100 text-purple-700";
      case "withdrawn": return "bg-red-100 text-red-700";
      case "dropped": return "bg-gray-200 text-gray-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  const filteredStudents = students;



  return (
  <div className="animate-fadeIn">

    {/* Back */}
    <button
      onClick={onBack}
      className="text-indigo-600 font-bold mb-6 hover:underline"
    >
      ← Back to Courses
    </button>


    {/* ================= COURSE HEADER ================= */}
    <div className="bg-white p-6 rounded-xl shadow border mb-8">

      <h2 className="text-xl font-bold text-indigo-900 mb-4">
        {c.courseCode} — {c.courseName}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">

        <div>
          <p className="text-gray-400 text-xs">Department</p>
          <p className="font-semibold">{c.offeringDept}</p>
        </div>

        <div>
          <p className="text-gray-400 text-xs">Credits</p>
          <p className="font-semibold">{c.credits}</p>
        </div>

        <div>
          <p className="text-gray-400 text-xs">Slot</p>
          <p className="font-semibold">{c.slot}</p>
        </div>

        <div>
          <p className="text-gray-400 text-xs">Session</p>
          <p className="font-semibold">{c.session}</p>
        </div>
      </div>

      {/* Instructors */}
      <div className="mt-5">
        <p className="text-xs font-bold text-gray-500 mb-2">Instructors</p>

        <div className="flex flex-wrap gap-2">
          {c.instructors?.map((i, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 rounded-full text-xs font-semibold border
                ${i.isCoordinator
                  ? "bg-green-100 text-green-700 border-green-300"
                  : "bg-gray-100 text-gray-700 border-gray-300"
                }`}
            >
              {i.instructorId?.firstName} {i.instructorId?.lastName}
              {i.isCoordinator && " (Coordinator)"}
            </span>
          ))}
        </div>
      </div>
    </div>


    {/* ================= STUDENTS TABLE ================= */}
    <div className="bg-white rounded-xl shadow border overflow-x-auto">

      <table className="w-full text-sm">

        <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
          <tr>
            <th className="p-3">#</th>
            <th className="p-3 text-left">Roll</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-center">Dept</th>
            <th className="p-3 text-center">Year</th>
            <th className="p-3 text-center">Status</th>
          </tr>
        </thead>

        <tbody>
          {filteredStudents.map((enroll, i) => {
            const s = enroll.studentId;

            return (
              <tr key={enroll._id} className="border-t hover:bg-indigo-50">

                <td className="p-3 text-gray-400">{i + 1}</td>

                <td className="p-3 font-mono">
                  {s.email.split("@")[0]}
                </td>

                <td className="p-3 font-semibold">
                  {s.firstName} {s.lastName}
                </td>

                <td className="p-3 text-center">{s.department}</td>

                <td className="p-3 text-center">{s.year}</td>

                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold border
                    ${enroll.status === "approved" && "bg-green-100 text-green-700"}
                    ${enroll.status === "pending_instructor" && "bg-amber-100 text-amber-700"}
                    ${enroll.status === "pending_fa" && "bg-purple-100 text-purple-700"}
                    ${enroll.status === "dropped" && "bg-red-100 text-red-700"}
                    ${enroll.status === "withdrawn" && "bg-yellow-100 text-yellow-700"}
                  `}>
                    {enroll.status}
                  </span>
                </td>

              </tr>
            );
          })}
        </tbody>

      </table>
    </div>
  </div>
);

};

export default StudentCourseDetail;
