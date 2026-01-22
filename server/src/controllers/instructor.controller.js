import Course from "../models/Course.js";
import Enrollment from '../models/Enrollment.js';
import Name from "../models/name.js";

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
    const {
      courseCode,
      courseName,
      offeringDept,
      credits,
      session,
      slot,
      instructors,
      allowedEntryYears
    } = req.body;

    const creator = await Name.findById(req.userId);
    if (!creator) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    const finalInstructors = [];

    // 🔹 Auto-add creator as coordinator
    finalInstructors.push({
      instructorId: creator._id,
      name: `${creator.firstName} ${creator.lastName}`,
      isCoordinator: true
    });

    // 🔹 Resolve other instructors by NAME
    for (const inst of instructors) {
      const found = await Name.findOne({
        $expr: {
          $eq: [
            { $concat: ["$firstName", " ", "$lastName"] },
            inst.name
          ]
        }
      });

      if (!found) {
        return res.status(400).json({
          message: `Instructor not found: ${inst.name}`
        });
      }

      finalInstructors.push({
        instructorId: found._id,
        name: inst.name,
        isCoordinator: inst.isCoordinator
      });
    }

    const newCourse = await Course.create({
      courseCode,
      courseName,
      offeringDept,
      credits: Number(credits),
      session,
      slot,
      allowedEntryYears,
      instructors: finalInstructors,
      status: "proposed"
    });

    res.status(201).json({
      message: "Course proposed successfully",
      course: newCourse
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 3. Get My Courses Controller
// 3. Get My Courses Controller (FIXED VERSION)
export const getMyCourses = async (req, res) => {
  try {
    // DO NOT use CourseInstructor. courses can have duplicate codes across different sessions.
    // Fetch directly from the Course collection using your unique ID.
    const courses = await Course.find({
      "instructors.instructorId": req.userId
    });


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

export const getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Find enrollments for this specific course that are waiting for THIS instructor
    const enrollments = await Enrollment.find({ 
      courseId: courseId,
      status: { $in: ['pending_instructor', 'pending_fa', 'approved'] } 
    }).populate('studentId', 'email'); // Get student details

    res.status(200).json(enrollments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching students" });
  }
};

// get all instructors for auto filling when adding course
export const getAllInstructors = async (req, res) => {
  try {
    const instructors = await Name.find(
      { role: "COURSE_INSTRUCTOR" },
      "_id firstName lastName email"
    );
    res.status(200).json(instructors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch instructors" });
  }
};


export const handleInstructorAction = async (req, res) => {
  try {
    const { enrollmentIds, action } = req.body; // action: 'approve' or 'reject'
    const newStatus = action === 'approve' ? 'pending_fa' : 'rejected';

    await Enrollment.updateMany(
      { _id: { $in: enrollmentIds } },
      { $set: { status: newStatus } }
    );

    res.json({ message: `Students ${action}ed successfully` });
  } catch (err) {
    res.status(500).json({ message: "Action failed" });
  }
};