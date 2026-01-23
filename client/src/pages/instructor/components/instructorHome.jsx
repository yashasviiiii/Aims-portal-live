import React from 'react';

const InstructorHome = ({ name }) => (
  <div className="animate-fadeIn">
    <h2 className="text-xl font-bold text-indigo-900 mb-4">Instructor Portal</h2>
    <p className="text-gray-600">Welcome Prof. {name} to the Academic Information Management System</p>
    <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400">
      <p className="text-blue-800 font-medium">Quick Actions:</p>
      <ul className="list-disc ml-5 mt-2 text-blue-700">
        <li>Use <b>Add Course</b> to launch new enrollments.</li>
        <li>Check <b>My Courses</b> to see your proposed or enrolling subjects.</li>
      </ul>
    </div>
  </div>
);

export default InstructorHome;