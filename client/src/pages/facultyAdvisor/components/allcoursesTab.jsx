import React from 'react';

const AllCoursesTab = ({ 
  enrollingCourses, 
  fetchStudents, 
  pendingStudents, 
  handleApproval 
}) => {
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
                  onClick={() => fetchStudents(course._id)}
                  className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                >
                  View Pending Students
                </button>
              </div>

              {/* Student List Drill-down */}
              {pendingStudents[course._id] && (
                <div className="p-4 bg-white animate-slideDown">
                  {pendingStudents[course._id].length === 0 ? (
                    <p className="text-xs text-center text-gray-400">No pending approvals for this course.</p>
                  ) : (
                    <div className="space-y-2">
                      {pendingStudents[course._id].map(student => (
                        <div key={student._id} className="flex justify-between items-center p-2 border-b text-sm">
                          <span>{student.name} ({student.rollNumber})</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleApproval(course._id, student._id, 'approve')}
                              className="text-emerald-600 font-bold hover:underline"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleApproval(course._id, student._id, 'reject')}
                              className="text-rose-600 font-bold hover:underline"
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