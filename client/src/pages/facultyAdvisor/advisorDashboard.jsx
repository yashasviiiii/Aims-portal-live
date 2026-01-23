import React, { useEffect, useState } from 'react';
import AdvisorNavbar from '../../components/advisorNavbar';
import axios from 'axios';

const AdvisorDashboard = () => {
  // --- States ---
  const DEPARTMENTS = [
    "Computer Science and Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Artificial Intelligence",
    "Chemical Engineering",
    "Humanities and Social Science"
  ];
  const ACADEMIC_SESSIONS = [
    "2025-II",
    "2025-S",
    "2026-I"
  ];

  const [userData, setUserData] = useState({ name: "Advisor" });

  // PERSISTENCE LOGIC: Initialize from localStorage or default to "Home"
  const [activeTab, setActiveTab] = useState(localStorage.getItem("activeAdvisorTab") || "Home");
  
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
  
  // --- NEW: Course meta states ---
  const [allInstructors, setAllInstructors] = useState([]);
  const [instructors, setInstructors] = useState([
    { name: "", instructorId: null, isCoordinator: true } // auto coordinator
  ]);
  const [entryYears, setEntryYears] = useState("");

  // New States for Course Detail View
  const [session, setSession] = useState("");

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

  // --- Effect 2: Tab Switching & Persistence Logic ---
  useEffect(() => {
    localStorage.setItem("activeAdvisorTab", activeTab);

    if (activeTab === "My Courses") fetchMyCourses();
    if (activeTab === "Approve Courses") fetchProposedProposals();
    if (activeTab === "All Courses") {
      fetchAllEnrolling();
      setSelectedCourse(null); 
    }
    setSelectedIds([]);
  }, [activeTab]);

  // Fetch all instructors 
  useEffect(() => {
    axios.get("http://localhost:5000/api/instructor/all", config)
      .then(res => setAllInstructors(res.data))
      .catch(() => {});
  }, []);
  
  const fetchMyCourses = async () => {
    setLoadingMyCourses(true);
    try {
      const res = await axios.get('http://localhost:5000/api/fa/my-courses', config);
      setMyCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch personal courses");
    } finally {
      setLoadingMyCourses(false);
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
      const res = await axios.get(`http://localhost:5000/api/instructor/course-students/${courseId}`, config);
      setPendingStudents(res.data);
    } catch (err) {
      console.error("Error fetching students");
    } finally {
      setLoadingEnrolling(false);
    }
  };

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
      setSelectedEnrollments([]);
      fetchStudentsForCourse(selectedCourse._id); 
    } catch (err) {
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
    if (!window.confirm(`Confirm ${action} for selected courses?`)) return;

    try {
      await axios.post('http://localhost:5000/api/fa/handle-proposals', { 
        courseIds: selectedIds, 
        action: action 
      }, config);
      alert(`Courses ${action}ed successfully.`);
      setSelectedIds([]);
      fetchProposedProposals();
    } catch (err) {
      alert("Operation failed.");
    }
  };

  const toggleStudentSelection = (enrollId) => {
    setSelectedEnrollments(prev => 
      prev.includes(enrollId) ? prev.filter(id => id !== enrollId) : [...prev, enrollId]
    );
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
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
                <li><b>• Add Course:</b> Propose a new course you intend to teach.</li>
                <li><b>• My Courses:</b> View status of your personal course submissions.</li>
                <li><b>• Approve Courses:</b> Review and Open/Reject all departmental proposals.</li>
                <li><b>• All Courses:</b> Final approval for student enrollment requests.</li>
              </ul>
            </div>
          </div>
        )}

        {/* --- ADD COURSE TAB --- */}
        {activeTab === "Add Course" && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 text-indigo-900 border-b pb-2">Course Offering Form</h2>
            
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = Object.fromEntries(new FormData(e.target));
                const payload = {
                  ...formData,
                  instructors, 
                  allowedEntryYears: entryYears.split(",").map(Number),
                };

                try {
                  await axios.post('http://localhost:5000/api/instructor/add-course', payload, config);
                  alert("Course submitted for Faculty Advisor approval");
                  setActiveTab("My Courses");
                } catch (err) {
                  alert("Submission failed");
                }
              }}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <label className="text-sm font-semibold">Course Code</label>
                <input name="courseCode" className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="text-sm font-semibold">Course Name</label>
                <input name="courseName" className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="text-sm font-semibold">Offering Department</label>
                <select name="offeringDept" className="w-full p-2 border rounded" required>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold">Credits</label>
                <input name="credits" type="number" className="w-full p-2 border rounded" required />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-semibold">Allowed Entry Years (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. 2019,2020,2021"
                  className="w-full p-2 border rounded"
                  value={entryYears}
                  onChange={(e) => setEntryYears(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Academic Session</label>
                <input
                  name="session"
                  list="sessions"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
                <datalist id="sessions">
                  {ACADEMIC_SESSIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="text-sm font-semibold">Slot</label>
                <input name="slot" className="w-full p-2 border rounded" required />
              </div>

              <div className="col-span-2">
                <label className="text-sm font-semibold">Instructors & Coordinators</label>
                {instructors.map((inst, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <input
                      list={`instructors-${idx}`}
                      className="flex-1 p-2 border rounded"
                      placeholder="Select Instructor"
                      value={inst.name}
                      onChange={(e) => {
                        const selected = allInstructors.find(
                          i => `${i.firstName} ${i.lastName}` === e.target.value
                        );
                        const copy = [...instructors];
                        copy[idx] = {
                          name: selected ? `${selected.firstName} ${selected.lastName}` : e.target.value,
                          instructorId: selected?._id || null,
                          isCoordinator: copy[idx].isCoordinator
                        };
                        setInstructors(copy);
                      }}
                      required
                    />
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={inst.isCoordinator}
                        onChange={() => {
                          const copy = [...instructors];
                          copy[idx].isCoordinator = !copy[idx].isCoordinator;
                          setInstructors(copy);
                        }}
                      />
                      Coordinator
                    </label>
                    <datalist id={`instructors-${idx}`}>
                      {allInstructors.map((i) => (
                        <option key={i._id} value={`${i.firstName} ${i.lastName}`} />
                      ))}
                    </datalist>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-xs text-indigo-600 font-bold"
                  onClick={() => setInstructors([...instructors, { name: "", instructorId: null, isCoordinator: false }])}
                >
                  + Add Instructor
                </button>
              </div>

              <button type="submit" className="col-span-2 mt-4 bg-indigo-600 text-white py-2 rounded font-bold">
                Submit Proposal
              </button>
            </form>
          </div>
        )}

        {/* --- MY COURSES TAB --- */}
        {activeTab === "My Courses" && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6 border-b pb-2">My Teaching Load</h2>
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
        
        {/* --- ALL COURSES (Approval Drill-down) --- */}
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
                        <div className="col-span-3 text-sm text-gray-500">
                           {/* FIXED: Check if instructors array exists and display last name */}
                           {course.instructors?.[0]?.instructorId?.lastName || "Faculty"}
                           {course.instructors?.length > 1 && " + others"}
                        </div>
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
                        <th className="p-4 w-12">
                          <input type="checkbox" onChange={(e) => {
                             if (e.target.checked) setSelectedEnrollments(pendingStudents.map(s => s._id));
                             else setSelectedEnrollments([]);
                          }} />
                        </th>
                        <th className="p-4">Roll Number</th>
                        <th className="p-4">Email</th>
                        <th className="p-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingStudents.length === 0 ? (
                        <tr><td colSpan="4" className="p-10 text-center text-gray-400 italic">No students pending FA approval.</td></tr>
                      ) : (
                        pendingStudents.map(enroll => (
                          <tr key={enroll._id} className="border-t hover:bg-gray-50">
                            <td className="p-4">
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
                            <td className="p-4 text-right">
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
                      {/* FIXED: Loop through instructors array */}
                      {course.instructors && course.instructors.length > 0 ? (
                        course.instructors.map((inst, i) => (
                          <p key={i} className="font-semibold text-indigo-900">
                            Prof. {inst.instructorId?.firstName || "Faculty"} {inst.instructorId?.lastName || ""} 
                            <span className="text-[9px] text-gray-400 ml-1">({inst.instructorId?.email || "No Email"})</span>
                          </p>
                        ))
                      ) : (
                        <p className="font-semibold text-red-400 italic">No Instructor Assigned</p>
                      )}
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