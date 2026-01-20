import Course from "../models/Course.js";
import Name from "../models/name.js";
import CourseInstructor from "../models/CourseInstructor.js";

export const instructorDashboard = async (req, res) => {
  try {
    const instructor = await Name.findById(req.userId).select("-password");
    if (!instructor) {
      return res.status(404).json({ message: "Instructor record not found" });
    }

    const displayName = instructor.email.split('@')[0];

    res.json({
      message: "Course Instructor dashboard accessed",
      userId: req.userId,
      role: req.role,
      instructor: {
        name: displayName,
        email: instructor.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addCourse = async (req, res) => {
  try {
    const { courseCode, courseName, offeringDept, credits, session, slot } = req.body;

    // 1. Get Instructor details
    const instructor = await Name.findById(req.userId);
    if (!instructor) return res.status(404).json({ message: "Instructor not found" });

    // 2. Create the Course in the main Course collection
    const newCourse = await Course.create({
      courseCode,
      courseName,
      offeringDept,
      credits: Number(credits),
      session,
      slot,
      instructor: instructor.email.split('@')[0],
      instructorId: req.userId,
      status: 'proposed'
    });

    // 3. Update the CourseInstructor schema (The list of courses for this instructor)
    // This finds the instructor's record and adds the new course code to their array
    await CourseInstructor.findOneAndUpdate(
      { userId: req.userId },
      { $addToSet: { courses: courseCode } }, // $addToSet prevents duplicate codes
      { upsert: true, new: true } // Creates the record if it doesn't exist
    );

    res.status(201).json({ 
      message: "Course proposed and added to your profile successfully", 
      course: newCourse 
    });
  } catch (error) {
    console.error("Submission Error:", error);
    res.status(500).json({ message: "Error processing request", error: error.message });
  }
};

// 3. Get My Courses Controller
export const getMyCourses = async (req, res) => {
  try {
    // 1. Find the instructor's specific course list
    const instructorProfile = await CourseInstructor.findOne({ userId: req.userId });

    if (!instructorProfile || instructorProfile.courses.length === 0) {
      return res.json([]); // Return empty array if no courses yet
    }

    // 2. Fetch full details for all course codes in that instructor's list
    const courses = await Course.find({ 
      courseCode: { $in: instructorProfile.courses } 
    }).sort({ _id: -1 });

    res.status(200).json(courses);
  } catch (err) {
    console.error("Error fetching instructor courses:", err);
    res.status(500).json({ message: "Error fetching your courses" });
  }
};

// ADD: Get students waiting for instructor approval
export const getPendingEnrollments = async (req, res) => {
  try {
    const pendings = await Enrollment.find({ 
      instructorId: req.userId, 
      status: "pending_instructor" 
    }).populate("studentId", "email").populate("courseId", "courseName courseCode");
    
    res.json(pendings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pending students" });
  }
};

// ADD: Approve/Reject student (Moves to FA)
export const handleStudentRequest = async (req, res) => {
  try {
    const { enrollmentId, action } = req.body; // action: 'approve' or 'reject'
    
    if (action === "reject") {
      await Enrollment.findByIdAndUpdate(enrollmentId, { status: "rejected" });
      return res.json({ message: "Student enrollment rejected" });
    }

    // Move to next stage in workflow
    await Enrollment.findByIdAndUpdate(enrollmentId, { status: "pending_fa" });
    res.json({ message: "Approved. Now awaiting Faculty Advisor approval." });
  } catch (err) {
    res.status(500).json({ message: "Action failed" });
  }
};
// NOTE: DO NOT add "export default" at the bottom. 
// Using "export const" at the top of each function is enough.
