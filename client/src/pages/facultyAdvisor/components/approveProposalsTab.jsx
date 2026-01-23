import React from 'react';

const ApproveProposalsTab = ({ 
  allProposedCourses, 
  loading, 
  selectedIds, 
  toggleSelection, 
  setSelectedIds, 
  handleAction 
}) => {
  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-end mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-indigo-900">Departmental Approvals</h2>
          <p className="text-xs text-gray-500">Review proposals submitted by all faculty members.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleAction('approve')} 
            className="bg-emerald-600 text-white px-5 py-2 rounded shadow-md text-sm font-bold hover:bg-emerald-700 transition-all"
          >
            Approve Selected
          </button>
          <button 
            onClick={() => handleAction('reject')} 
            className="bg-rose-600 text-white px-5 py-2 rounded shadow-md text-sm font-bold hover:bg-rose-700 transition-all"
          >
            Reject Selected
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-5 mb-3 text-xs font-bold uppercase text-gray-400 tracking-wider">
        <div className="col-span-1 flex items-center">
          <input 
            type="checkbox" 
            className="rounded" 
            onChange={(e) => {
              if (e.target.checked) setSelectedIds(allProposedCourses.map(c => c._id));
              else setSelectedIds([]);
            }} 
          />
          <span className="ml-4">S.No</span>
        </div>
        <div className="col-span-2">Code</div>
        <div className="col-span-3">Course Name</div>
        <div className="col-span-4 text-center">Instructor & Details</div>
        <div className="col-span-2 text-right">Status</div>
      </div>

      {loading ? (
        <p className="text-center py-10">Fetching Proposals...</p>
      ) : allProposedCourses.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
          All caught up! No pending proposals.
        </div>
      ) : (
        <div className="space-y-3">
          {allProposedCourses.map((course, index) => (
            <div key={course._id} className="grid grid-cols-12 gap-4 items-center p-4 bg-white border rounded-xl shadow-sm hover:ring-2 hover:ring-indigo-100 transition-all">
              <div className="col-span-1 flex items-center">
                <input 
                  type="checkbox" 
                  className="rounded text-indigo-600" 
                  checked={selectedIds.includes(course._id)} 
                  onChange={() => toggleSelection(course._id)} 
                />
                <span className="ml-5 text-sm font-medium text-gray-400">{index + 1}</span>
              </div>
              <div className="col-span-2">
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded font-bold text-sm border border-indigo-100">
                  {course.courseCode}
                </span>
              </div>
              <div className="col-span-3 font-bold text-gray-800">{course.courseName}</div>
              
              <div className="col-span-4 text-center text-xs text-gray-500">
                {/* Loop through instructors with defensive checks */}
                {course.instructors && course.instructors.length > 0 ? (
                  course.instructors.map((inst, i) => (
                    <p key={i} className="font-semibold text-indigo-900">
                      Prof. {inst.instructorId?.firstName || "Faculty"} {inst.instructorId?.lastName || ""} 
                      <span className="text-[9px] text-gray-400 ml-1">
                        ({inst.instructorId?.email || "Email Hidden"})
                      </span>
                    </p>
                  ))
                ) : (
                  <p className="font-semibold text-amber-600 italic">No Instructor Assigned</p>
                )}
                <p>{course.offeringDept} | {course.session} | Slot: {course.slot}</p>
              </div>

              <div className="col-span-2 text-right">
                <span className="bg-amber-100 text-amber-800 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-inner">
                  Proposed
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApproveProposalsTab;