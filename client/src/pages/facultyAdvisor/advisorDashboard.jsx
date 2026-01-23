import React, { useEffect, useState } from 'react';
import AdvisorNavbar from '../../components/advisorNavbar';
import axios from 'axios';
import HomeTab from './components/homeTab';
import AddCourseTab from './components/advisorDashboard';
import MyCoursesTab from './components/myCoursesTab';
import ApproveProposalsTab from './components/approveProposalsTab';
import AllCoursesTab from './components/allcoursesTab';
import HelpTab from './components/helpTab';

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
          <HomeTab name={userData.name || "Advisor"} /> 
        )}

        {/* --- ADD COURSE TAB --- */}
        {activeTab === "Add Course" && (
          <AddCourseTab 
            allInstructors={allInstructors}
            config={config}
            setActiveTab={setActiveTab}
            departments={DEPARTMENTS}
            academicSessions={ACADEMIC_SESSIONS}
          />
        )}

        {/* --- MY COURSES TAB --- */}
        {activeTab === "My Courses" && (
          <MyCoursesTab 
            myCourses={myCourses} 
            loading={loadingMyCourses} 
          />
        )}
        
        {/* --- ALL COURSES (Approval Drill-down) --- */}
        {activeTab === "All Courses" && (
          <AllCoursesTab 
            enrollingCourses={enrollingCourses}
            fetchStudents={fetchStudentsForCourse}
            pendingStudents={pendingStudents}
            handleApproval={handleFinalFAAction}
          />
        )}

        {/* --- APPROVE COURSES TAB --- */}
        {activeTab === "Approve Courses" && (
          <ApproveProposalsTab 
            allProposedCourses={allProposedCourses}
            loading={loadingProposals}
            selectedIds={selectedIds}
            toggleSelection={toggleSelection}
            setSelectedIds={setSelectedIds}
            handleAction={handleProposalAction}
          />
        )}

        {/* --- HELP TAB --- */}
        {activeTab === "Help" && (
          <HelpTab/>
        )}

      </main>
    </div>
  );
};

export default AdvisorDashboard;