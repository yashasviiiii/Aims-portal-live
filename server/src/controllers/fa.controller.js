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

// 2. Get All Pending Course Proposals (Instructor -> FA)
export const getProposedCourses = async (req, res) => {
  try {
    const proposedCourses = await Course.find({ status: "proposed" }).sort({ createdAt: -1 });
    res.json(proposedCourses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching proposals" });
  }
};

// 3. Approve or Reject Course Proposal
export const handleCourseProposal = async (req, res) => {
  try {
    const { courseId, action } = req.body; // action: 'approve' or 'reject'

    if (action === "reject") {
      // If rejected, delete the course completely from DB
      await Course.findByIdAndDelete(courseId);
      return res.json({ message: "Course proposal rejected and removed from database" });
    }

    // If approved, change status to 'open' so students can see it
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId, 
      { status: "open" }, 
      { new: true }
    );

    res.json({ message: "Course approved! It is now open for enrollment.", course: updatedCourse });
  } catch (error) {
    res.status(500).json({ message: "Error updating course status" });
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