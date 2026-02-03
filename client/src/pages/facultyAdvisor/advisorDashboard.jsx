import React, { useEffect, useState } from 'react';
import AdvisorNavbar from '../../components/advisorNavbar';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

// Component Tabs
import HomeTab from './components/homeTab';
import CourseForm from '../instructor/components/CourseForm';
import ApproveProposalsTab from './components/approveProposalsTab';
import AllCoursesTab from './components/allcoursesTab';
import HelpTab from './components/helpTab';
import CourseDetail from '../instructor/components/CourseDetail';
import CourseList from '../instructor/components/CourseList';

const AdvisorDashboard = () => {
  // --- Constants ---
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

  // --- Auth & Config ---
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // --- State: General & Navigation ---
  const [userData, setUserData] = useState({ name: "Advisor" });
  const [activeTab, setActiveTab] = useState(localStorage.getItem("activeAdvisorTab") || "Home");
  const [instructorData, setInstructorData] = useState({ name: "Instructor" });

  // --- State: My Courses (Teaching) ---
  const [myCourses, setMyCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // --- State: Approve Course Proposals (Admin) ---
  const [allProposedCourses, setAllProposedCourses] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // --- State: All Enrolling Courses & Student Approval ---
  const [enrollingCourses, setEnrollingCourses] = useState([]);
  const [pendingStudents, setPendingStudents] = useState({});
  const [selectedEnrollments, setSelectedEnrollments] = useState([]);
  const [loadingEnrolling, setLoadingEnrolling] = useState(false);

  // --- State: Form Meta Data ---
  const [allInstructors, setAllInstructors] = useState([]);
  const [instructors, setInstructors] = useState([]);

  // --- Effect 1: Load Profile & Instructor Data ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/instructor/dashboard', config);
        setInstructorData(response.data.instructor);
      } catch (error) {
        console.error("Profile Fetch Error:", error);
        setInstructorData({ firstName: "Advisor", lastName: "" });
      }
    };
    fetchProfile();
  }, []);

  // --- Effect 2: Auto-populate Instructor List for Forms ---
  useEffect(() => {
    if (instructorData && instructorData.firstName) {
      setInstructors([
        {
          name: `${instructorData.firstName} ${instructorData.lastName}`,
          instructorId: instructorData._id,
          isCoordinator: true
        }
      ]);
    }
  }, [instructorData]);

  // --- Effect 3: Tab Switching & Persistence ---
  useEffect(() => {
    localStorage.setItem("activeAdvisorTab", activeTab);

    if (activeTab === "My Courses") {
      fetchMyCourses();
      setSelectedCourse(null);
    }
    if (activeTab === "Approve Courses") {
      fetchProposedProposals();
    }
    if (activeTab === "All Courses") {
      fetchAllEnrolling();
      setSelectedCourse(null);
    }
    setSelectedIds([]);
  }, [activeTab]);

  // --- Effect 4: Fetch Instructor Directory ---
  useEffect(() => {
    axios.get("/api/instructor/all", config)
      .then(res => setAllInstructors(res.data))
      .catch(() => {});
  }, []);

  // --- Data Fetching Logic ---

  const fetchMyCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await axios.get('/api/instructor/my-courses', config);
      setMyCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchAllEnrolling = async () => {
    setLoadingEnrolling(true);
    try {
      const res = await axios.get('/api/fa/all-enrolling-courses', config);
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
      const res = await axios.get(`/api/instructor/course-students/${courseId}`, config);
      setPendingStudents(prev => ({
        ...prev,
        [courseId]: res.data
      }));
    } catch (err) {
      console.error("Error fetching students");
    } finally {
      setLoadingEnrolling(false);
    }
  };

  const fetchProposedProposals = async () => {
    setLoadingProposals(true);
    try {
      const res = await axios.get('/api/fa/proposed-proposals', config);
      setAllProposedCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch proposals");
    } finally {
      setLoadingProposals(false);
    }
  };

  // --- Action Handlers ---

  const handleFinalFAAction = async (action, singleId = null, courseId = null) => {
    const idsToProcess = singleId ? [singleId] : selectedEnrollments;

    if (idsToProcess.length === 0) {
      return toast.error("Please select at least one student.");
    }

    const tid = toast.loading("Processing approval...");

    try {
      const response = await axios.post('/api/fa/final-approval', {
        enrollmentIds: idsToProcess,
        action: action
      }, config);

      toast.success(response.data.message);

      if (!singleId) setSelectedEnrollments([]);

      const targetCourseId = courseId || (selectedCourse ? selectedCourse._id : null);
      if (targetCourseId) {
        fetchStudentsForCourse(targetCourseId);
      }
    } catch (err) {
      toast.error("Failed to process approval.");
    }
  };

  const handleProposalAction = async (action) => {
    if (selectedIds.length === 0) return alert("Please select at least one course.");
    const tid = toast.loading(`Performing ${action}...`);
    try {
      await axios.post('/api/fa/handle-proposals', {
        courseIds: selectedIds,
        action: action
      }, config);
      toast.success(`Courses ${action}ed successfully.`, { id: tid });
    setSelectedIds([]);
    fetchProposedProposals();
  } catch (err) {
    toast.error("Operation failed.", { id: tid });
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
      <AdvisorNavbar 
        name={`${instructorData?.firstName || 'Advisor'} ${instructorData?.lastName || ''}`} 
        setActiveTab={setActiveTab} 
      />

      <main className="max-w-6xl mx-auto mt-8 p-6 bg-white shadow-sm rounded-lg border border-gray-200 min-h-[60vh]">
        
        {/* --- HOME TAB --- */}
        {activeTab === "Home" && (
          <HomeTab name={instructorData.firstName || "Advisor"} />
        )}

        {/* --- ADD COURSE TAB --- */}
        {activeTab === "Add Course" && (
          <CourseForm 
            instructorData={instructorData} 
            allInstructors={allInstructors} 
            config={config} 
            onSuccess={() => setActiveTab("My Courses")} 
          />
        )}

        {/* --- MY COURSES TAB --- */}
        {activeTab === "My Courses" && (
          !selectedCourse ? (
            <CourseList 
              myCourses={myCourses}
              loadingCourses={loadingCourses} 
              onSelectCourse={(c) => setSelectedCourse(c)} 
            />
          ) : (
            <CourseDetail 
              course={selectedCourse} 
              config={config} 
              onBack={() => { setSelectedCourse(null); fetchMyCourses(); }} 
            />
          )
        )}
        
        {/* --- ALL COURSES (Student Enrollment Approvals) --- */}
        {activeTab === "All Courses" && (
          !selectedCourse?(
          <AllCoursesTab 
            enrollingCourses={enrollingCourses}
            fetchStudentsForCourse={fetchStudentsForCourse}
            pendingStudents={pendingStudents}
            handleApproval={handleFinalFAAction}
            config={config}
          />
        ):(
        
            <CourseDetail 
              course={selectedCourse} 
              config={config} 
              role="advisor"
              onBack={() => { setSelectedCourse(null); fetchMyCourses(); }} 
            />
          
        )
        )}

        {/* --- APPROVE PROPOSALS TAB --- */}
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
          <HelpTab />
        )}

      </main>
    </div>
  );
};

export default AdvisorDashboard;