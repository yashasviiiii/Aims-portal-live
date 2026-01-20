import React, { useEffect, useState } from 'react';
import InstructorNavbar from '../../components/instructorNavbar';
import axios from "axios";

const InstructorDashboard = () => {
  // --- States ---
  const [instructorData, setInstructorData] = useState("Loading...");
  const [activeTab, setActiveTab] = useState("Home");
  const [myCourses, setMyCourses] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  
  // FIX: Ensure these match what your JSX is calling
  const [loadingCourses, setLoadingCourses] = useState(false); 
  const [selectedCourses, setSelectedCourses] = useState([]); // For checkboxes

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // --- Effect 1: Load Instructor Profile ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/instructor/dashboard', config);
        setInstructorData(response.data.instructor);
      } catch (error) {
        console.error("Profile fetch failed");
        const backupEmail = localStorage.getItem("userEmail");
        setInstructorData(backupEmail ? backupEmail.split('@')[0] : "Instructor");
      }
    };
    fetchProfile();
  }, []);

  // --- Effect 2: Load Data based on Tab ---
  useEffect(() => {
    if (activeTab === "My Courses") fetchMyCourses();
    if (activeTab === "Enrollment Requests") fetchPendingEnrollments();
  }, [activeTab]);

  const fetchMyCourses = async () => {
  setLoadingCourses(true); // Matches the state name
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

  const fetchPendingEnrollments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/instructor/pending-enrollments', config);
      setPendingEnrollments(res.data);
    } catch (err) { console.error("Failed to fetch enrollments"); }
    finally { setLoading(false); }
  };

  const handleEnrollment = async (enrollmentId, action) => {
    try {
      await axios.post('http://localhost:5000/api/instructor/handle-student-request', { enrollmentId, action }, config);
      alert(`Student ${action}ed successfully`);
      fetchPendingEnrollments(); // Refresh list
    } catch (err) { alert("Action failed"); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <InstructorNavbar name={instructorData.name} setActiveTab={setActiveTab} />
      
      <main className="max-w-6xl mx-auto mt-8 p-6 bg-white shadow-sm rounded-lg border border-gray-200">
        
        {/* --- HOME TAB --- */}
        {activeTab === "Home" && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-bold text-indigo-900 mb-4">Instructor Portal</h2>
            <p className="text-gray-600">Welcome to the Academic Information Management System.</p>
            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400">
              <p className="text-blue-800 font-medium">Dashboard Overview:</p>
              <ul className="list-disc ml-5 mt-2 text-blue-700">
                <li><b>Add Course:</b> Propose new courses for FA approval.</li>
                <li><b>Enrollment Requests:</b> Approve students waiting for your signature.</li>
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

        {/* --- MY COURSES TAB --- */}
{activeTab === "My Courses" && (
  <div className="animate-fadeIn">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-indigo-900">My Course Offerings</h2>
      {/* Optional: Add a bulk action button here if needed */}
      <button className="bg-red-50 text-red-600 px-4 py-2 rounded text-sm font-semibold hover:bg-red-100 transition">
        Delete Selected
      </button>
    </div>

    {/* Table Headings */}
    <div className="grid grid-cols-12 gap-4 px-5 mb-2 text-xs font-bold uppercase text-gray-500 tracking-wider">
      <div className="col-span-1 flex items-center">
        <input type="checkbox" className="rounded" />
        <span className="ml-4">S.No</span>
      </div>
      <div className="col-span-2">Code</div>
      <div className="col-span-3">Course Name</div>
      <div className="col-span-4">Details (Dept | Session | Slot)</div>
      <div className="col-span-2 text-right">Status</div>
    </div>

    {loadingCourses ? (
      <p className="p-10 text-center text-gray-500">Loading courses...</p>
    ) : myCourses.length === 0 ? (
      <p className="p-10 text-center text-gray-500">No courses offered yet.</p>
    ) : (
      <div className="space-y-3">
        {myCourses.map((course, index) => (
          <div key={course._id} className="grid grid-cols-12 gap-4 items-center p-4 bg-white border rounded-xl shadow-sm hover:border-indigo-300 transition-colors">
            
            {/* Checkbox & S.No */}
            <div className="col-span-1 flex items-center">
              <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
              <span className="ml-5 text-sm font-medium text-gray-400">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>

            {/* Course Code */}
            <div className="col-span-2">
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md font-bold text-sm border border-indigo-100">
                {course.courseCode}
              </span>
            </div>

            {/* Course Name */}
            <div className="col-span-3">
              <h3 className="font-bold text-gray-800 truncate" title={course.courseName}>
                {course.courseName}
              </h3>
            </div>

            {/* Details (Right of Name) */}
            <div className="col-span-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="bg-gray-100 px-2 py-0.5 rounded italic">{course.offeringDept}</span>
                <span className="text-gray-300">|</span>
                <span>{course.session}</span>
                <span className="text-gray-300">|</span>
                <span className="font-mono text-indigo-600">{course.slot}</span>
              </div>
            </div>

            {/* Status */}
<div className="col-span-2 text-right">
  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
    course.status === 'enrolling' 
      ? 'bg-green-50 text-green-700 border-green-200' 
      : course.status === 'rejected'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-amber-50 text-amber-700 border-amber-200'
  }`}>
    {/* Map the DB string to a user-friendly label */}
    {course.status === 'enrolling' && 'Enrolling'}
    {course.status === 'rejected' && 'Rejected'}
    {course.status === 'proposed' && 'Proposed'}
    {/* Fallback for safety */}
    {!['enrolling', 'rejected', 'proposed'].includes(course.status) && course.status}
  </span>
</div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

        {/* --- ENROLLMENT REQUESTS (NEW) --- */}
        {activeTab === "Enrollment Requests" && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">Student Enrollment Requests</h2>
            {loading ? <p>Loading...</p> : pendingEnrollments.length === 0 ? <p>No pending requests.</p> : 
              pendingEnrollments.map((req) => (
                <div key={req._id} className="flex justify-between items-center p-4 mb-3 border rounded-xl bg-white shadow-sm">
                  <div>
                    <p className="font-bold text-gray-800">{req.studentId?.email}</p>
                    <p className="text-sm text-gray-500">Course: {req.courseId?.courseCode} - {req.courseId?.courseName}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEnrollment(req._id, 'approve')} className="bg-green-600 text-white px-4 py-1 rounded text-sm font-bold">Approve</button>
                    <button onClick={() => handleEnrollment(req._id, 'reject')} className="bg-red-600 text-white px-4 py-1 rounded text-sm font-bold">Reject</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </main>
    </div>
  );
};

export default InstructorDashboard;