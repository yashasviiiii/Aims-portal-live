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
      allowedEntryYears,
    } = req.body;

    const creator = await Name.findById(req.userId);
    if (!creator) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    const finalInstructors = [];
    const instructorIdsToCheck = [creator._id];

    // 1. Add creator as the first instructor (coordinator)
    finalInstructors.push({
      instructorId: creator._id,
      name: `${creator.firstName} ${creator.lastName}`,
      isCoordinator: true
    });

    // 2. Resolve other instructors by name
    if (instructors && instructors.length > 0) {
      for (const inst of instructors) {
        // Skip empty instructor rows if any
        if (!inst.name) continue;

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

        // Add to tracking arrays
        instructorIdsToCheck.push(found._id);
        finalInstructors.push({
          instructorId: found._id,
          name: inst.name,
          isCoordinator: inst.isCoordinator
        });
      }
    }

    // 3. 🔹 STRICT SLOT CONFLICT CHECK
    // We use .findOne because we just need to know if at least ONE exists
    const conflictFound = await Course.findOne({
      session: session,
      slot: slot,
      "instructors.instructorId": { $in: instructorIdsToCheck },
      status: { $ne: "rejected" } 
    });

    if (conflictFound) {
      return res.status(409).json({
        conflict: true,
        message: `Conflict: An instructor in this list already has a course in slot ${slot} for session ${session}. Please choose a different slot.`
      });
    }

    // 4. Create the new course
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

    return res.status(201).json({
      message: "Course proposed successfully",
      course: newCourse
    });

  } catch (err) {
    console.error("Add Course Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
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
export const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Remove any { status: "..." } filters to get the full list
    const students = await Enrollment.find({ courseId: courseId })
      .populate("studentId", "firstName lastName email department year")
      .lean();

    res.status(200).json({ success: true, students });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch student list" });
  }
};
export const handleFinalFAAction = async (req, res) => {
  try {
    const { enrollmentIds, action } = req.body;

    let newStatus;
    if (action === 'approve') {
      newStatus = 'approved'; // Final Enrollment
    } else if (action === 'reject') {
      newStatus = 'rejected';
    }

    const result = await Enrollment.updateMany(
      { 
        _id: { $in: enrollmentIds },
        status: 'pending_fa' // Safety check: Advisor processes FA pending items
      },
      { $set: { status: newStatus } }
    );

    res.json({ message: "Success", count: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: "Advisor action failed" });
  }
};
// backend/controllers/fa.controller.js

// backend/controllers/fa.controller.js

