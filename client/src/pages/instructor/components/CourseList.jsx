// src/pages/instructor/components/CourseList.jsx
import React, { useMemo, useState } from 'react';


const CourseList = ({ myCourses, loadingCourses, onSelectCourse }) => {
   // 1. Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionFilter, setSessionFilter] = useState("All Sessions");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [yearFilter, setYearFilter] = useState("All Entry Years");

  // 2. Logic: Compute filtered list
  const filteredCourses = useMemo(() => {
    return myCourses.filter(course => {
      // Search Logic (Name, Code, or Slot)
      const matchesSearch = 
        course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.slot.toLowerCase().includes(searchQuery.toLowerCase());

      // Dropdown Logic
      const matchesSession = sessionFilter === "All Sessions" || course.session === sessionFilter;
      const matchesStatus = statusFilter === "All Status" || course.status === statusFilter;
      const matchesYear = yearFilter === "All Entry Years" || course.allowedEntryYears.includes(Number(yearFilter));

      return matchesSearch && matchesSession && matchesStatus && matchesYear;
    });
  }, [myCourses, searchQuery, sessionFilter, statusFilter, yearFilter]);

  // Extract unique sessions/years for dropdown options
  const sessions = ["All Sessions", ...new Set(myCourses.map(c => c.session))];
  const allYears = ["All Entry Years", ...new Set(myCourses.flatMap(c => c.allowedEntryYears))].sort();

  if (loadingCourses) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="animate-fadeIn">   
            
                <h2 className="text-2xl font-bold text-indigo-900 mb-6">My Course Offerings</h2>

                {/* 3. Search & Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
        <input
          type="text"
          placeholder="Search name, code, or slot..."
          className="flex-1 min-w-[250px] px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <select 
          className="px-3 py-2 rounded-lg border text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          value={sessionFilter}
          onChange={(e) => setSessionFilter(e.target.value)}
        >
          {sessions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select 
          className="px-3 py-2 rounded-lg border text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          {allYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select 
          className="px-3 py-2 rounded-lg border text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All Status">All Status</option>
          <option value="proposed">Proposed</option>
          <option value="enrolling">Enrolling</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>

        {(searchQuery || sessionFilter !== "All Sessions" || statusFilter !== "All Status" || yearFilter !== "All Entry Years") && (
          <button 
            onClick={() => {
              setSearchQuery("");
              setSessionFilter("All Sessions");
              setStatusFilter("All Status");
              setYearFilter("All Entry Years");
            }}
            className="text-indigo-600 text-xs font-bold hover:underline px-2"
          >
            Clear Filters
          </button>
        )}
      </div>
      <div className="overflow-x-auto pb-4 custom-scrollbar">
        {/* Set a min-width to ensure columns don't collapse on small screens */}
        <div className="min-w-[800px]">

                {/*  Table  Headers */}
                <div className="grid grid-cols-12 gap-4 px-6 mb-4 text-[11px] font-bold uppercase text-gray-400 tracking-widest">
        <div className="col-span-1 text-center">S.No</div>
        <div className="col-span-2 text-center">Code</div>
        <div className="col-span-4 pl-12">Course Name</div> 
        <div className="col-span-3 text-center">Session | Slot</div>
        <div className="col-span-2 text-right pr-4">Status</div>
      </div>

         {/* 5. Course List - Improved Spacing */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-white border-2 border-dashed rounded-xl text-gray-400">
            No courses match your current filters.
          </div>
        ) : (filteredCourses.map((course, index) => (
          <div key={course._id} className="grid grid-cols-12 gap-4 items-center p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-all">
            
            {/* S.No */}
            <div className="col-span-1 text-center text-gray-300 font-mono text-xs">
              {String(index + 1).padStart(2, '0')}
            </div>
            
            {/* Code Button - Now has more space around it */}
            <div className="col-span-2 flex justify-center">
              <button 
                onClick={() => onSelectCourse(course)}
                className="bg-indigo-600 text-white w-20 py-1.5 rounded-lg font-bold text-[11px] shadow-sm hover:bg-indigo-700 active:scale-95 transition"
              >
                {course.courseCode}
              </button>
            </div>

            {/* Course Details - Pushed right with pl-12 */}
            <div className="col-span-4 pl-12 flex flex-col justify-center border-l border-gray-50">
              <p className="font-bold text-gray-800 text-sm mb-1.5 leading-tight tracking-tight">
                {course.courseName}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {course.allowedEntryYears.map(year => (
                  <span key={year} className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md text-[9px] font-bold border border-gray-200">
                    {year}
                  </span>
                ))}
              </div>
            </div>

            {/* Session | Slot - Perfectly Centered */}
            <div className="col-span-3 flex justify-center">
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
                <span className="text-xs font-bold text-gray-600">{course.session}</span>
                <span className="h-3 w-[1px] bg-gray-300"></span>
                <span className="text-xs font-bold text-indigo-600">{course.slot}</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="col-span-2 flex justify-end pr-4">
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border tracking-tighter ${
                  course.status === 'enrolling' ? 'bg-green-100 text-green-700 border-green-200' : 
                  course.status === 'proposed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  course.status === 'completed' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                  course.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                  'bg-gray-100 text-gray-700 border-gray-200'
                }`}>
                  {course.status}
                </span>
            </div>
            </div>
          )))}
      </div>
      </div>
      </div>
      </div>
  )}


export default CourseList;