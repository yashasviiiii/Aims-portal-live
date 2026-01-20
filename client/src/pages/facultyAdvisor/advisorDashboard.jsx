import React, { useEffect, useState } from 'react';
import AdvisorNavbar from '../../components/advisorNavbar';
import axios from 'axios';

const AdvisorDashboard = () => {
  // --- States ---
  const [instructorData, setInstructorData] = useState(null);
  const [activeTab, setActiveTab] = useState("Home");
  const [myCourses, setMyCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // --- Effect 1: Load Instructor Profile on Mount ---
  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get('http://localhost:5000/api/instructor/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInstructorData(response.data.instructor);
      } catch (error) {
        console.error("Dashboard profile fetch failed");
        const backupEmail = localStorage.getItem("userEmail");
        setInstructorData({ name: backupEmail ? backupEmail.split('@')[0] : "Instructor" });
      }
    };
    fetchInstructorData();
  }, []);

  // --- Effect 2: Load Courses when "My Courses" tab is clicked ---
  useEffect(() => {
    if (activeTab === "My Courses") {
      const fetchMyCourses = async () => {
        setLoadingCourses(true);
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get('http://localhost:5000/api/instructor/my-courses', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMyCourses(res.data);
        } catch (err) {
          console.error("Failed to fetch courses");
        } finally {
          setLoadingCourses(false);
        }
      };
      fetchMyCourses();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdvisorNavbar name={instructorData?.firstName || "Instructor"} setActiveTab={setActiveTab} />

      
      <main className="max-w-6xl mx-auto mt-8 p-6 bg-white shadow-sm rounded-lg border border-gray-200">
        
        {/* --- HOME TAB --- */}
        {activeTab === "Home" && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-bold text-indigo-900 mb-4">Instructor Portal</h2>
            <p className="text-gray-600">Welcome to the Academic Information Management System.</p>
            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400">
              <p className="text-blue-800 font-medium">Quick Actions:</p>
              <ul className="list-disc ml-5 mt-2 text-blue-700">
                <li>Use <b>Add Course</b> to launch new enrollments.</li>
                <li>Check <b>My Courses</b> to see your proposed or enrolling subjects.</li>
              </ul>
            </div>
          </div>
        )}

        {/* --- ADD COURSE TAB --- */}
        {activeTab === "Add Course" && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold mb-6 text-indigo-900 border-b pb-2">Course Offering Form</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const data = Object.fromEntries(new FormData(e.target));
              try {
                const token = localStorage.getItem("token");
                await axios.post('http://localhost:5000/api/instructor/add-course', data, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                alert("Course submitted and status set to 'Proposed'");
                setActiveTab("My Courses"); 
              } catch (err) { alert("Submission failed"); }
            }} className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="text-sm font-semibold">Course Code</label>
                <input name="courseCode" placeholder="CS301" className="w-full p-2 border rounded" required />
              </div>
              <div className="col-span-1">
                <label className="text-sm font-semibold">Course Name</label>
                <input name="courseName" placeholder="Operating Systems" className="w-full p-2 border rounded" required />
              </div>
              <div className="col-span-1">
                <label className="text-sm font-semibold">Offering Department</label>
                <input name="offeringDept" placeholder="CSE" className="w-full p-2 border rounded" required />
              </div>
              <div className="col-span-1">
                <label className="text-sm font-semibold">Credits</label>
                <input name="credits" placeholder="3" type="number" className="w-full p-2 border rounded" required />
              </div>
              <div className="col-span-1">
                <label className="text-sm font-semibold">Session</label>
                <input name="session" placeholder="2024-I" className="w-full p-2 border rounded" required />
              </div>
              <div className="col-span-1">
                <label className="text-sm font-semibold">Slot</label>
                <input name="slot" placeholder="pce-1" className="w-full p-2 border rounded" required />
              </div>
              <button type="submit" className="col-span-2 mt-4 bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700">
                Submit Course Offering
              </button>
            </form>
          </div>
        )}

        {/* --- MY COURSES TAB --- */}
        {activeTab === "My Courses" && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">My Course Offerings</h2>
            {loadingCourses ? (
              <p>Loading courses...</p>
            ) : myCourses.length === 0 ? (
              <p className="text-gray-500">No courses offered yet.</p>
            ) : (
              <div className="space-y-4">
                {myCourses.map((course, index) => (
                  <div key={course._id} className="flex flex-col md:flex-row items-center p-5 bg-white border rounded-xl shadow-sm gap-4">
                    <div className="flex items-center gap-4 min-w-[120px]">
                      <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md font-bold text-sm">
                        {course.courseCode}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg leading-tight">{course.courseName}</h3>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1 text-sm text-gray-500">
                        <span><span className="font-semibold">Dept:</span> {course.offeringDept}</span>
                        <span><span className="font-semibold">Session:</span> {course.session}</span>
                        <span><span className="font-semibold">Slot:</span> {course.slot}</span>
                      </div>
                    </div>
                    <div className="min-w-[120px] flex justify-end">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${
                        course.status === 'proposed' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- HELP TAB --- */}
        {activeTab === "Help" && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-bold mb-4">Instructor Support</h2>
            <p className="text-gray-700">
              For portal issues, email: <span className="font-bold text-blue-600">aims_help@iitrpr.ac.in</span>
              <br />
              
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdvisorDashboard;