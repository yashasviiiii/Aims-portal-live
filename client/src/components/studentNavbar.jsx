import React from 'react';

const StudentNavbar = ({ rollNumber, setActiveTab }) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };
  return (
    <nav className="bg-slate-800 text-white shadow-md">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-slate-700">
        <h1 className="text-2xl font-bold tracking-wider">AIMS</h1>
        <div className="flex items-center gap-4">
          <span className="bg-slate-700 px-3 py-1 rounded text-sm font-mono">{rollNumber}</span>
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
        <button 
          onClick={() => setActiveTab('Home')} 
          className="px-8 py-2 hover:bg-white hover:text-blue-600 font-medium border-r border-slate-200 transition-all"
        >
          Home
        </button>
        <button 
          onClick={() => setActiveTab('Courses')} 
          className="px-8 py-2 hover:bg-white hover:text-blue-600 font-medium border-r border-slate-200 transition-all"
        >
          Courses
        </button>
        <button 
          onClick={() => setActiveTab('Record')} 
          className="px-8 py-2 hover:bg-white hover:text-blue-600 font-medium border-r border-slate-200 transition-all"
        >
          Record
        </button>
        <button 
          onClick={() => setActiveTab('Help')} 
          className="px-8 py-2 hover:bg-white hover:text-blue-600 font-medium border-r border-slate-200 transition-all"
        >
          Help
        </button>
      </div>
    </nav>
  );
};

export default StudentNavbar;