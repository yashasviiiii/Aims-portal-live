import React, { useEffect, useState } from 'react';
import InstructorNavbar from '../../components/instructorNavbar';
import axios from "axios";
import CourseForm from './components/CourseForm';
import CourseList from './components/CourseList';
import CourseDetail from './components/CourseDetail';
import toast from 'react-hot-toast';

const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState(
  new URLSearchParams(window.location.search).get("tab") || "Home"
);
  const [instructorData, setInstructorData] = useState({ name: "Instructor" });
  const [myCourses, setMyCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [allInstructors, setAllInstructors] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

    const [instructors, setInstructors] = useState([
      { name: `${instructorData.firstName} ${instructorData.lastName}`, instructorId: instructorData._id, isCoordinator: true }
    ]);
  
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // --- Effects ---
  //fetch profile
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/instructor/dashboard', config);
      
      // This will now contain instructor.firstName and instructor.lastName 
      // because of the .populate() we added to the backend above
      setInstructorData(response.data.instructor);
    } catch (error) {
      console.error("Profile Fetch Error:", error);
      toast.error("Could not load instructor profile.");
      setInstructorData({ name: "Instructor" });
    }
  };
  fetchProfile();
}, []);

//refresh correct
useEffect(() => {
  const newUrl = `${window.location.pathname}?tab=${activeTab}`;
  window.history.pushState({ path: newUrl }, "", newUrl);
}, [activeTab]);

// full name
  useEffect(() => {
  // Use the individual names to build the full name for the form row
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

  // to fetch all instructors 
  useEffect(() => {
  axios.get("http://localhost:5000/api/instructor/all", config)
    .then(res => setAllInstructors(res.data))
    .catch(() => {});
}, []);

  useEffect(() => {
    if (activeTab === "My Courses") {
      fetchMyCourses();
      setSelectedCourse(null); // Reset detail view when switching back to main tab
    }
  }, [activeTab]);

  const fetchMyCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await axios.get('http://localhost:5000/api/instructor/my-courses', config);
      setMyCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch courses");
      toast.error("Failed to load your courses. Please refresh.");
    } finally {
      setLoadingCourses(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <InstructorNavbar 
  name={`${instructorData.firstName || 'Instructor'} ${instructorData.lastName || ''}`} 
  setActiveTab={setActiveTab} 
/>
      
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

        {activeTab === "Add Course" && (
  <CourseForm 
    instructorData={instructorData} 
    allInstructors={allInstructors} 
    config={config} 
    onSuccess={() => {
      setActiveTab("My Courses");
    }} 
  />
)}

        {/* --- MY COURSES & COURSE DETAILS TAB --- */}
        {activeTab === "My Courses" && (
          !selectedCourse ? (
            <CourseList 
              myCourses={myCourses}
              loadingCourses={loadingCourses} 
              heading="My Course Offerings"
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