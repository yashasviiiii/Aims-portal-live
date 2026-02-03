import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import StudentCourseDetail from "../pages/student/StudentCourseDetail";

const CourseSection = ({ rollNumber }) => {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ slot: "", dept: "", credits: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/api/student/courses', config);
      setCourses(res.data);
    } catch (err) { 
      toast.error("Failed to load courses. Please refresh."); 
    } finally { 
      setLoading(false); 
    }
  };

  const getUnifiedStatus = (course) => {
    if (
      course.enrollmentStatus &&
      course.enrollmentStatus !== "none" &&
      course.enrollmentStatus !== ""
    ) {
      return course.enrollmentStatus;
    }

    if (course.status === "not_enrolled") {
      return "not_enrolled";
    }

    return "unknown";
  };


  const getAllowedActions = (course) => {
    const status = getUnifiedStatus(course);

    if (status === "not_enrolled") return ["credit"];
    if (["pending_instructor", "pending_fa", "approved"])
      return ["drop", "withdraw"];

    return [];
  };

// This replaces the old useEffect and the filteredCourses state
const filteredCourses = React.useMemo(() => {
  // 1. Logic for Status Priority (Your existing logic)
  const getStatusPriority = (course) => {
    const status = getUnifiedStatus(course);
    switch (status) {
      case "approved": return 1;
      case "pending_instructor": return 2;
      case "pending_fa": return 3;
      case "not_enrolled": return 4;
      case "rejected": return 5;
      case "dropped": return 6;
      case "withdrawn": return 7;
      default: return 8;
    }
  };

  // 2. Filter Logic (Your existing logic)
  let result = courses.filter(c => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      c.courseName.toLowerCase().includes(searchStr) ||
      c.courseCode.toLowerCase().includes(searchStr) ||
      (c.instructorDisplay && c.instructorDisplay.toLowerCase().includes(searchStr));

    const matchesDept = !filters.dept || c.offeringDept === filters.dept;
    const matchesSlot = !filters.slot || c.slot === filters.slot;
    const matchesCredits = !filters.credits || c.credits.toString() === filters.credits;
    const matchesStatus = !filters.status || getUnifiedStatus(c) === filters.status;

    return matchesSearch && matchesDept && matchesSlot && matchesCredits && matchesStatus;
  });

  // 3. Sort Logic (Your existing logic)
  return result.sort((a, b) => {
    const priorityA = getStatusPriority(a);
    const priorityB = getStatusPriority(b);
    if (priorityA !== priorityB) return priorityA - priorityB;
    return a.courseName.localeCompare(b.courseName);
  });
}, [searchTerm, filters, courses]); // This re-calculates automatically when these change

  const handleToggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    const selectableIds = courses
      .filter(isSelectable)
      .map(c => c._id);

    const allSelected = selectableIds.every(id => selected.includes(id));

    setSelected(allSelected ? [] : selectableIds);
  };

  // handle the selected courses
const handleAction = async (action) => {
  if (!action) return;

  if (selected.length === 0) {
    return toast.error("Please select at least one course");
  }

  const invalid = selected.some(id => {
    const course = courses.find(c => c._id === id);
    if (!course) return true;

    return !getAllowedActions(course).includes(action);
  });

  if (invalid) {
    return toast.error(`One or more selected courses cannot be ${action}ed`);
  }

  const tid = toast.loading(`Processing ${action} request...`);
  try {
    await axios.post(
      '/api/student/course-action',
      { courseIds: selected, action },
      config
    );

    toast.success(`${action.toUpperCase()}ED successfully!`, { id: tid });
    setSelected([]);
    fetchCourses();
  } catch (err) {
    toast.error(err.response?.data?.message || "Action failed", { id: tid });
  }
};


  const isSelectable = (course) =>
    !["withdrawn", "rejected", "dropped"].includes(
      getUnifiedStatus(course)
    );



  // Helper to format the status label
    const getStatusLabel = (course) => {
      const status = getUnifiedStatus(course);
      switch (status) {
        case 'pending_instructor': return 'Waiting for Instructor';
        case 'pending_fa': return 'Waiting for Advisor';
        case 'approved': return 'Credited';
        case 'rejected': return 'Rejected';
        case 'dropped': return 'Dropped';
        case 'withdrawn': return 'Withdrawn';
        case 'not_enrolled': return 'Available';
        default: return 'Unknown';
      }
    };



  if (loading) return <div className="p-10 text-center">Loading courses...</div>;
  if (selectedCourse) {
    return (
      <StudentCourseDetail
        course={selectedCourse}
        onBack={() => {
          setSelectedCourse(null);
          setSearchTerm("");
          setFilters({ slot: "", dept: "", credits: "", status: "" });
          fetchCourses();
        }}
      />
    );
  }
  
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-900">Courses Offered for Enrollment</h2>
        <div className="flex items-center gap-3">
          <select
            value={action}
            onChange={(e) => {
              const selectedAction = e.target.value;
              setAction(selectedAction);
              handleAction(selectedAction);
              setAction(""); // 🔑 RESET after action
            }}
            className="p-2 border rounded-lg text-sm outline-none shadow"
            disabled={selected.length === 0}
          >
            <option value="" disabled>
              Select Action : {selected.length}
            </option>
            <option value="credit">Credit Selected</option>
            <option value="drop">Drop Course</option>
            <option value="withdraw">Withdraw Course</option>
          </select>
        </div>
      </div>

      {/* --- SEARCH & FILTERS BAR --- */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <input 
          placeholder="Search name, code, or professor..." 
          className="md:col-span-1 p-2 border rounded shadow-sm focus:ring-2 focus:ring-indigo-300 outline-none text-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select className="p-2 border rounded text-sm outline-none" onChange={(e) => setFilters({...filters, dept: e.target.value})}>
          <option value="">All Departments</option>
          {[...new Set(courses.map(c => c.offeringDept))].map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select className="p-2 border rounded text-sm outline-none" onChange={(e) => setFilters({...filters, credits: e.target.value})}>
          <option value="">All Credits</option>
          {[...new Set(courses.map(c => c.credits))].sort().map(cr => <option key={cr} value={cr}>{cr} Credits</option>)}
        </select>

        <select className="p-2 border rounded text-sm outline-none" onChange={(e) => setFilters({...filters, slot: e.target.value})}>
          <option value="">All Slots</option>
          {[...new Set(courses.map(c => c.slot))].sort().map(s => <option key={s} value={s}>Slot {s}</option>)}
        </select>

        <select className="p-2 border rounded text-sm outline-none" onChange={(e) => setFilters({...filters, status: e.target.value})}>
          <option value="">All Status</option>
          <option value="approved">Credited</option>
          <option value="pending_instructor">Waiting for Instructor</option>
          <option value="pending_fa">Waiting for Advisor</option>
          <option value="dropped">Dropped</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="not_enrolled">Available</option>
        </select>
      </div>

      {/* --- MAIN TABLE --- */}
      <div className="overflow-x-auto border rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <tr>
                 <th className="p-4 text-center">
                <input
              type="checkbox"
              onClick={(e) => e.stopPropagation()}

                    checked={
                      courses.filter(isSelectable).length > 0 &&
                      courses.filter(isSelectable).every(c => selected.includes(c._id))
                    }
                    onChange={handleSelectAll}/> </th>
              <th className="p-4">S.No</th>
              <th className="p-4">Code</th>
              <th className="p-4">Course Details</th>
              <th className="p-4">Instructor(s)</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredCourses.map((course, idx) => (
              <tr key={course._id} onClick={() => setSelectedCourse(course)} className="border-t hover:bg-indigo-50/30 transition-colors cursor-pointer">

                <td className="p-4">
                    {isSelectable(course) && (
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                        checked={selected.includes(course._id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => handleToggle(course._id)}
                      />
                    )}
                  </td>
                <td className="p-4 text-gray-400 font-mono">{idx + 1}</td>
                <td className="p-4 font-bold text-indigo-600 font-mono">{course.courseCode}</td>
                <td className="p-4">
                  <div className="font-bold text-gray-800">{course.courseName}</div>
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">
                    {course.offeringDept} • Slot {course.slot} • {course.credits} Credits
                  </div>
                </td>
                <td className="p-4 text-gray-600">
                  <div className="font-medium text-xs">
                    {course.instructorDisplay || "Not Assigned"}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                      course.enrollmentStatus === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                      course.enrollmentStatus === 'pending_instructor' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                      course.enrollmentStatus === 'pending_fa' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                      course.enrollmentStatus === 'dropped' ? 'bg-red-100 text-red-700 border-red-200' :
                      course.enrollmentStatus === 'withdrawn' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {getStatusLabel(course)}
                    </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCourses.length === 0 && (
          <div className="p-10 text-center text-gray-400 italic">No courses found matching your criteria.</div>
        )}
      </div>
      
    </div>
  );
};


export default CourseSection;