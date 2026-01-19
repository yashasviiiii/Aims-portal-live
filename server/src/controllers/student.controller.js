import Name from "../models/name.js";
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js'; 

export const studentDashboard = async (req, res) => {
  try {
    // req.userId comes from your verifyJWT middleware
    const user = await Name.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // This splits "2023CSB1001@gmail.com" into "2023CSB1001"
    const rollNumber = user.email.split('@')[0];

    res.status(200).json({
      student: {
        rollNumber: rollNumber,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all courses and check if student is already enrolled
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    const myEnrollments = await Enrollment.find({ studentId: req.userId });
    
    // Map courses to include a 'isCredited' flag
    const coursesWithStatus = courses.map(course => {
      const enrolled = myEnrollments.find(e => e.courseId.toString() === course._id.toString());
      return { ...course._doc, isCredited: !!enrolled };
    });

    res.json(coursesWithStatus);
  } catch (err) {
    res.status(500).json({ message: "Error fetching courses" });
  }
};

// Request to Credit/Enroll
export const creditCourses = async (req, res) => {
  try {
    const { courseIds } = req.body; // Array of selected course IDs
    
    const enrollmentRequests = courseIds.map(id => ({
      studentId: req.userId,
      courseId: id,
      status: 'pending'
    }));

    await Enrollment.insertMany(enrollmentRequests);
    res.json({ message: "Request sent to instructor for approval" });
  } catch (err) {
    res.status(500).json({ message: "Enrollment failed" });
  }
};