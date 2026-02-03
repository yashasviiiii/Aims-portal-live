// src/pages/instructor/components/CourseDetail.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jwtDecode } from "jwt-decode"; // You might need to install this or use your own decoder

// Inside the component:
const token = localStorage.getItem("token");
const decoded = token ? jwtDecode(token) : null;
const currentUserId = decoded?.id;

const CourseDetail = ({ course, config, onBack ,role='instructor'}) => {
  // 1. Unified State Names
  const [courseStudents, setCourseStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [uploadingGrades, setUploadingGrades] = useState(false);
  const [selectedEnrollments, setSelectedEnrollments] = useState([]);
  // 1. New Filter States
  const [enrollSearch, setEnrollSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [yearFilter, setYearFilter] = useState("All Years");
  const [enrollStatusFilter, setEnrollStatusFilter] = useState("All Status");

  // 2. Derive unique options for dropdowns
  const depts = ["All Departments", ...new Set(courseStudents.map(s => s.studentId?.department))].filter(Boolean);
  const years = useMemo(() => {
  const uniqueYears = new Set(
    courseStudents
      .map(s => s.studentId?.year)
      .filter(Boolean)
      .map(y => String(y).trim()) // Convert all to trimmed strings to ensure exact matches
  );
  return ["All Years", ...Array.from(uniqueYears).sort()];
}, [courseStudents]);

// Dynamic count of currently enrolled students
const totalEnrolled = useMemo(() => {
  return courseStudents.filter(s => s.status === 'approved').length;
}, [courseStudents]);

  // Fetch students specific to this component's lifecycle
const fetchStudents = async () => {
  console.log("Config being sent:", config);
    setLoadingStudents(true);
    try {
      // Now that 'role' is in the props above, this logic will work
      const endpoint = role === 'advisor' 
        ? `/api/fa/course-students/${course._id}` // FA endpoint
        : `/api/instructor/course-students/${course._id}`;

      console.log("Fetching from:", endpoint); // Add this to debug
        const res = await axios.get(endpoint, config);
      setCourseStudents(res.data.students);
    } catch (err) { 
      console.error("Failed to fetch students:", err); 
    } finally { 
      setLoadingStudents(false); 
    }
  };
  // 3. Filtered Logic
 const filteredEnrollments = useMemo(() => {
  return courseStudents.filter(enroll => {
    const student = enroll.studentId || {};
    const searchTerm = enrollSearch.toLowerCase();

    const matchesSearch = 
      (student.email?.toLowerCase() || "").includes(searchTerm) || 
      (student.firstName?.toLowerCase() || "").includes(searchTerm) ||
      (student.lastName?.toLowerCase() || "").includes(searchTerm);
    
    const matchesDept = deptFilter === "All Departments" || student.department === deptFilter;
    const matchesYear = yearFilter === "All Years" || String(student.year).trim() === String(yearFilter);
    const matchesStatus = enrollStatusFilter === "All Status" || enroll.status === enrollStatusFilter;

    return matchesSearch && matchesDept && matchesYear && matchesStatus;
  });
}, [courseStudents, enrollSearch, deptFilter, yearFilter, enrollStatusFilter]);
 
    useEffect(() => {
    fetchStudents();
  }, [course]);

  // Include your handleInstructorAction, downloadGradesTemplate, and uploadGradesExcel here...
  const handleInstructorAction = async (action) => {
    if (selectedEnrollments.length === 0) return toast.error("Please select students first");

    const tid = toast.loading(`Processing ${selectedEnrollments.length} requests...`);
    const url = role === 'advisor' 
    ? '/api/fa/enrollment-action' 
    : '/api/instructor/enrollment-action';

  try {
    await axios.post(url, {
      enrollmentIds: selectedEnrollments,
      action
    }, config);

    toast.success("Action successful", { id: tid });
    setSelectedEnrollments([]);
    fetchStudents(); // Refresh the list
  } catch (err) {
    toast.error(err.response?.data?.message || "Action failed", { id: tid });
  }
  };

  const downloadGradesTemplate = async (courseId) => {
    let tid;
    try {
      const res = await axios.get(
        `/api/instructor/download-grades/${courseId}`,
        {
          ...config,
          responseType: "blob"
        }
      );
  
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `course_${courseId}_grades.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Download started", { id: tid });
    } catch (err) {
      if (err.response?.status === 400) {
      toast.error(err.response.data.message || "No students enrolled in the course", { 
        id: tid,
        icon: '⚠️' 
      });
    } else {
      toast.error("Server error. Try again later.", { id: tid });
    }
    }
  };
  
  const uploadGradesExcel = async (courseId, file) => {
    if (!file) return;
    const tid = toast.loading(`Uploading ${file.name}...`);
    const formData = new FormData();
    formData.append("file", file);
    try {
      setUploadingGrades(true);
      await axios.post(
        `/api/instructor/upload-grades/${courseId}`,
        formData,
        {
          ...config,
          headers: {
            ...config.headers,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      toast.success("Grades uploaded successfully!", { id: tid });
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed: Data mismatch", { id: tid, duration: 4000 });
    } finally {
      setUploadingGrades(false);
    }
  };

    const toggleSelection = (id) => {
  setSelectedEnrollments(prev => 
    prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
  );
};

const handleDeleteCourse = async (courseId) => {
  // 1. Trigger the confirmation Toast
  toast((t) => (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-gray-900">
        Are you sure? This will delete the course and all enrollments permanently.
      </p>
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            toast.dismiss(t.id); // Remove the confirm toast
            await proceedWithDeletion(courseId); // Execute the actual logic
          }}
          className="px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  ), { duration: 5000 });
};

// 2. The actual logic (moved to a helper to keep code clean)
const proceedWithDeletion = async (courseId) => {
  const tid = toast.loading("Deleting course and enrollments...");

  try {
    await axios.delete(`/api/instructor/delete-course/${courseId}`, config);
    toast.success("Course and all enrollments deleted successfully", { id: tid });
    onBack(); 
  } catch (err) {
    console.error("Delete Error:", err);
    toast.error(err.response?.data?.message || "Failed to delete course", { id: tid });
  }
};

const heading = role === 'advisor' 
    ? "← Back to All Courses"
    : "← Back to My Courses";

  return (
    <div className="animate-fadeIn">
      
      <button onClick={onBack} className="text-indigo-600 font-bold mb-6 hover:underline"> {heading}</button>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-100 gap-4">
                <div className="flex items-center gap-4"> {/* Container for heading + delete icon */}
    <h3 className="text-lg font-bold text-gray-800 border-l-4 border-indigo-600 pl-3">
      Course Details
    </h3>
    
    {/* Delete Icon Button */}
    <button
      onClick={() => handleDeleteCourse(course._id)}
      title="Click on it to delete the course"
      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
                <div className="flex gap-3 mb-6">
                  {/* Download Button */}
                  <button
  onClick={() => {
    if (totalEnrolled === 0) {
      return toast.error("Cannot download: No students enrolled yet", { icon: '🚫' });
    }
    downloadGradesTemplate(course._id);
  }}
  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
    totalEnrolled === 0 
      ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" 
      : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
  }`}
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  Download Students
</button>
                  {/* Upload Button */}
                  {/* Only show Upload Button if the user is NOT an advisor */}
{role !== 'advisor' && (
  <label className="bg-green-600 text-white px-4 py-2 rounded text-xs font-bold cursor-pointer hover:bg-green-700">
    {uploadingGrades ? "Uploading..." : "Upload Grades Excel"}
    <input
      type="file"
      accept=".xlsx,.xls"
      hidden
      onChange={(e) =>
        uploadGradesExcel(course._id, e.target.files[0])
      }
    />
  </label>
)}
                </div>
                </div>
                {/* Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-10">
                  {Object.entries({
                    Code: course.courseCode,
                    Name: course.courseName,
                    Dept: course.offeringDept,
                    Slot: course.slot,
                    Session: course.session,
                    Credits: course.credits
                  }).map(([label, val]) => (
                    <div key={label} className="bg-white p-4 rounded-xl border border-gray-200 text-center flex flex-col items-center justify-center min-h-[100px] h-auto shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">{label}</p>
                      <p className="font-bold text-indigo-900 text-xs md:text-sm leading-tight break-words w-full">{val}</p>
                    </div>
                  ))}
                  {/* New Dynamic Enrollment Block */}
  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center flex flex-col items-center justify-center min-h-[100px] h-auto shadow-sm hover:shadow-md transition-shadow">
    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Total Enrolled</p>
    <p className="font-bold text-indigo-900 text-xs md:text-sm leading-tight break-words w-full">{totalEnrolled}</p>
  </div>
                </div>
                  {/*Instructors */}
                <div className="col-span-6">
            <p className="text-xs font-bold text-gray-500 mb-1">Instructors</p>
            <div className="flex flex-wrap gap-2">
              {course.instructors?.map((i, idx) => (
              <span
                key={idx}
                className={`px-2 py-1 text-xs rounded-full border ${
                  i.isCoordinator
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300'
                }`}
              >
                {i.instructorId?.firstName} {i.instructorId?.lastName}
                {i.isCoordinator && " (Coordinator)"}
              </span>
            ))}

            </div>
          </div>
                {/* Enrollment Section */}
<div className="mt-12 mb-8">
  {/* Row 1: Title and Status Actions */}
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
    <div className="flex flex-wrap items-center gap-3">    
      <h3 className="text-xl font-bold text-gray-800 border-l-4 border-green-600 pl-3">
        Enrollments
      </h3>
    {/* Dynamic Counter */}
    <span className="bg-green-100 text-green-700 px-3 py-0.5 rounded-full text-xs font-bold border border-green-200">
        {filteredEnrollments.length} {filteredEnrollments.length === 1 ? 'Result' : 'Results'}
      </span>
      {selectedEnrollments.length > 0 && (
        <span className="bg-indigo-100 text-indigo-700 px-3 py-0.5 rounded-full text-xs font-bold border border-indigo-200 animate-pulse">
          {selectedEnrollments.length} Selected
        </span>
    )}
  </div>

    <div className="flex gap-2 w-full md:w-auto">
      <button 
        onClick={() => handleInstructorAction('approve')} 
        className="bg-green-600 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50"
      >
        Approve Selected
      </button>
      <button 
        onClick={() => handleInstructorAction('reject')} 
        className="bg-red-600 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
      >
        Reject Selected
      </button>
    </div>
  </div>

  {/* Row 2: Search & Filter Bar */}
  <div className="flex flex-wrap gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
    <div className="flex-1 min-w-[300px] relative">
      <input
        type="text"
        placeholder="Search roll no or name..."
        className="w-full pl-4 pr-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white"
        value={enrollSearch}
        onChange={(e) => setEnrollSearch(e.target.value)}
      />
    </div>
    <div className="flex flex-wrap gap-2">
      <select 
        className="px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white cursor-pointer hover:border-green-500 outline-none" 
        value={deptFilter} 
        onChange={(e) => setDeptFilter(e.target.value)}
      >
        {depts.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <select 
        className="px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white cursor-pointer hover:border-green-500 outline-none" 
        value={yearFilter} 
        onChange={(e) => setYearFilter(e.target.value)}
      >
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <select 
  className="px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white cursor-pointer hover:border-green-500 outline-none max-w-[160px]" 
  value={enrollStatusFilter} 
  onChange={(e) => setEnrollStatusFilter(e.target.value)}
>
  <option value="All Status">All Status</option>
  <option value="pending_instructor">Pending My Approval</option>
  <option value="pending_fa">Forwarded to FA</option>
  <option value="approved">Enrolled</option>
  <option value="rejected">Rejected</option>
  <option value="dropped">Dropped</option>
  <option value="withdrawn">Withdrawn</option>
</select>
    </div>
  </div>
            {/* Table Body */}
<div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
    <div className="min-w-[800px] bg-white">
      {/* Table Headers Grid */}
      <div className="grid grid-cols-12 gap-4 px-6 mb-4 py-3 bg-gray-50 border-b text-[10px] font-bold uppercase text-gray-400 tracking-widest bg-gray-50 py-3 rounded-t-xl border-b">
        <div className="col-span-1 flex justify-center items-center">
          <input 
  type="checkbox" 
  className="w-4 h-4 cursor-pointer accent-green-600"
  onChange={(e) => {
    // Determine which status we care about based on the role
    const targetStatus = role === 'advisor' ? 'pending_fa' : 'pending_instructor';
    
    // Only select students who match the target status
    const toSelect = filteredEnrollments
      .filter(s => s.status === targetStatus)
      .map(s => s._id);
      
    setSelectedEnrollments(e.target.checked ? toSelect : []);
  }} 
  checked={
    // Dynamic check based on role
    (() => {
      const targetStatus = role === 'advisor' ? 'pending_fa' : 'pending_instructor';
      const relevantStudents = filteredEnrollments.filter(s => s.status === targetStatus);
      
      return relevantStudents.length > 0 && 
             relevantStudents.every(s => selectedEnrollments.includes(s._id));
    })()
  }
/>
        </div>
        <div className="col-span-1 text-center">S.No</div>
        <div className="col-span-3">Roll No & Name</div>
        <div className="col-span-3 text-center">Dept | Year</div>
        <div className="col-span-2 text-center">Grade</div>
        <div className="col-span-2 text-right pr-4">Status</div>
      </div>
      
      {/* Table Body continues here... */}
      <div className="p-2 space-y-2">
  {loadingStudents ? (
    <p className="text-center py-10 text-gray-400">Loading students...</p>
  ) : filteredEnrollments.length === 0 ? (
    <p className="text-center py-10 text-gray-400 italic">No enrollment requests found.</p>
  ) : (
    filteredEnrollments.map((enroll, i) => {
      // 1. Define what status allows selection based on the current user role
      const canSelect = role === 'advisor' 
        ? enroll.status === 'pending_fa' 
        : enroll.status === 'pending_instructor';

      return (
        <div key={enroll._id} className="grid grid-cols-12 gap-4 items-center p-4 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 transition-all shadow-sm">
          
          {/* Checkbox Section */}
          <div className="col-span-1 flex justify-center">
            {canSelect ? (
              <input 
                type="checkbox" 
                className="w-4 h-4 cursor-pointer accent-green-600 rounded"
                checked={selectedEnrollments.includes(enroll._id)}
                onChange={() => toggleSelection(enroll._id)}
              />
            ) : (
              /* Visual indicator for rows that are already approved or pending elsewhere */
              <div 
                className={`w-2 h-2 rounded-full ${enroll.status === 'approved' ? 'bg-green-400' : 'bg-gray-200'}`} 
                title={enroll.status === 'approved' ? "Fully Approved" : "Action not required at this stage"}
              ></div>
            )}
          </div>

        {/* S.No */}
        <div className="col-span-1 text-center text-gray-300 font-mono text-xs">
          {String(i + 1).padStart(2, '0')}
        </div>

     {/* Student Identification */}
<div className="col-span-3">
  <p className="font-bold text-gray-800 text-sm">
    {enroll.studentId?.email ? enroll.studentId.email.split('@')[0] : "N/A"}
  </p>
  <p className="text-[10px] text-gray-500 uppercase">
    {enroll.studentId?.firstName || ""} {enroll.studentId?.lastName || ""}
  </p>
</div>

        {/* Dept | Year */}
        <div className="col-span-3 text-center border-l border-gray-50">
          <p className="text-xs font-bold text-gray-600 uppercase">{enroll.studentId?.department}</p>
          <p className="text-[9px] text-indigo-500 font-black">BATCH: {enroll.studentId?.year}</p>
        </div>

        {/* Grade */}
        <div className="col-span-2 text-center">
          {enroll.grade ? (
            <span className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-black">{enroll.grade}</span>
          ) : <span className="text-gray-300 text-[10px] italic">-</span>}
        </div>

        {/* Status Badge */}
        <div className="col-span-2 flex justify-end pr-4">
  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${
    enroll.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
    enroll.status === 'pending_fa' ? 'bg-purple-100 text-purple-700 border-purple-200' :
    enroll.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
    enroll.status === 'dropped' ? 'bg-gray-100 text-gray-700 border-gray-200' :
    enroll.status === 'withdrawn' ? 'bg-orange-100 text-orange-700 border-orange-200' :
    'bg-amber-100 text-amber-700 border-amber-200'
  }`}>
    {enroll.status.replace('_', ' ')}
  </span>
</div>
      </div>
    );
    })
  )}
  </div>
  </div>
  </div>
  </div>
  </div>
  );
};

export default CourseDetail;