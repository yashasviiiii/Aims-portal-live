import Student from "../models/Students.js";

export const studentDashboard = async (req, res) => {
  try {
    // Fetch student details from DB using the ID attached by verifyJWT
    const student = await Student.findById(req.userId).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    // This preserves your existing functionality (res.json) 
    // while adding the 'student' data needed for the UI
    res.json({
      message: "Student dashboard accessed",
      userId: req.userId,
      role: req.role,
      student: {
        name: student.name,
        rollNumber: student.rollNumber || "N/A", // Ensure your model has this field
        email: student.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export default studentDashboard;