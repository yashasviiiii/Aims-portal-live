import React, { useEffect, useState } from 'react';
import StudentNavbar from '../../components/studentNavbar';
import axios from 'axios';
import CoursesSection from '../../components/CoursesSection';

const StudentDashboard = () => {
  const [roll, setRoll] = useState("Loading...");
  const [activeTab, setActiveTab] = useState("Home");
  const [records, setRecords] = useState([]); // State for approved courses
  const [loadingRecords, setLoadingRecords] = useState(false);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/student/dashboard', config);
        if (response.data?.student?.rollNumber) setRoll(response.data.student.rollNumber);
      } catch (err) {
        const backupEmail = localStorage.getItem("userEmail");
        setRoll(backupEmail ? backupEmail.split('@')[0] : "Guest");
      }
    };
    fetchData();
  }, []);

  // Fetch records whenever the "Record" tab is clicked
  useEffect(() => {
    if (activeTab === "Record") {
      const fetchRecords = async () => {
        setLoadingRecords(true);
        try {
          const res = await axios.get('http://localhost:5000/api/student/my-records', config);
          setRecords(res.data);
        } catch (err) {
          console.error("Error fetching records");
        } finally {
          setLoadingRecords(false);
        }
      };
      fetchRecords();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <StudentNavbar rollNumber={roll} setActiveTab={setActiveTab} />
      
      <main className="max-w-5xl mx-auto mt-10 p-8 bg-white shadow-sm rounded-lg border border-gray-200 min-h-[50vh]">
        
        {/* --- HOME TAB --- */}
        {activeTab === "Home" && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Academic Information Management System</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>Please proceed by choosing a menu item from the top bar.</p>
              <div className="mt-8 p-5 bg-amber-50 border-l-4 border-amber-400 rounded-r">
                <h3 className="font-bold text-amber-800 mb-2 underline">STUDENT NOTICES:</h3>
                <ul className="list-disc ml-5 space-y-2 text-amber-900 font-medium">
                  <li>Only courses approved by the Faculty Advisor are visible in the "Courses" tab.</li>
                  <li>Your enrollment status will progress from: <span className="text-blue-700">Pending Instructor</span> → <span className="text-purple-700">Pending FA</span> → <span className="text-green-700">Approved</span>.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* --- COURSES TAB (The Registration View) --- */}
        {activeTab === "Courses" && <CoursesSection />}

        {/* --- RECORD TAB (Finalized Courses) --- */}
        {activeTab === "Record" && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">My Academic Record</h2>
            {loadingRecords ? (
              <p className="text-center text-gray-500">Fetching your records...</p>
            ) : records.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-400">No approved courses found in your records.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {records.map((rec) => (
                  <div key={rec._id} className="flex justify-between items-center p-4 border rounded-lg bg-green-50 border-green-200">
                    <div>
                      <p className="font-bold text-green-900">{rec.courseId.courseCode} - {rec.courseId.courseName}</p>
                      <p className="text-xs text-green-700">Credits: {rec.courseId.credits}</p>
                    </div>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Credited</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- HELP PANE --- */}
        {activeTab === "Help" && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Help Desk</h2>
            <p className="text-lg text-gray-700">Email: <span className="font-mono font-bold text-blue-600">aims_help@iitrpr.ac.in</span></p>
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentDashboard;