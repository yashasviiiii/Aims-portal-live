import React, { useState } from 'react';

const AllCoursesTab = ({ 
  enrollingCourses, 
  fetchStudentsForCourse, 
  pendingStudents, 
  handleApproval 
}) => {
    const [activeCourseId, setActiveCourseId] = useState(null);

    const handleToggle = (courseId) => {
    if (activeCourseId === courseId) {
      setActiveCourseId(null);
    } else {
      setActiveCourseId(courseId);
      fetchStudentsForCourse(courseId); // Triggers the fetch in the parent
    }
  };
  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-indigo-900 mb-6 border-b pb-2">Student Enrollment Requests</h2>
      
      {enrollingCourses.length === 0 ? (
        <p className="text-center py-10 text-gray-400">No active course enrollments found.</p>
      ) : (
        <div className="space-y-4">
          {enrollingCourses.map((course) => (
            <div key={course._id} className="bg-white border rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 flex justify-between items-center bg-slate-50 border-b">
                <div>
                  <span className="font-mono font-bold text-indigo-600 mr-2">{course.courseCode}</span>
                  <span className="font-bold">{course.courseName}</span>
                </div>
                <button 
                  onClick={() => handleToggle(course._id)}
                  className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 font-bold"
                >
                  {activeCourseId === course._id ? "Hide Students" : "View Pending Students"}
                </button>
              </div>

              {/* Student List Drill-down */}
              {activeCourseId === course._id && (
                <div className="p-4 bg-white animate-fadeIn">
                  {!pendingStudents[course._id] ? (
                    <p className="text-xs text-center text-gray-400 italic">Loading student list...</p>
                  ) : pendingStudents[course._id].length === 0 ? (
                    <p className="text-xs text-center text-gray-400 italic">No students currently pending for this course.</p>
                  ) : (
                    <div className="space-y-2">
                      {pendingStudents[course._id].map(enrollment => (
                        <div key={enrollment._id} className="flex justify-between items-center p-3 border rounded-lg text-sm hover:bg-gray-50">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800">
                                {enrollment.studentId?.firstName} {enrollment.studentId?.lastName}
                            </span>
                            <span className="text-xs text-gray-500">{enrollment.studentId?.email}</span>
                          </div>
                          
                          <div className="flex gap-4">
                            <button 
                              onClick={() => handleApproval('approve', enrollment._id, course._id)}
                              className="text-emerald-600 font-black hover:underline uppercase text-[10px]"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleApproval('reject', enrollment._id, course._id)}
                              className="text-rose-600 font-black hover:underline uppercase text-[10px]"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllCoursesTab;