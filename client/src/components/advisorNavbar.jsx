import React, { useState } from 'react';

const AdvisorNavbar = ({ name, setActiveTab }) => {
    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.setItem("logout", Date.now());

      window.location.href = "/";
    };
  const [showDropdown, setShowDropdown] = useState(false);

  const handleTabSelection = (tab) => {
    setActiveTab(tab);
    setShowDropdown(false);
  };

  return (
    <nav className="bg-indigo-900 text-white shadow-md">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-indigo-800">
        <h1 className="text-2xl font-bold tracking-wider">AIMS | Advisor</h1>
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
        {['Home', 'Add Course'].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className="px-8 py-2 hover:bg-white hover:text-indigo-600 font-semibold border-r border-slate-200 transition-all"
          >
            {tab}
          </button>
        ))}

        {/* --- DROPDOWN FOR COURSES --- */}
        <div 
          className="relative border-r border-slate-200"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <button className="px-8 py-2 hover:bg-white hover:text-indigo-600 font-semibold transition-all flex items-center gap-2">
            Courses
            <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute left-0 w-64 bg-white shadow-xl z-50 border border-slate-200 flex flex-col animate-fadeIn rounded-b-md">
              <button 
                onClick={() => handleTabSelection("My Courses")}
                className="px-4 py-3 text-left hover:bg-indigo-50 text-slate-700 font-semibold text-sm border-b border-slate-100 transition-colors"
              >
                My Courses <span className="text-[10px] text-gray-400 block font-normal">Manage your own subjects</span>
              </button>
              
              <button 
                onClick={() => handleTabSelection("Approve Courses")}
                className="px-4 py-3 text-left hover:bg-indigo-50 text-slate-700 font-semibold text-sm border-b border-slate-100 transition-colors"
              >
                Approve Course <span className="text-[10px] text-gray-400 block font-normal">Review departmental offerings</span>
              </button>
              <button 
                onClick={() => handleTabSelection("All Courses")}
                className="px-4 py-3 text-left hover:bg-indigo-50 text-slate-700 font-semibold text-sm transition-colors"
              >
                All Courses <span className="text-[10px] text-gray-400 block font-normal">Final student enrollment approval</span>
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={() => setActiveTab('Help')}
          className="px-8 py-2 hover:bg-white hover:text-indigo-600 font-semibold border-r border-slate-200 transition-all"
        >
          Help
        </button>
      </div>
    </nav>
  );
};

export default AdvisorNavbar;