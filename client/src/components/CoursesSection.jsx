import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CoursesSection = () => {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get('http://localhost:5000/api/student/courses', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCourses(res.data);
  };

  const handleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCredit = async () => {
    if (selected.length === 0) return alert("Select at least one course");
    const token = localStorage.getItem("token");
    try {
      await axios.post('http://localhost:5000/api/student/credit', { courseIds: selected }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Requests sent!");
      setSelected([]);
      fetchCourses(); // Refresh to disable credited courses
    } catch (err) { alert("Error crediting courses"); }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Courses Offered for Enrollment</h2>
      
      {/* Search and Action Bar */}
      <div className="flex flex-wrap gap-4 items-center mb-8 bg-gray-100 p-4 rounded-lg">
        <input 
          type="text" placeholder="Search course..." 
          className="flex-1 p-2 border rounded"
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
        />
        <select className="p-2 border rounded bg-white">
          <option>Sort By</option>
          <option>Code</option>
          <option>Name</option>
        </select>
        <button 
          onClick={handleCredit}
          className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 transition"
        >
          Credit Selected
        </button>
      </div>

      {/* Course List */}
      <div className="space-y-4">
        {courses.filter(c => c.courseName.toLowerCase().includes(search)).map((course, index) => (
          <div key={course._id} className={`flex items-center p-4 border rounded-lg shadow-sm ${course.isCredited ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
            <input 
              type="checkbox" 
              className="w-5 h-5 mr-4 cursor-pointer"
              disabled={course.isCredited}
              checked={selected.includes(course._id)}
              onChange={() => handleSelect(course._id)}
            />
            <div className="grid grid-cols-5 flex-1 items-center gap-4 text-sm font-medium">
              <span className="text-gray-400">#{index + 1}</span>
              <span className="font-bold">{course.courseCode}</span>
              <span className="col-span-1">{course.courseName}</span>
              <span className="text-gray-600 italic">Dr. {course.instructor}</span>
              <span className={`capitalize px-2 py-1 rounded text-center text-xs ${
                course.status === 'enrolling' ? 'bg-green-100 text-green-700' : 'bg-gray-100'
              }`}>
                {course.isCredited ? 'Requested' : course.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesSection;