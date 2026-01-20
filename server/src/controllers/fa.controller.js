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
    const { courseCode, courseName, offeringDept, credits, session, slot } = req.body;

    // 1. Get FA/User details directly from the Name model
    const user = await Name.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Create the Course directly
    // We use req.userId as the instructorId regardless of their role
    const newCourse = await Course.create({
      courseCode,
      courseName,
      offeringDept,
      credits: Number(credits),
      session,
      slot,
      instructor: user.email.split('@')[0], // Derives name from email
      instructorId: req.userId,
      status: 'proposed'
    });

    // NOTE: We skip the CourseInstructor model update to avoid 
    // dependency on a specific instructor profile.

    res.status(201).json({ 
      message: "Course proposed successfully", 
      course: newCourse 
    });
  } catch (error) {
    console.error("Submission Error:", error);
    res.status(500).json({ message: "Error processing request", error: error.message });
  }
};
// 3. Get My Courses Controller
// 2. Get My Courses: Fetches only what the logged-in user created
export const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructorId: req.userId }).sort({ _id: -1 });
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching your courses" });
  }
};

// 2. Get All Pending Course Proposals (Instructor -> FA)

export const getProposedCourses = async (req, res) => {
  try {
    // Find courses where status is exactly 'proposed'
    const proposals = await Course.find({ status: 'proposed' })
      .populate('instructorId', 'name email'); // This fills the instructorId with actual data

    res.status(200).json(proposals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch details" });
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

// ADD: Get enrollments waiting for final FA approval
export const getEnrolmentRequestsForFA = async (req, res) => {
  try {
    const requests = await Enrollment.find({ status: "pending_fa" })
      .populate("studentId", "email")
      .populate("courseId", "courseName courseCode")
      .populate("instructorId", "email");
    
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching FA pending requests" });
  }
};

// ADD: Final approval (Completes the record)
export const finalizeEnrollment = async (req, res) => {
  try {
    const { enrollmentId, action } = req.body;
    const finalStatus = action === "approve" ? "approved" : "rejected";

    await Enrollment.findByIdAndUpdate(enrollmentId, { status: finalStatus });
    res.json({ message: `Enrollment ${finalStatus} by Faculty Advisor` });
  } catch (err) {
    res.status(500).json({ message: "Finalization failed" });
  }
};