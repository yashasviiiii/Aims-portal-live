import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CourseSection = ({ rollNumber }) => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ slot: "", dept: "", credits: "", status: "" });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/student/courses', config);
      setCourses(res.data);
    } catch (err) { 
      console.error("Fetch failed"); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- SEARCH, FILTER, AND SORT LOGIC ---
  useEffect(() => {
    // 1. Define Status Priority for Sorting
    // Priority: Credited (1) > Enrolling (2) > Others
    const getStatusPriority = (course) => {
      if (course.isCredited) return 1;
      return 2;
    };

    // 2. Filter Logic
    let result = courses.filter(c => {
      // Search Logic: Name, Code, or Professor Names (using instructorDisplay from backend)
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = 
        c.courseName.toLowerCase().includes(searchStr) ||
        c.courseCode.toLowerCase().includes(searchStr) ||
        (c.instructorDisplay && c.instructorDisplay.toLowerCase().includes(searchStr));

      // Category Filters
      const matchesDept = !filters.dept || c.offeringDept === filters.dept;
      const matchesSlot = !filters.slot || c.slot === filters.slot;
      const matchesCredits = !filters.credits || c.credits.toString() === filters.credits;
      const matchesStatus = !filters.status || 
        (filters.status === "CREDITED" ? c.isCredited : !c.isCredited);

      return matchesSearch && matchesDept && matchesSlot && matchesCredits && matchesStatus;
    });

    // 3. Multi-Level Sort Logic
    result.sort((a, b) => {
      // Level 1: Sort by Status Priority
      const priorityA = getStatusPriority(a);
      const priorityB = getStatusPriority(b);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Level 2: Sort Alphabetically by Course Name if status is same
      return a.courseName.localeCompare(b.courseName);
    });

    setFilteredCourses(result);
  }, [searchTerm, filters, courses]);

  const handleToggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const availableIds = filteredCourses.filter(c => !c.isCredited).map(c => c._id);
      setSelected(availableIds);
    } else { setSelected([]); }
  };

  const handleCredit = async () => {
    if (selected.length === 0) return alert("Select at least one course");
    try {
      await axios.post('http://localhost:5000/api/student/credit', { courseIds: selected }, config);
      alert("Credit requests sent successfully!");
      setSelected([]);
      fetchCourses(); 
    } catch (err) { 
      alert(err.response?.data?.message || "Error crediting courses"); 
    }
  };

  // Helper to determine if the course should be disabled
  const isActionDisabled = (status) => {
    return status !== "not_applied";
  };

  // Helper to format the status label
  const getStatusLabel = (status) => {
    switch(status) {
      case 'pending_instructor': return 'Waiting for Instructor';
      case 'pending_fa': return 'Waiting for Advisor';
      case 'approved': return 'Credited';
      case 'rejected': return 'Rejected';
      default: return 'Available';
    }
  };

  if (loading) return <div className="p-10 text-center">Loading courses...</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-900">Courses Offered for Enrollment</h2>
        <button 
          onClick={handleCredit}
          className="bg-indigo-600 text-white px-6 py-2 font-bold rounded-lg hover:bg-indigo-700 transition shadow-md flex items-center gap-2"
        >
          Credit Selected ({selected.length})
        </button>
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
          <option value="CREDITED">Credited</option>
          <option value="ENROLLING">Enrolling</option>
        </select>
      </div>

      {/* --- MAIN TABLE --- */}
      <div className="overflow-x-auto border rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <tr>
              <th className="p-4 w-10"><input type="checkbox" onChange={handleSelectAll} /></th>
              <th className="p-4">S.No</th>
              <th className="p-4">Code</th>
              <th className="p-4">Course Details</th>
              <th className="p-4">Instructor(s)</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredCourses.map((course, idx) => (
              <tr key={course._id} className="border-t hover:bg-indigo-50/30 transition-colors">
                <td className="p-4">
                  {!course.isCredited && (
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded text-indigo-600"
                      checked={selected.includes(course._id)} 
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
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {getStatusLabel(course.enrollmentStatus)}
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