import React, { useState } from 'react';
import CourseList from '../../instructor/components/CourseList';
import CourseDetail from '../../instructor/components/CourseDetail';

const AllCoursesTab = ({ 
  enrollingCourses, 
  loadingEnrolling, 
  fetchStudentsForCourse, 
  pendingStudents, 
  handleApproval,
  config
}) => {
  // Local state to track which course is currently being viewed
  const [selectedCourse, setSelectedCourse] = useState(null);
  // Helper to handle going back to the list
  const handleBack = () => {
    setSelectedCourse(null);
  };

  return (
    <div className="all-courses-container">
      {!selectedCourse ? (
        /* VIEW 1: THE LIST */
        <CourseList 
          // We pass enrollingCourses to the prop the list expects
          myCourses={enrollingCourses} 
          loadingCourses={loadingEnrolling} 
          heading="All Course Offerings"
          onSelectCourse={(course) => {
            setSelectedCourse(course);
            // Fetch students immediately when the course is selected 
            // so they are ready for the Detail view
            fetchStudentsForCourse(course._id);
            
          }} 
        />
      ) : (
        /* VIEW 2: THE DETAIL */
        <CourseDetail 
          course={selectedCourse}
          onBack={handleBack}
          role="advisor"
          config={config}
          // Pass Advisor-specific student data and actions
          // These props must match what your CourseDetail.jsx expects
          students={pendingStudents[selectedCourse._id] || []}
          handleApproval={handleApproval}
        />
      )}
    </div>
  );
};

export default AllCoursesTab;