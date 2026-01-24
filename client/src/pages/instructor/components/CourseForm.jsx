// src/pages/instructor/components/CourseForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DEPARTMENTS = ["Computer Science and Engineering", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Artificial Intelligence", "Chemical Engineering", "Humanities and Social Science"];
const ACADEMIC_SESSIONS = ["2025-II", "2025-S", "2026-I"];

const CourseForm = ({ instructorData, allInstructors, config, onSuccess }) => {
  const [entryYears, setEntryYears] = useState("");
  const [session, setSession] = useState("");
  const [instructors, setInstructors] = useState([
    { name: `${instructorData.firstName} ${instructorData.lastName}`, instructorId: instructorData._id, isCoordinator: true }
  ]);


  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border animate-fadeIn">
      <h2 className="text-2xl font-bold mb-6 text-indigo-900 border-b pb-2">Course Offering Form</h2>
        
                    <form
              onSubmit={async (e) => {
                e.preventDefault();
                const toastId = toast.loading("Submitting course proposal...");
                const formData = Object.fromEntries(new FormData(e.target));

                const payload = {
                  ...formData,
                  instructors, // Array of { email, isCoordinator }
                  allowedEntryYears: entryYears.split(",").map(Number),
                };

                try {
                  const res = await axios.post('http://localhost:5000/api/instructor/add-course', payload, config);
                  if (res.status === 200 || res.status === 201) {
                      toast.success("Course submitted for Faculty Advisor approval", { id: toastId });
                   try {
      if (typeof fetchMyCourses === "function") {
        await fetchMyCourses();
      }
      onSuccess("My Courses");
    } catch (innerErr) {
      console.error("Post-submit UI error:", innerErr);
    }
  }
                } catch (err) {
                    console.error("Submit Error:", err.response?.data);
                  if (err.response && err.response.status === 409) {
                        // 🔹 HARD ERROR: User must change the slot
                    toast.error(`Conflict: ${err.response.data.message}`, { id: toastId });
                    } else if(err.response?.status === 401) {
                        // Token issue
                       toast.error("Session expired. Please log in again.", { id: toastId });
                    } else {
                    toast.error("Submission failed: " + (err.response?.data?.message || "Server Error"), { id: toastId });
                    }
                  }
                }}
              className="grid grid-cols-2 gap-4"
            >
              {/* Course Code */}
              <div>
                <label className="text-sm font-semibold">Course Code</label>
                <input name="courseCode" className="w-full p-2 border rounded" required />
              </div>

              {/* Course Name */}
              <div>
                <label className="text-sm font-semibold">Course Name</label>
                <input name="courseName" className="w-full p-2 border rounded" required />
              </div>

              {/* Offering Department */}
              <div>
                <label className="text-sm font-semibold">Offering Department</label>
                <select name="offeringDept" className="w-full p-2 border rounded" required>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Credits */}
              <div>
                <label className="text-sm font-semibold">Credits</label>
                <input name="credits" type="number" min="0" step="0.5" className="w-full p-2 border rounded" required />
              </div>

              {/* Allowed Entry Years */}
              <div className="col-span-2">
                <label className="text-sm font-semibold">Allowed Entry Years (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. 2019,2020,2021"
                  className="w-full p-2 border rounded"
                  value={entryYears}
                  onChange={(e) => setEntryYears(e.target.value)}
                  required
                />
              </div>

              {/* Academic Session */}
              <div>
                <label className="text-sm font-semibold">Academic Session</label>
                <input
                  name="session"
                  list="sessions"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
                <datalist id="sessions">
                  {ACADEMIC_SESSIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              {/* Slot */}
              <div>
                <label className="text-sm font-semibold">Slot</label>
                <input name="slot" className="w-full p-2 border rounded" required />
              </div>

              {/* Instructors & Coordinators */}
<div className="col-span-2">
  <label className="text-sm font-semibold text-gray-700 mb-2 block">
    Instructors & Coordinators
  </label>

  {instructors.map((inst, idx) => (
  <div key={idx} className="flex gap-2 mb-3 items-center animate-fadeIn">
    {/* Instructor Selection */}
    <input
      list={idx > 0 ? `instructors-${idx}` : ""} // Disable suggestions for the first row
      className={`flex-1 p-2 border rounded outline-none transition-all ${
        idx === 0 
          ? "bg-gray-100 text-gray-600 cursor-not-allowed font-medium" // Locked style for row 1
          : "bg-white focus:ring-2 focus:ring-indigo-200"
      }`}
      placeholder={idx === 0 ? "Loading profile..." : "Select Instructor"}
      value={inst.name}
      readOnly={idx === 0} // 🔹 Prevent editing the logged-in instructor's name
      onChange={(e) => {
        if (idx === 0) return; // Guard clause
        const selected = allInstructors.find(
          i => `${i.firstName} ${i.lastName}` === e.target.value
        );

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

    {/* Coordinator Checkbox */}
    <label className="flex items-center gap-1 text-xs cursor-pointer hover:text-indigo-600 transition">
      <input
        type="checkbox"
        className="rounded text-indigo-600 w-4 h-4"
        checked={inst.isCoordinator}
        onChange={() => {
          const copy = [...instructors];
          const turningOn = !copy[idx].isCoordinator;

          // Single coordinator logic: if turning one ON, turn all others OFF
          if (turningOn) {
            copy.forEach((item) => (item.isCoordinator = false));
          }
          
          copy[idx].isCoordinator = turningOn;
          setInstructors(copy);
        }}
      />
      Coord.
    </label>

    {/* Remove Button Logic */}
    {idx > 0 ? (
      <button
        type="button"
        title="Remove Instructor"
        onClick={() => {
          const copy = instructors.filter((_, i) => i !== idx);
          setInstructors(copy);
        }}
        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    ) : (
      <div className="w-8"></div> // Space maintainer for Row 1
    )}

    {/* Suggestions List (Only for Guest rows) */}
    {idx > 0 && (
      <datalist id={`instructors-${idx}`}>
        {allInstructors.map((i) => (
          <option key={i._id} value={`${i.firstName} ${i.lastName}`} />
        ))}
      </datalist>
    )}
  </div>
))}

  {/* Add New Instructor Button */}
  <button
    type="button"
    className="mt-1 flex items-center gap-1 text-xs text-indigo-600 font-bold hover:text-indigo-800 transition"
    onClick={() =>
      setInstructors([
        ...instructors,
        { name: "", instructorId: null, isCoordinator: false }
      ])
    }
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
    Add Instructor
  </button>
</div>
              {/* Submit Button */}
              <button
                type="submit"
                className="col-span-2 mt-4 hover:bg-indigo-600 text-white py-2 rounded font-bold"
              >
                Submit Proposal
              </button>
            </form>
        {/* Replace your instructors.map logic here */}
    </div>
  );
};

export default CourseForm;