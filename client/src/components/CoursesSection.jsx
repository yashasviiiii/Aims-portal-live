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
    try {
      const res = await axios.get('http://localhost:5000/api/student/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching available courses");
    }
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
      alert("Enrolment requests sent to instructors!");
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

  return (
    <div className="p-4 animate-fadeIn">
      <h2 className="text-2xl font-bold mb-6 text-indigo-900">Course Registration</h2>
      
      <div className="flex flex-wrap gap-4 items-center mb-8 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
        <input 
          type="text" placeholder="Search by name or code..." 
          className="flex-1 p-2 border rounded outline-none focus:ring-2 focus:ring-indigo-300"
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
        />
        <button 
          onClick={handleCredit}
          className="bg-indigo-600 text-white px-8 py-2 rounded font-bold hover:bg-indigo-700 transition shadow-md disabled:bg-gray-400"
          disabled={selected.length === 0}
        >
          Request Enrolment ({selected.length})
        </button>
      </div>

      <div className="space-y-3">
        {courses
          .filter(c => c.courseName.toLowerCase().includes(search) || c.courseCode.toLowerCase().includes(search))
          .map((course, index) => {
            const isDisabled = isActionDisabled(course.enrollmentStatus);
            
            return (
              <div key={course._id} className={`flex items-center p-4 border rounded-xl transition-all ${
                isDisabled ? 'bg-gray-50 border-gray-200' : 'bg-white border-indigo-100 hover:shadow-md'
              }`}>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 mr-6 cursor-pointer accent-indigo-600"
                  disabled={isDisabled}
                  checked={selected.includes(course._id)}
                  onChange={() => handleSelect(course._id)}
                />
                
                <div className="grid grid-cols-6 flex-1 items-center gap-4">
                  <span className="text-xs font-bold text-gray-400 font-mono">{course.courseCode}</span>
                  <div className="col-span-2">
                    <p className="font-bold text-gray-800">{course.courseName}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{course.offeringDept} • Slot {course.slot}</p>
                  </div>
                  <span className="text-sm text-gray-600">Prof. {course.instructor}</span>
                  
                  <div className="col-span-2 text-right">
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                      course.enrollmentStatus === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                      course.enrollmentStatus === 'pending_instructor' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                      course.enrollmentStatus === 'pending_fa' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {getStatusLabel(course.enrollmentStatus)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CoursesSection;