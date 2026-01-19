import Course from "../models/Course.js";
import Name from "../models/name.js";

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
      status: 'proposed' // Hardcoded as per your requirement
    });

    res.status(201).json({ message: "Course proposed successfully", course: newCourse });
  } catch (error) {
    res.status(500).json({ message: "Error proposing course", error: error.message });
  }
};

export const getMyCourses = async (req, res) => {
  try {
    // Finds courses where instructorId matches the logged-in user
    const courses = await Course.find({ instructorId: req.userId }).sort({ _id: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching your courses" });
  }
};