import React, { useEffect, useState } from 'react';
import InstructorNavbar from '../../components/instructorNavbar';
import axios from "axios";

const InstructorDashboard = () => {
  // --- States ---
  const [instructorData, setInstructorData] = useState({ name: "Instructor" });
  const [activeTab, setActiveTab] = useState("Home");
  const [myCourses, setMyCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  
  // New States for Course Detail View
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [selectedEnrollments, setSelectedEnrollments] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // --- Effects ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/instructor/dashboard', config);
        setInstructorData(response.data.instructor);
      } catch (error) {
        const backupEmail = localStorage.getItem("userEmail");
        setInstructorData({ name: backupEmail ? backupEmail.split('@')[0] : "Instructor" });
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === "My Courses") {
      fetchMyCourses();
      setSelectedCourse(null); // Reset detail view when switching back to main tab
    }
  }, [activeTab]);

  const toggleSelection = (id) => {
  setSelectedEnrollments(prev => 
    prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
  );
};

  const fetchMyCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await axios.get('http://localhost:5000/api/instructor/my-courses', config);
      setMyCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  // --- Enrollment Handlers for Specific Course ---
  const fetchCourseStudents = async (courseId) => {
    setLoadingStudents(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/instructor/course-students/${courseId}`, config);
      setCourseStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleInstructorAction = async (action) => {
    if (selectedEnrollments.length === 0) return alert("Select students first");
    try {
      await axios.post('http://localhost:5000/api/instructor/enrollment-action', {
        enrollmentIds: selectedEnrollments,
        action
      }, config);
      alert(`Selected students ${action === 'approve' ? 'forwarded to FA' : 'rejected'}`);
      setSelectedEnrollments([]);
      fetchCourseStudents(selectedCourse._id);
    } catch (err) {
      alert("Action failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <InstructorNavbar name={instructorData.name} setActiveTab={setActiveTab} />
      
      <main className="max-w-6xl mx-auto mt-8 p-6 bg-white shadow-sm rounded-lg border border-gray-200">
        
        {/* --- HOME TAB --- */}
        {activeTab === "Home" && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-bold text-indigo-900 mb-4">Instructor Portal</h2>
            <p className="text-gray-600 font-medium italic">"Empowering academic excellence through streamlined management."</p>
          </div>
        )}

        {/* --- ADD COURSE TAB --- */}
        {activeTab === "Add Course" && (
           <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border animate-fadeIn">
             <h2 className="text-2xl font-bold mb-6 text-indigo-900 border-b pb-2">Course Offering Form</h2>
             <form onSubmit={async (e) => {
               e.preventDefault();
               const data = Object.fromEntries(new FormData(e.target));
               try {
                 await axios.post('http://localhost:5000/api/instructor/add-course', data, config);
                 alert("Course submitted for Faculty Advisor approval");
                 setActiveTab("My Courses"); 
               } catch (err) { alert("Submission failed"); }
             }} className="grid grid-cols-2 gap-4">
               <div className="col-span-1"><label className="text-sm font-semibold">Course Code</label>
                 <input name="courseCode" className="w-full p-2 border rounded" required /></div>
               <div className="col-span-1"><label className="text-sm font-semibold">Course Name</label>
                 <input name="courseName" className="w-full p-2 border rounded" required /></div>
               <div className="col-span-1"><label className="text-sm font-semibold">Offering Dept</label>
                 <input name="offeringDept" className="w-full p-2 border rounded" required /></div>
               <div className="col-span-1"><label className="text-sm font-semibold">Credits</label>
                 <input name="credits" type="number" className="w-full p-2 border rounded" required /></div>
               <div className="col-span-1"><label className="text-sm font-semibold">Session</label>
                 <input name="session" className="w-full p-2 border rounded" required /></div>
               <div className="col-span-1"><label className="text-sm font-semibold">Slot</label>
                 <input name="slot" className="w-full p-2 border rounded" required /></div>
               <button type="submit" className="col-span-2 mt-4 bg-indigo-600 text-white py-2 rounded font-bold">Submit Proposal</button>
             </form>
           </div>
        )}

        {/* --- MY COURSES & COURSE DETAILS TAB --- */}
        {activeTab === "My Courses" && (
          <div className="animate-fadeIn">
            {!selectedCourse ? (
              <>
                <h2 className="text-2xl font-bold text-indigo-900 mb-6">My Course Offerings</h2>
                {/* Headers */}
                <div className="grid grid-cols-12 gap-4 px-5 mb-2 text-xs font-bold uppercase text-gray-500 tracking-wider">
                  <div className="col-span-1">S.No</div>
                  <div className="col-span-2">Code</div>
                  <div className="col-span-4">Course Name</div>
                  <div className="col-span-3">Session | Slot</div>
                  <div className="col-span-2 text-right">Status</div>
                </div>

                {loadingCourses ? <p className="text-center py-10">Loading...</p> : (
                  <div className="space-y-3">
                    {myCourses.map((course, index) => (
                      <div key={course._id} className="grid grid-cols-12 gap-4 items-center p-4 bg-white border rounded-xl shadow-sm hover:border-indigo-300 transition-all">
                        <div className="col-span-1 text-gray-400 font-mono text-sm">{index + 1}</div>
                        <div className="col-span-2">
                          <button 
                            onClick={() => { setSelectedCourse(course); fetchCourseStudents(course._id); }}
                            className="bg-indigo-600 text-white px-3 py-1 rounded font-bold text-xs hover:bg-indigo-700 transition"
                          >
                            {course.courseCode}
                          </button>
                        </div>
                        <div className="col-span-4 font-bold text-gray-800">{course.courseName}</div>
                        <div className="col-span-3 text-sm text-gray-500">{course.session} | {course.slot}</div>
                        <div className="col-span-2 text-right">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                            course.status === 'enrolling' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {course.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // COURSE DETAIL VIEW
              <div className="animate-fadeIn">
                <button onClick={() => setSelectedCourse(null)} className="text-indigo-600 font-bold mb-6 hover:underline flex items-center gap-2">
                  ← Back to Courses
                </button>

                <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-indigo-600 pl-3">Course Details</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-10">
                  {Object.entries({
                    Code: selectedCourse.courseCode,
                    Name: selectedCourse.courseName,
                    Dept: selectedCourse.offeringDept,
                    Slot: selectedCourse.slot,
                    Session: selectedCourse.session,
                    Credits: selectedCourse.credits
                  }).map(([label, val]) => (
                    <div key={label} className="bg-gray-50 p-3 rounded-lg border text-center">
                      <p className="text-[10px] uppercase font-bold text-gray-400">{label}</p>
                      <p className="font-bold text-indigo-900 text-sm">{val}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800 border-l-4 border-green-600 pl-3">Pending Enrollments</h3>
                  <div className="flex gap-2">
                    <button onClick={() => handleInstructorAction('approve')} className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-md hover:bg-green-700">Approve Selected</button>
                    <button onClick={() => handleInstructorAction('reject')} className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-md hover:bg-red-700">Reject Selected</button>
                  </div>
                </div>

                <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-4 w-12"><input type="checkbox" onChange={(e) => {
                          if (e.target.checked) setSelectedEnrollments(courseStudents.map(s => s._id));
                          else setSelectedEnrollments([]);
                        }} /></th>
                        <th className="p-4 w-16">S.No</th>
                        <th className="p-4">Student Identification</th>
                        <th className="p-4 text-right">Current Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingStudents ? <tr><td colSpan="4" className="p-10 text-center">Loading students...</td></tr> : 
                       courseStudents.length === 0 ? <tr><td colSpan="4" className="p-10 text-center text-gray-400 italic">No pending enrollment requests found.</td></tr> :
                       courseStudents.map((enroll, i) => (
                        <tr key={enroll._id} className="border-t hover:bg-indigo-50/30 transition">
                          <td className="p-4">
                            {/* The checkbox should only appear for pending students */}
                            {enroll.status === 'pending_instructor' ? (
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                                // 1. Control the checked state
                                checked={selectedEnrollments.includes(enroll._id)}
                                // 2. Call the toggle function
                                onChange={() => toggleSelection(enroll._id)}
                              />
                            ) : (
                              // If already approved/forwarded, show a small dot or nothing
                              <div className="w-4 h-4 ml-1 rounded-full bg-gray-200"></div>
                            )}
                          </td>
                          <td className="p-4 text-gray-400">{i + 1}</td>
                          <td className="p-4">
                            <p className="font-bold text-gray-700">{enroll.studentId.email.split('@')[0]}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{enroll.studentId.email}</p>
                          </td>
                          <td className="p-4 text-right">
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                enroll.status === 'approved' 
                                  ? 'bg-green-100 text-green-700 border-green-200' // New: Enrolled style
                                  : enroll.status === 'pending_fa' 
                                  ? 'bg-purple-100 text-purple-700 border-purple-200' // Forwarded style
                                  : 'bg-amber-100 text-amber-700 border-amber-200' // Pending Instructor style
                              }`}>
                                {enroll.status === 'approved' 
                                  ? 'Enrolled' 
                                  : enroll.status === 'pending_fa' 
                                  ? 'Forwarded to FA' 
                                  : 'Pending My Approval'}
                              </span>
                            </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default InstructorDashboard;