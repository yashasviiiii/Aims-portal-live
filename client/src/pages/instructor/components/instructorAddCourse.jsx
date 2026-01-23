import React from 'react';
import axios from 'axios';

const InstructorAddCourse = ({ 
  allInstructors, 
  instructors, 
  setInstructors, 
  entryYears, 
  setEntryYears, 
  session, 
  setSession, 
  DEPARTMENTS, 
  ACADEMIC_SESSIONS, 
  config, 
  setActiveTab 
}) => {
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    const payload = {
      ...formData,
      instructors,
      allowedEntryYears: entryYears.split(",").map(Number),
    };

    try {
      await axios.post('http://localhost:5000/api/instructor/add-course', payload, config);
      alert("Course submitted for Faculty Advisor approval");
      setActiveTab("My Courses");
    } catch (err) {
      alert("Submission failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border animate-fadeIn">
      <h2 className="text-2xl font-bold mb-6 text-indigo-900 border-b pb-2">Course Offering Form</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold">Course Code</label>
          <input name="courseCode" className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="text-sm font-semibold">Course Name</label>
          <input name="courseName" className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="text-sm font-semibold">Offering Department</label>
          <select name="offeringDept" className="w-full p-2 border rounded" required>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">Credits</label>
          <input name="credits" type="number" className="w-full p-2 border rounded" required />
        </div>
        <div className="col-span-2">
          <label className="text-sm font-semibold">Allowed Entry Years (comma separated)</label>
          <input type="text" placeholder="e.g. 2019,2020,2021" className="w-full p-2 border rounded" value={entryYears} onChange={(e) => setEntryYears(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm font-semibold">Academic Session</label>
          <input name="session" list="sessions" value={session} onChange={(e) => setSession(e.target.value)} className="w-full p-2 border rounded" required />
          <datalist id="sessions">
            {ACADEMIC_SESSIONS.map((s) => <option key={s} value={s} />)}
          </datalist>
        </div>
        <div>
          <label className="text-sm font-semibold">Slot</label>
          <input name="slot" className="w-full p-2 border rounded" required />
        </div>

        <div className="col-span-2">
          <label className="text-sm font-semibold">Instructors & Coordinators</label>
          {instructors.map((inst, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-center">
              <input
                list={`instructors-${idx}`}
                className="flex-1 p-2 border rounded"
                placeholder="Select Instructor"
                value={inst.name}
                onChange={(e) => {
                  const selected = allInstructors.find(i => `${i.firstName} ${i.lastName}` === e.target.value);
                  const copy = [...instructors];
                  copy[idx] = {
                    name: selected ? `${selected.firstName} ${selected.lastName}` : e.target.value,
                    instructorId: selected?._id || null,
                    isCoordinator: copy[idx].isCoordinator
                  };
                  setInstructors(copy);
                }}
                required
              />
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={inst.isCoordinator} onChange={() => {
                  const copy = [...instructors];
                  copy[idx].isCoordinator = !copy[idx].isCoordinator;
                  setInstructors(copy);
                }} />
                Coordinator
              </label>
              <datalist id={`instructors-${idx}`}>
                {allInstructors.map((i) => <option key={i._id} value={`${i.firstName} ${i.lastName}`} />)}
              </datalist>
            </div>
          ))}
          <button type="button" className="text-xs text-indigo-600 font-bold" onClick={() => setInstructors([...instructors, { name: "", instructorId: null, isCoordinator: false }])}>
            + Add Instructor
          </button>
        </div>
        <button type="submit" className="col-span-2 mt-4 bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700">Submit Proposal</button>
      </form>
    </div>
  );
};

export default InstructorAddCourse;