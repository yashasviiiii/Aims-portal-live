import React from 'react';

const HomeTab = ({ name }) => {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-bold text-indigo-900 mb-4">
        Faculty Advisor Portal
      </h2>
      <p className="text-gray-600">
        Welcome, Prof. {name}. Use the taskbar above to manage offerings.
      </p>
      
      <div className="mt-6 p-6 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg">
        <p className="text-indigo-900 font-bold mb-2">Quick Guide:</p>
        <ul className="space-y-2 text-indigo-800 text-sm">
          <li>
            <b>• Add Course:</b> Propose a new course you intend to teach.
          </li>
          <li>
            <b>• My Courses:</b> View status of your personal course submissions.
          </li>
          <li>
            <b>• Approve Courses:</b> Review and Open/Reject all departmental proposals.
          </li>
          <li>
            <b>• All Courses:</b> Final approval for student enrollment requests.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HomeTab;