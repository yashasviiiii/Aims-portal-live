import React from 'react';

const InstructorNavbar = ({ name, setActiveTab }) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <nav className="bg-indigo-900 text-white shadow-md">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-indigo-800">
        <h1 className="text-2xl font-bold tracking-wider">AIMS | Instructor</h1>
        <div className="flex items-center gap-4">
          <span className="bg-indigo-800 px-3 py-1 rounded text-sm font-mono">
            Prof. {name}
          </span>
          <button 
            onClick={handleLogout}
            className="hover:text-red-300 transition-colors font-medium text-sm"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Taskbar Panes */}
      <div className="flex bg-slate-100 text-slate-800">
        {['Home', 'My Courses', 'Add Course', 'Help'].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className="px-8 py-2 hover:bg-white hover:text-indigo-600 font-semibold border-r border-slate-200 transition-all"
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default InstructorNavbar;