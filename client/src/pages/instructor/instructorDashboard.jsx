import React, { useEffect, useState } from 'react';
import InstructorNavbar from '../../components/instructorNavbar';
import axios from "axios";

const InstructorDashboard = () => {
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


  const [instructorData, setInstructorData] = useState({ name: "Instructor" });
  const [activeTab, setActiveTab] = useState("Home");
  const [myCourses, setMyCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  // --- NEW: Course meta states ---
  const [allInstructors, setAllInstructors] = useState([]);
  const [instructors, setInstructors] = useState([
    { name: "", instructorId: null, isCoordinator: true } // auto coordinator
  ]);



  const [entryYears, setEntryYears] = useState("");

  // New States for Course Detail View
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [selectedEnrollments, setSelectedEnrollments] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [session, setSession] = useState("");

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

  // to fetch all instructors 
  useEffect(() => {
  axios.get("http://localhost:5000/api/instructor/all", config)
    .then(res => setAllInstructors(res.data))
    .catch(() => {});
}, []);


  return (
    <div className="min-h-screen bg-gray-50">
      <InstructorNavbar name={instructorData.name} setActiveTab={setActiveTab} />
      
      <main className="max-w-6xl mx-auto mt-8 p-6 bg-white shadow-sm rounded-lg border border-gray-200">
        
        {/* --- HOME TAB --- */}
        {activeTab === "Home" && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-bold text-indigo-900 mb-4">Instructor Portal</h2>
            <p className="text-gray-600">Welcome to the Academic Information Management System</p>
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
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 text-indigo-900 border-b pb-2">Course Offering Form</h2>
            
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = Object.fromEntries(new FormData(e.target));

                const payload = {
                  ...formData,
                  instructors, // Array of { email, isCoordinator }
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
              {/* Course Code */}
              <div>
                <label className="text-sm font-semibold">Course Code</label>
                <input name="courseCode" className="w-full p-2 border rounded" required />
              </div>

              {/* Course Name */}
              <div>
                <label className="text-sm font-semibold">Course Name</label>
                <input name="courseName" className="w-full p-2 border rounded" required />
              </div>

              {/* Offering Department */}
              <div>
                <label className="text-sm font-semibold">Offering Department</label>
                <select name="offeringDept" className="w-full p-2 border rounded" required>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Credits */}
              <div>
                <label className="text-sm font-semibold">Credits</label>
                <input name="credits" type="number" className="w-full p-2 border rounded" required />
              </div>

              {/* Allowed Entry Years */}
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

              {/* Academic Session */}
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

              {/* Slot */}
              <div>
                <label className="text-sm font-semibold">Slot</label>
                <input name="slot" className="w-full p-2 border rounded" required />
              </div>

              {/* Instructors & Coordinators */}
              <div className="col-span-2">
                <label className="text-sm font-semibold">Instructors & Coordinators</label>

                {instructors.map((inst, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    {/* Instructor Email */}
                  <input
                    list={`instructors-${idx}`}
                    className="flex-1 p-2 border rounded"
                    placeholder="Select Instructor"
                    value={inst.name}   // MUST be controlled
                    onChange={(e) => {
                      const selected = allInstructors.find(
                        i => `${i.firstName} ${i.lastName}` === e.target.value
                      );

                      const copy = [...instructors];
                      copy[idx] = {
                        name: selected ? `${selected.firstName} ${selected.lastName}` : "",
                        instructorId: selected?._id || null,
                        isCoordinator: copy[idx].isCoordinator
                      };

                      setInstructors(copy);
                    }}
                    required
                  />

                    {/* Instructor Coordinator Checkbox */}
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

                    {/* Datalist for Suggestions */}
                    <datalist id={`instructors-${idx}`}>
                      {allInstructors.map((i) => (
                      <option
                        key={i._id}
                        value={`${i.firstName} ${i.lastName}`}
                      />
                      ))}
                    </datalist>
                  </div>
                ))}

                {/* Add New Instructor Button */}
                <button
                  type="button"
                  className="text-xs text-indigo-600 font-bold"
                  onClick={() =>
                    setInstructors([
                      ...instructors,
                      { name: "", instructorId: null, isCoordinator: false }
                    ])
                  }
                >
                  + Add Instructor
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="col-span-2 mt-4 bg-indigo-600 text-white py-2 rounded font-bold"
              >
                Submit Proposal
              </button>
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
                <div className="col-span-6">
            <p className="text-xs font-bold text-gray-500 mb-1">Instructors</p>
            <div className="flex flex-wrap gap-2">
              {selectedCourse.instructors?.map((i, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 text-xs rounded-full border ${
                    i.isCoordinator
                      ? 'bg-green-100 text-green-700 border-green-300'
                      : 'bg-gray-100 text-gray-700 border-gray-300'
                  }`}
                >
                  {i.email} {i.isCoordinator && "(Coordinator)"}
                </span>
              ))}
            </div>
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
        {/* ---------------- HELP TAB ---------------- */}
        {activeTab === "Help" && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
              Help Desk
            </h2>
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-gray-700 mb-2 font-medium">
                For technical issues or other queries, please contact:
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

export default InstructorDashboard;