import React, { useEffect, useState } from "react";
import StudentNavbar from "../../components/studentNavbar";
import axios from "axios";
import CoursesSection from "../../components/CoursesSection";
import { getStudentRecord } from "../../api/student";

const StudentDashboard = () => {
  const [roll, setRoll] = useState("Loading...");
  const [activeTab, setActiveTab] = useState("Home");

  const [record, setRecord] = useState(null); // object: { student, records, cgpa }
  const [loadingRecord, setLoadingRecord] = useState(false);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  //DASHBOARD (ROLL NUMBER) 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/student/dashboard",
          config
        );
        if (response.data?.student?.rollNumber) {
          setRoll(response.data.student.rollNumber);
        }
      } catch (err) {
        const backupEmail = localStorage.getItem("userEmail");
        setRoll(backupEmail ? backupEmail.split("@")[0] : "Guest");
      }
    };
    fetchData();
  }, []);

  //RECORD TAB DATA 
  useEffect(() => {
    if (activeTab !== "Record") return;

    const fetchRecord = async () => {
      try {
        setLoadingRecord(true);
        const res = await getStudentRecord();
        setRecord(res.data); // ✅ object
      } catch (err) {
        console.error("Failed to fetch record:", err);
      } finally {
        setLoadingRecord(false);
      }
    };

    fetchRecord();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <StudentNavbar rollNumber={roll} setActiveTab={setActiveTab} />

      <main className="max-w-5xl mx-auto mt-10 p-8 bg-white shadow-sm rounded-lg border border-gray-200 min-h-[50vh]">

        {/* ---------------- HOME TAB ---------------- */}
        {activeTab === "Home" && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Academic Information Management System
            </h2>

            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>Please proceed by choosing a menu item from the top bar.</p>

              <div className="mt-8 p-5 bg-amber-50 border-l-4 border-amber-400 rounded-r">
                <h3 className="font-bold text-amber-800 mb-2 underline">
                  STUDENT NOTICES:
                </h3>
                <ul className="list-disc ml-5 space-y-2 text-amber-900 font-medium">
                  <li>
                    Only courses approved by the Faculty Advisor are visible in
                    the "Courses" tab.
                  </li>
                  <li>
                    Your enrollment status will progress from:
                    <span className="text-blue-700"> Pending Instructor </span> →
                    <span className="text-purple-700"> Pending FA </span> →
                    <span className="text-green-700"> Approved</span>.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- COURSES TAB ---------------- */}
        {activeTab === "Courses" && <CoursesSection />}

        {/* ---------------- RECORD TAB ---------------- */}
        {activeTab === "Record" && (
          <div className="space-y-8 animate-fadeIn">

            {loadingRecord && (
              <p className="text-center text-gray-500 py-10">
                Loading academic record...
              </p>
            )}

            {/* -------- STUDENT DETAILS -------- */}
            {record?.student && (
              <>
                <h1 className="text-xl font-bold">Student Details</h1>

                <div className="bg-white rounded-xl shadow border p-6 grid md:grid-cols-6 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">First Name</p>
                    <p className="font-semibold">
                      {record.student.firstName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Last Name</p>
                    <p className="font-semibold">
                      {record.student.lastName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Roll No</p>
                    <p className="font-semibold">
                      {record.student.email.split("@")[0]}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="font-semibold">
                      {record.student.department}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-semibold">
                      {record.student.email}
                    </p>
                  </div>

                  {typeof record.cgpa === "number" && (
                    <div className="bg-indigo-50 border rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-500">Cumulative GPA</p>
                      <p className="text-3xl font-bold text-indigo-700">
                        {record.cgpa.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* -------- SESSION RECORDS -------- */}
            {record?.records?.length > 0 &&
              record.records.map((session, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow border"
                >
                  <div className="bg-slate-900 text-white px-5 py-2 rounded-t-xl text-sm font-semibold">
                    Academic session: {session.session}
                  </div>

                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-gray-700">
                      <tr>
                        <th className="p-2 text-left">#</th>
                        <th className="p-2 text-left">Course</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Grade</th>
                      </tr>
                    </thead>

                    <tbody>
                      {session.courses.map((c, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2">{i + 1}</td>
                          <td className="p-2">
                            {c.course.courseCode} —{" "}
                            {c.course.courseName}
                          </td>
                          <td className="p-2 text-center">
                            {c.status}
                          </td>
                          <td className="p-2 text-center">
                            {c.category}
                          </td>
                          <td className="p-2 text-center font-semibold">
                            {c.grade}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
          </div>
        )}

        {/* ---------------- HELP TAB ---------------- */}
        {activeTab === "Help" && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
              Help Desk
            </h2>
            <p className="text-lg text-gray-700">
              Email:{" "}
              <span className="font-mono font-bold text-blue-600">
                aims_help@iitrpr.ac.in
              </span>
            </p>
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentDashboard;
