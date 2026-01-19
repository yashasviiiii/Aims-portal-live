import React, { useEffect, useState } from 'react';
import StudentNavbar from '../../components/studentNavbar';
import axios from 'axios';
import CoursesSection from '../../components/CoursesSection';

const StudentDashboard = () => {
  const [roll, setRoll] = useState("Loading...");
  const [activeTab, setActiveTab] = useState("Home");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get('http://localhost:5000/api/student/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.student?.rollNumber) setRoll(response.data.student.rollNumber);
      } catch (err) {
        const backupEmail = localStorage.getItem("userEmail");
        setRoll(backupEmail ? backupEmail.split('@')[0] : "Guest");
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <StudentNavbar rollNumber={roll} setActiveTab={setActiveTab} />
      
      <main className="max-w-5xl mx-auto mt-10 p-8 bg-white shadow-sm rounded-lg border border-gray-200">
        
        {/* --- HOME / LANDING PANE --- */}
        {activeTab === "Home" && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Academic Information Management System
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Please <span className="font-bold text-red-600 underline">DO NOT</span> edit or manipulate the URLs or requests when using this application. 
                Doing so may lock your account.
              </p>
              <p>Please proceed by choosing a menu item from the top bar.</p>
              <p>
                Before contacting <span className="text-blue-600 font-medium">@aims_help</span> for any issues, 
                please check the <a href="#" className="text-blue-500 underline">User Guide</a> for solution.
              </p>
              
              <div className="mt-8 p-5 bg-amber-50 border-l-4 border-amber-400 rounded-r">
                <h3 className="font-bold text-amber-800 mb-2 underline">NOTE:</h3>
                <ul className="list-disc ml-5 space-y-2 text-amber-900 font-medium">
                  <li>Please directly contact the course instructor for any changes to your enrolment requests.</li>
                  <li>We have not yet fully imported your past enrolments data into this system. You may not get to see grades for some of your past courses.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* --- HELP PANE --- */}
        {activeTab === "Help" && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Help</h2>
            <p className="text-lg text-gray-700">
              For help, please email at <span className="font-mono font-bold text-blue-600">aims_help@iitrpr.ac.in</span> 
              <br />
              
            </p>
          </div>
        )}

        {activeTab === "Courses" && <CoursesSection />}

        {activeTab === "Record" && (
          <div className="text-center py-20 text-gray-400">
            <h2 className="text-2xl font-bold mb-2">Record</h2>
            <p>Grade sheets and transcripts are being generated.</p>
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentDashboard;