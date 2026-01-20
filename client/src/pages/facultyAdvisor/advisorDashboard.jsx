import React, { useEffect, useState } from 'react';
import AdvisorNavbar from '../../components/advisorNavbar';
import axios from 'axios';

const AdvisorDashboard = () => {
  // --- States ---
  const [userData, setUserData] = useState({ name: "Advisor" });
  const [activeTab, setActiveTab] = useState("Home");
  
  // States for "My Courses" (Courses this Advisor teaches)
  const [myCourses, setMyCourses] = useState([]);
  const [loadingMyCourses, setLoadingMyCourses] = useState(false);

  // States for "Approve Courses" (Proposals from all Instructors)
  const [allProposedCourses, setAllProposedCourses] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const [enrollingCourses, setEnrollingCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [selectedEnrollments, setSelectedEnrollments] = useState([]);
  const [loadingEnrolling, setLoadingEnrolling] = useState(false);
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // --- Effect 1: Load Profile Data ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/instructor/dashboard', config);
        setUserData(response.data.instructor);
      } catch (error) {
        const backupEmail = localStorage.getItem("userEmail");
        setUserData({ name: backupEmail ? backupEmail.split('@')[0] : "Advisor" });
      }
    };
    fetchProfile();
  }, []);

  // --- Effect 2: Tab Switching Logic ---
  useEffect(() => {
    if (activeTab === "My Courses") fetchMyCourses();
    if (activeTab === "Approve Courses") fetchProposedProposals();
    if (activeTab === "All Courses") {
      fetchAllEnrolling();
      setSelectedCourse(null); // Reset drill-down view
    }
    // Reset selection when switching tabs
    setSelectedIds([]);
  }, [activeTab]);

  const fetchMyCourses = async () => {
    setLoadingMyCourses(true);
    try {
      // UPDATED URL: point to /api/fa/
      const res = await axios.get('http://localhost:5000/api/fa/my-courses', config);
      setMyCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch personal courses");
    } finally {
      setLoadingMyCourses(false);
    }
  };
  const handleAddCourse = async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  try {
    // UPDATED URL: point to /api/fa/
    await axios.post('http://localhost:5000/api/fa/add-course', data, config);
    alert("Course proposed successfully!");
    setActiveTab("My Courses"); // Switch tab to see the new course
  } catch (err) {
    alert("Submission failed. Ensure you are logged in correctly.");
  }
};

  const fetchAllEnrolling = async () => {
  setLoadingEnrolling(true);
  try {
    const res = await axios.get('http://localhost:5000/api/fa/all-enrolling-courses', config);
    setEnrollingCourses(res.data);
  } catch (err) {
    console.error("Failed to fetch enrolling courses");
  } finally {
    setLoadingEnrolling(false);
  }
};

const fetchStudentsForCourse = async (courseId) => {
  setLoadingEnrolling(true);
  try {
    // Note: Reusing your enrollment-fetch logic but filtered for FA
    const res = await axios.get(`http://localhost:5000/api/instructor/course-students/${courseId}`, config);
    // Only show students who have passed instructor approval
    setPendingStudents(res.data);
  } catch (err) {
    console.error("Error fetching students");
  } finally {
    setLoadingEnrolling(false);
  }
};

// 2. Logic for the Final Approval button
const handleFinalFAAction = async (action) => {
  if (selectedEnrollments.length === 0) return alert("Please select at least one student.");
  
  const confirmMsg = action === 'approve' 
    ? "Are you sure you want to finalize enrollment for selected students?" 
    : "Reject selected students?";
    
  if (!window.confirm(confirmMsg)) return;

  try {
    const response = await axios.post('http://localhost:5000/api/fa/final-approval', {
      enrollmentIds: selectedEnrollments,
      action: action
    }, config);

    alert(response.data.message);
    
    // SIMULTANEOUS UPDATE: 
    // Clear the selection checkboxes
    setSelectedEnrollments([]);
    // Re-fetch the student list to show the "Enrolled" status immediately
    fetchStudentsForCourse(selectedCourse._id); 
    
  } catch (err) {
    console.error("Action failed:", err);
    alert("Failed to process approval.");
  }
};

  const fetchProposedProposals = async () => {
    setLoadingProposals(true);
    try {
      const res = await axios.get('http://localhost:5000/api/fa/proposed-proposals', config);
      setAllProposedCourses(res.data);
    } catch (err) { console.error("Failed to fetch proposals"); }
    finally { setLoadingProposals(false); }
  };

  const handleProposalAction = async (action) => {
  if (selectedIds.length === 0) return alert("Please select at least one course.");
  
  const confirmMsg = action === 'approve' 
    ? "Approve selected courses for enrollment?" 
    : "Reject selected proposals?";
    
  if (!window.confirm(confirmMsg)) return;

  try {
    // Send 'approve' or 'reject' to the backend
    await axios.post('http://localhost:5000/api/fa/handle-proposals', { 
      courseIds: selectedIds, 
      action: action // matches the 'action' variable in controller
    }, config);

    alert(`Courses ${action}ed successfully.`);
    
    // Clear selection and refresh the list
    setSelectedIds([]);
    fetchProposedProposals(); // This removes them from the 'Approval' view because their status is no longer 'proposed'
  } catch (err) {
    alert("Operation failed. Please check backend logs.");
  }
};

  const toggleStudentSelection = (enrollId) => {
  setSelectedEnrollments(prev => 
    prev.includes(enrollId) 
      ? prev.filter(id => id !== enrollId) 
      : [...prev, enrollId]
  );
};

  return (
    <div className="min-h-screen bg-gray-50">
      <AdvisorNavbar name={userData.name || "Advisor"} setActiveTab={setActiveTab} />

      <main className="max-w-6xl mx-auto mt-8 p-6 bg-white shadow-sm rounded-lg border border-gray-200 min-h-[60vh]">
        
        {/* --- HOME TAB --- */}
        {activeTab === "Home" && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-bold text-indigo-900 mb-4">Faculty Advisor Portal</h2>
            <p className="text-gray-600">Welcome, Prof. {userData.name}. Use the taskbar above to manage offerings.</p>
            <div className="mt-6 p-6 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg">
              <p className="text-indigo-900 font-bold mb-2">Quick Guide:</p>
              <ul className="space-y-2 text-indigo-800 text-sm">
                <li className="flex gap-2"><b>• Add Course:</b> Propose a new course you intend to teach.</li>
                <li className="flex gap-2"><b>• My Courses:</b> View status of your personal course submissions.</li>
                <li className="flex gap-2"><b>• Approve Courses:</b> Review and Open/Reject all departmental proposals.</li>
              </ul>
            </div>
          </div>
        )}

        {/* --- ADD COURSE TAB --- */}
        {activeTab === "Add Course" && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 text-indigo-900 border-b pb-2">New Course Offering</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const data = Object.fromEntries(new FormData(e.target));
              try {
                await axios.post('http://localhost:5000/api/instructor/add-course', data, config);
                alert("Course submitted for approval!");
                setActiveTab("My Courses"); 
              } catch (err) { alert("Submission failed"); }
            }} className="grid grid-cols-2 gap-4">
              <div className="col-span-1"><label className="text-xs font-bold uppercase text-gray-500">Course Code</label>
                <input name="courseCode" placeholder="CS301" className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none" required /></div>
              <div className="col-span-1"><label className="text-xs font-bold uppercase text-gray-500">Course Name</label>
                <input name="courseName" placeholder="Operating Systems" className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none" required /></div>
              <div className="col-span-1"><label className="text-xs font-bold uppercase text-gray-500">Offering Dept</label>
                <input name="offeringDept" placeholder="CSE" className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none" required /></div>
              <div className="col-span-1"><label className="text-xs font-bold uppercase text-gray-500">Credits</label>
                <input name="credits" type="number" className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none" required /></div>
              <div className="col-span-1"><label className="text-xs font-bold uppercase text-gray-500">Session</label>
                <input name="session" placeholder="2024-I" className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none" required /></div>
              <div className="col-span-1"><label className="text-xs font-bold uppercase text-gray-500">Slot</label>
                <input name="slot" placeholder="A1" className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none" required /></div>
              <button type="submit" className="col-span-2 mt-4 bg-indigo-600 text-white py-3 rounded-md font-bold hover:bg-indigo-700 transition-colors shadow-lg">Submit Offering</button>
            </form>
          </div>
        )}

        {/* --- MY COURSES TAB --- */}
        {activeTab === "My Courses" && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6 border-b pb-2">My Teaching Load</h2>
            
            {/* Table Headings */}
            <div className="grid grid-cols-12 gap-4 px-5 mb-3 text-xs font-bold uppercase text-gray-400 tracking-wider">
              <div className="col-span-1">S.No</div>
              <div className="col-span-2">Code</div>
              <div className="col-span-3">Course Name</div>
              <div className="col-span-4 text-center">Details</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            {loadingMyCourses ? <p className="text-center py-10">Loading...</p> : myCourses.length === 0 ? <p className="text-center py-10 text-gray-400 italic">No courses offered yet.</p> : (
              <div className="space-y-3">
                {myCourses.map((course, index) => (
                  <div key={course._id} className="grid grid-cols-12 gap-4 items-center p-4 bg-white border rounded-xl shadow-sm">
                    <div className="col-span-1 text-sm font-medium text-gray-400">{index + 1}</div>
                    <div className="col-span-2"><span className="bg-slate-100 px-2 py-1 rounded font-mono font-bold text-sm">{course.courseCode}</span></div>
                    <div className="col-span-3 font-bold text-gray-800">{course.courseName}</div>
                    <div className="col-span-4 text-center text-xs text-gray-500 italic">
                      {course.offeringDept} | {course.session} | Slot: {course.slot}
                    </div>
                    <div className="col-span-2 text-right">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase border ${
              course.status === 'enrolling' ? 'bg-green-50 text-green-700 border-green-200' : 
              course.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
              'bg-amber-50 text-amber-700 border-amber-200'
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
        
        {/* ---ALL COURSES---  */}
        {activeTab === "All Courses" && (
  <div className="animate-fadeIn">
    {!selectedCourse ? (
      <>
        <h2 className="text-2xl font-bold text-indigo-900 mb-6 border-b pb-2">Active Enrollments</h2>
        <div className="grid grid-cols-12 gap-4 px-5 mb-3 text-xs font-bold uppercase text-gray-400">
          <div className="col-span-2">Code</div>
          <div className="col-span-5">Course Name</div>
          <div className="col-span-3">Instructor</div>
          <div className="col-span-2 text-right">Action</div>
        </div>
        {loadingEnrolling ? <p className="text-center py-10">Loading...</p> : (
          <div className="space-y-3">
            {enrollingCourses.map(course => (
              <div key={course._id} className="grid grid-cols-12 gap-4 items-center p-4 bg-white border rounded-xl shadow-sm">
                <div className="col-span-2 font-bold text-indigo-600">{course.courseCode}</div>
                <div className="col-span-5 font-bold text-gray-800">{course.courseName}</div>
                <div className="col-span-3 text-sm text-gray-500">{course.instructor}</div>
                <div className="col-span-2 text-right">
                  <button 
                    onClick={() => { setSelectedCourse(course); fetchStudentsForCourse(course._id); }}
                    className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
                  >
                    View Students
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    ) : (
      // DRILL DOWN: Student Approval Table
      <div className="animate-fadeIn">
        <button onClick={() => setSelectedCourse(null)} className="text-indigo-600 mb-4 font-bold flex items-center gap-1">
          ← Back to All Courses
        </button>
        <div className="flex justify-between items-center mb-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <div>
            <h3 className="text-xl font-bold text-indigo-900">{selectedCourse.courseCode} Students</h3>
            <p className="text-sm text-indigo-700">Awaiting final Faculty Advisor approval</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleFinalFAAction('approve')} className="bg-emerald-600 text-white px-4 py-2 rounded font-bold text-sm shadow-md">Final Approve</button>
            <button onClick={() => handleFinalFAAction('reject')} className="bg-rose-600 text-white px-4 py-2 rounded font-bold text-sm shadow-md">Reject</button>
          </div>
        </div>
        <div className="border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left bg-white">
            <thead className="bg-gray-100 text-[10px] uppercase font-bold text-gray-500">
              <tr>
                <th className="p-4 w-12"><input type="checkbox" onChange={(e) => {
                   if (e.target.checked) setSelectedEnrollments(pendingStudents.map(s => s._id));
                   else setSelectedEnrollments([]);
                }} /></th>
                <th className="p-4">Roll Number</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingStudents.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-400 italic">No students pending FA approval for this course.</td></tr>
              ) : (
                pendingStudents.map(enroll => (
                  <tr key={enroll._id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                    {/* Only allow selection if the status is pending_fa */}
                    {enroll.status === 'pending_fa' && (
                      <input 
                        type="checkbox" 
                        checked={selectedEnrollments.includes(enroll._id)}
                        onChange={() => toggleStudentSelection(enroll._id)}
                     />
                    )}
                    </td>
                    <td className="p-4 font-bold">{enroll.studentId?.email?.split('@')[0]}</td>
                    <td className="p-4 text-sm text-gray-500">{enroll.studentId?.email}</td>
                    <td className="p-4">
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
          enroll.status === 'approved' 
            ? 'bg-green-100 text-green-700 border-green-200' 
            : 'bg-purple-100 text-purple-700 border-purple-200 shadow-sm'
        }`}>
          {enroll.status === 'approved' ? '✓ Enrolled' : 'Awaiting My Approval'}
        </span>
    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
)}

        {/* --- APPROVE COURSES TAB --- */}
        {activeTab === "Approve Courses" && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-end mb-6 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-indigo-900">Departmental Approvals</h2>
                <p className="text-xs text-gray-500">Review proposals submitted by all faculty members.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleProposalAction('approve')} className="bg-emerald-600 text-white px-5 py-2 rounded shadow-md text-sm font-bold hover:bg-emerald-700 transition-all">Approve Selected</button>
                <button onClick={() => handleProposalAction('reject')} className="bg-rose-600 text-white px-5 py-2 rounded shadow-md text-sm font-bold hover:bg-rose-700 transition-all">Reject Selected</button>
              </div>
            </div>

            {/* Table Headings */}
            <div className="grid grid-cols-12 gap-4 px-5 mb-3 text-xs font-bold uppercase text-gray-400 tracking-wider">
              <div className="col-span-1 flex items-center">
                <input type="checkbox" className="rounded" onChange={(e) => {
                  if (e.target.checked) setSelectedIds(allProposedCourses.map(c => c._id));
                  else setSelectedIds([]);
                }} />
                <span className="ml-4">S.No</span>
              </div>
              <div className="col-span-2">Code</div>
              <div className="col-span-3">Course Name</div>
              <div className="col-span-4 text-center">Instructor & Details</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            {loadingProposals ? <p className="text-center py-10">Fetching Proposals...</p> : allProposedCourses.length === 0 ? <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">All caught up! No pending proposals.</div> : (
              <div className="space-y-3">
                {allProposedCourses.map((course, index) => (
                  <div key={course._id} className="grid grid-cols-12 gap-4 items-center p-4 bg-white border rounded-xl shadow-sm hover:ring-2 hover:ring-indigo-100 transition-all">
                    <div className="col-span-1 flex items-center">
                      <input type="checkbox" className="rounded text-indigo-600" checked={selectedIds.includes(course._id)} onChange={() => toggleSelection(course._id)} />
                      <span className="ml-5 text-sm font-medium text-gray-400">{index + 1}</span>
                    </div>
                    <div className="col-span-2"><span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded font-bold text-sm border border-indigo-100">{course.courseCode}</span></div>
                    <div className="col-span-3 font-bold text-gray-800">{course.courseName}</div>
                    <div className="col-span-4 text-center text-xs text-gray-500">
                      <p className="font-semibold text-indigo-900">{course.instructorId?.email || "Faculty"}</p>
                      <p>{course.offeringDept} | {course.session} | Slot: {course.slot}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="bg-amber-100 text-amber-800 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-inner">Proposed</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default AdvisorDashboard;