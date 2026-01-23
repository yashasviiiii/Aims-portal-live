import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Name from "../models/name.js";

// 1. FA Dashboard - Basic Info
export const faDashboard = async (req, res) => {
  try {
    const fa = await Name.findById(req.userId).select("-password");
    res.json({
      message: "FA dashboard accessed",
      userId: req.userId,
      role: req.role,
      fa: {
        name: fa.email.split('@')[0].toUpperCase(),
        email: fa.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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
// 2. Get My Courses: Fetches only what the logged-in user created
export const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({"instructors.instructorId": req.userId});
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching your courses" });
  }
};

// 2. Get All Pending Course Proposals (Instructor -> FA)

// backend/controllers/fa.controller.js

export const getProposedCourses = async (req, res) => {
  try {
    // FIX: Populate the correct nested path in the instructors array
    const proposals = await Course.find({ status: 'proposed' })
      .populate('instructors.instructorId', 'firstName lastName email'); 

    res.status(200).json(proposals);
  } catch (err) {
    console.error("FA Proposal Error:", err);
    // This sends the 500 error seen in your console
    res.status(500).json({ message: "Failed to fetch details", error: err.message });
  }
};

export const handleCourseAction = async (req, res) => {
  try {
    const { courseIds, action } = req.body; // action is 'approve' or 'reject'

    if (!courseIds || !Array.isArray(courseIds)) {
      return res.status(400).json({ message: "Invalid course IDs" });
    }

    const newStatus = action === 'approve' ? 'enrolling' : 'rejected';

    // Update the status of all selected courses
    const result = await Course.updateMany(
      { _id: { $in: courseIds } }, 
      { $set: { status: newStatus } }
    );

    console.log("Database Update Result:", result);

    res.json({ 
      message: `Successfully ${action}ed ${courseIds.length} courses.` 
    });
  } catch (err) {
    console.error("FA Action Error:", err);
    res.status(500).json({ message: "Server error during course update" });
  }
};

// 4. Final FA Approval for Student Enrollment (Student -> Instructor -> FA)
export const handleStudentEnrollment = async (req, res) => {
  try {
    const { enrollmentId, action } = req.body; // action: 'approve' or 'reject'
    
    const status = action === "approve" ? "approved" : "rejected";
    
    const enrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId, 
      { status: status }, 
      { new: true }
    );

    res.json({ message: `Enrollment ${status} successfully`, enrollment });
  } catch (error) {
    res.status(500).json({ message: "Error processing enrollment" });
  }
};

export const getEnrollingCourses = async (req, res) => {
  try {
    // Fetch all courses that are currently in the enrollment phase
    const courses = await Course.find({ status: 'enrolling' }).sort({ courseCode: 1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching enrolling courses" });
  }
};

export const handleFinalFAAction = async (req, res) => {
  try {
    const { enrollmentIds, action } = req.body;
    // Final step: moving to 'approved' or 'rejected'
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    await Enrollment.updateMany(
      { _id: { $in: enrollmentIds } },
      { $set: { status: newStatus } }
    );

    res.json({ message: `Enrollments successfully ${newStatus}` });
  } catch (err) {
    res.status(500).json({ message: "Final approval failed" });
  }
};
// backend/controllers/fa.controller.js

// backend/controllers/fa.controller.js

