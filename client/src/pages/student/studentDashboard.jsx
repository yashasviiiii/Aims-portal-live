import React, { useEffect, useState } from "react";
import StudentNavbar from "../../components/studentNavbar";
import axios from "axios";
import toast from 'react-hot-toast';
import CoursesSection from "../../components/CoursesSection";
import { getStudentRecord } from "../../api/student";

const StudentDashboard = () => {
  const [roll, setRoll] = useState("Loading...");
  
  // PERSISTENCE LOGIC: Initialize from localStorage or default to "Home"
  const [activeTab, setActiveTab] = useState(localStorage.getItem("activeStudentTab") || "Home");

  const [record, setRecord] = useState(null); // object: { student, records, cgpa }
  const [loadingRecord, setLoadingRecord] = useState(false);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // --- Effect 1: Persist Tab Selection ---
  useEffect(() => {
    localStorage.setItem("activeStudentTab", activeTab);
  }, [activeTab]);

  // --- Effect 2: Fetch Dashboard Data (Roll Number) ---
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
        toast.error("Could not fetch latest profile data.");
      }
    };
    fetchData();
  }, []);

  // --- Effect 3: Fetch Record Tab Data ---
  useEffect(() => {
    if (activeTab !== "Record") return;

    const fetchRecord = async () => {
      try {
        setLoadingRecord(true);
        const res = await getStudentRecord();
        setRecord(res.data);
      } catch (err) {
        toast.error("Failed to load academic records.");
        console.error("Failed to fetch record:", err);
      } finally {
        setLoadingRecord(false);
      }
    };

    fetchRecord();
  }, [activeTab]);
  //helper function to calculate SGPA
  const calculateSGPA = (courses) => {
  let totalCredits = 0;
  let weightedSum = 0;

  courses.forEach(c => {
    if (
      c.status === "approved" &&
      gradePoints[c.grade] !== undefined
    ) {
      const credits = c.course.credits;
      totalCredits += credits;
      weightedSum += credits * gradePoints[c.grade];
    }
  });

  return totalCredits === 0 ? null : (weightedSum / totalCredits);
};

const gradePoints = {
  "A": 10,
  "A-": 9,
  "B": 8,
  "B-": 7,
  "C": 6,
  "C-": 5,
  "D": 4,
  "F": 0
};

const calculateCGPA = (records) => {
  let totalCredits = 0;
  let weightedSum = 0;

  records.forEach(session => {
    session.courses.forEach(c => {
      if (
        c.status === "approved" &&
        gradePoints[c.grade] !== undefined
      ) {
        const credits = c.course.credits;
        totalCredits += credits;
        weightedSum += credits * gradePoints[c.grade];
      }
    });
  });

  return totalCredits === 0 ? null : weightedSum / totalCredits;
};
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
                    Your enrollment status will progress through the following stages:
                  </li>
                </ul>
                
                {/* Visual workflow of enrollment status */}
                
                
                <div className="mt-4 flex items-center gap-2 text-sm font-bold">
                   <span className="text-blue-700 bg-blue-50 px-2 py-1 rounded">Pending Instructor</span>
                   <span>→</span>
                   <span className="text-purple-700 bg-purple-50 px-2 py-1 rounded">Pending FA</span>
                   <span>→</span>
                   <span className="text-green-700 bg-green-50 px-2 py-1 rounded">Approved</span>
                </div>
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
                <h1 className="text-xl font-bold border-b pb-2">Student Profile</h1>
                <button
                onClick={async () => {
                  const tid = toast.loading("Generating your transcript...");
                  const token = localStorage.getItem("token");

                  const res = await fetch(
                    "http://localhost:5000/api/student/download-transcript",
                    {
                      headers: {
                        Authorization: `Bearer ${token}`
                      }
                    }
                  );

                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);

                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "transcript.pdf";
                  a.click();

                  window.URL.revokeObjectURL(url);
                  toast.success("Transcript downloaded successfully!", { id: tid });
                }}

                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700"
                >
                  Download Transcript (PDF)
                </button>

                <div className="bg-white rounded-xl shadow border p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="col-span-1 sm:col-span-1">
                    <p className="text-xs text-gray-500 uppercase font-bold">First Name</p>
                    <p className="font-semibold text-gray-800">{record.student.firstName}</p>
                  </div>

                  <div className="col-span-1 sm:col-span-1">
                    <p className="text-xs text-gray-500 uppercase font-bold">Last Name</p>
                    <p className="font-semibold text-gray-800">{record.student.lastName}</p>
                  </div>

                  <div className="col-span-1 sm:col-span-1">
                    <p className="text-xs text-gray-500 uppercase font-bold">Roll No</p>
                    <p className="font-semibold text-gray-800">{record.student.email.split("@")[0]}</p>
                  </div>

                  <div className="col-span-1 sm:col-span-1">
                    <p className="text-xs text-gray-500 uppercase font-bold">Department</p>
                    <p className="font-semibold text-gray-800">{record.student.department}</p>
                  </div>

                  <div className="col-span-1 sm:col-span-2 md:col-span-2">
                    <p className="text-xs text-gray-500 uppercase font-bold">Email</p>
                    <p className="font-semibold text-gray-800">{record.student.email}</p>
                  </div>

                  {typeof record.cgpa === "number" && (
                    <div className="md:col-span-6 mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <p className="text-sm text-indigo-900 font-bold">Cumulative Grade Point Average</p>
                        <p className="text-xs text-indigo-700">Calculated based on all completed sessions</p>
                      </div>
                      <p className="text-4xl font-black text-indigo-700">
                        {calculateCGPA(record.records)?.toFixed(2)}
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
                  className="bg-white rounded-xl shadow border overflow-hidden"
                >
                <div className="bg-slate-800 text-white px-4 py-3 text-sm font-bold flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span>Academic Session: {session.session}</span>

                  <div className="flex gap-4 text-xs text-slate-200">
                    <span>
                      Credits:{" "}
                      <span className="text-white font-black">
                        {session.totalCredits}
                      </span>
                    </span>

                    {calculateSGPA(session.courses) !== null && (
                      <span>
                        SGPA:{" "}
                        <span className="text-white font-black">
                          {calculateSGPA(session.courses).toFixed(2)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-[700px] w-full text-sm">
                    <thead className="bg-slate-50 text-gray-600 border-b">
                      <tr>
                        <th className="p-3 text-left w-12">#</th>
                        <th className="p-3 text-left">Course Details</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Grade</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {session.courses.filter(c => c.status === "approved" || c.status === "withdrawn").map((c, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 text-gray-400 font-mono">{i + 1}</td>
                          <td className="p-3">
                            <span className="font-bold text-indigo-900">{c.course.courseCode}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="text-gray-700">{c.course.courseName}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold uppercase text-gray-600 border">
                              {c.status}
                            </span>
                          </td>
                          <td className="p-3 text-center font-black text-indigo-600 text-base">
                            {c.status === "withdrawn" ? "W" : (c.grade || "N/A")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
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
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-gray-700 mb-2 font-medium">
                For technical issues or course registration queries, please contact:
              </p>
              <p className="text-xl">
                <span className="text-gray-500 mr-2">Email:</span>
                <a href="mailto:aims_help@iitrpr.ac.in" className="font-mono font-bold text-blue-600 hover:underline">
                  aims_help@iitrpr.ac.in
                </a>
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentDashboard;