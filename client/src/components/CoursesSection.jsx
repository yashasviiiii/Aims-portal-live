import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CourseSection = ({ rollNumber }) => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ slot: "", dept: "", status: "" });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/student/courses', config);
      setCourses(res.data);
      setFilteredCourses(res.data);
    } catch (err) { console.error("Fetch failed"); }
    finally { setLoading(setLoading(false)); }
  };

  // --- SEARCH AND FILTER LOGIC ---
  useEffect(() => {
    let result = courses.filter(c => 
      c.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructors.some(i => i.instructorId.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (filters.slot) result = result.filter(c => c.slot === filters.slot);
    if (filters.dept) result = result.filter(c => c.offeringDept === filters.dept);
    
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
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-900">Courses Offered for Enrollment</h2>
        
      </div>

      {/* --- SEARCH & FILTERS --- */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <input 
          placeholder="Search by name, code, or prof..." 
          className="col-span-2 p-2 border rounded shadow-sm focus:ring-2 focus:ring-indigo-300"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="p-2 border rounded" onChange={(e) => setFilters({...filters, dept: e.target.value})}>
          <option value="">All Departments</option>
          {[...new Set(courses.map(c => c.offeringDept))].map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button 
          onClick={handleCredit}
          className="bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 transition"
        >
          Credit ({selected.length})
        </button>
      </div>

      {/* --- MAIN TABLE --- */}
      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
            <tr>
              <th className="p-4 w-10"><input type="checkbox" onChange={handleSelectAll} /></th>
              <th className="p-4">S.No</th>
              <th className="p-4">Code</th>
              <th className="p-4">Course Details</th>
              <th className="p-4">Instructor(s)</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course, idx) => (
              <tr key={course._id} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  {!course.isCredited && (
                    <input type="checkbox" checked={selected.includes(course._id)} onChange={() => handleToggle(course._id)} />
                  )}
                </td>
                <td className="p-4 text-gray-400 font-medium">{idx + 1}</td>
                <td className="p-4 font-mono font-bold text-indigo-600">{course.courseCode}</td>
                <td className="p-4">
                  <div className="font-bold text-gray-800">{course.courseName}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-tighter">
                    {course.offeringDept} • Slot {course.slot} • {course.credits} Credits
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {course.instructors.map(i => (
                    <div key={i.instructorId._id}>
                      Prof. {i.instructorId.firstName} {i.instructorId.lastName}
                      {i.isCoordinator && <span className="ml-1 text-[8px] bg-amber-100 text-amber-700 px-1 rounded">Lead</span>}
                    </div>
                  ))}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                    course.isCredited 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {course.isCredited ? 'CREDITED' : 'ENROLLING'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseSection;