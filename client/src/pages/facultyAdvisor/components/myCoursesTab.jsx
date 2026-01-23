import React from 'react';

const MyCoursesTab = ({ myCourses, loading }) => {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-indigo-900 mb-6 border-b pb-2">
        My Teaching Load
      </h2>
      
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-5 mb-3 text-xs font-bold uppercase text-gray-400 tracking-wider">
        <div className="col-span-1">S.No</div>
        <div className="col-span-2">Code</div>
        <div className="col-span-3">Course Name</div>
        <div className="col-span-4 text-center">Details</div>
        <div className="col-span-2 text-right">Status</div>
      </div>

      {loading ? (
        <p className="text-center py-10">Loading...</p>
      ) : myCourses.length === 0 ? (
        <p className="text-center py-10 text-gray-400 italic">
          No courses offered yet.
        </p>
      ) : (
        <div className="space-y-3">
          {myCourses.map((course, index) => (
            <div 
              key={course._id} 
              className="grid grid-cols-12 gap-4 items-center p-4 bg-white border rounded-xl shadow-sm"
            >
              <div className="col-span-1 text-sm font-medium text-gray-400">
                {index + 1}
              </div>
              <div className="col-span-2">
                <span className="bg-slate-100 px-2 py-1 rounded font-mono font-bold text-sm">
                  {course.courseCode}
                </span>
              </div>
              <div className="col-span-3 font-bold text-gray-800">
                {course.courseName}
              </div>
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
  );
};

export default MyCoursesTab;