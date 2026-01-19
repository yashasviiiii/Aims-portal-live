import Course from "../models/Course.js";
import Name from "../models/name.js";

export const instructorDashboard = async (req, res) => {
  try {
    const instructor = await Name.findById(req.userId).select(
      "firstName lastName email department role"
    );

    if (!instructor) {
      return res.status(404).json({ message: "Instructor record not found" });
    }

    res.status(200).json({
      instructor: {
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        email: instructor.email,
        department: instructor.department,
        role: instructor.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// 2. Add Course Controller
export const addCourse = async (req, res) => {
  try {
    const { courseCode, courseName, offeringDept, credits, session, slot } = req.body;
    
    const instructor = await Name.findById(req.userId);

    const newCourse = await Course.create({
      courseCode,
      courseName,
      offeringDept,
      credits,
      session,
      slot,
      instructor: instructor.email.split('@')[0],
      instructorId: req.userId,
      status: 'proposed' 
    });

    res.status(201).json({ message: "Course proposed successfully", course: newCourse });
  } catch (error) {
    res.status(500).json({ message: "Error proposing course", error: error.message });
  }
};

// 3. Get My Courses Controller
export const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructorId: req.userId }).sort({ _id: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching your courses" });
  }
};

// NOTE: DO NOT add "export default" at the bottom. 
// Using "export const" at the top of each function is enough.