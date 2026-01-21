import Name from "../models/name.js";
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js'; 

export const studentDashboard = async (req, res) => {
  try {
    const user = await Name.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const rollNumber = user.email.split('@')[0];
    res.status(200).json({
      student: { rollNumber: rollNumber, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// FETCH ONLY ENROLLING COURSES
export const getAllCourses = async (req, res) => {
  try {
    // UPDATED: Now looks for 'enrolling' instead of 'open'
    const courses = await Course.find({ status: "enrolling" }); 
    
    const myEnrollments = await Enrollment.find({ studentId: req.userId });
    
    const coursesWithStatus = courses.map(course => {
      const enrolled = myEnrollments.find(e => e.courseId.toString() === course._id.toString());
      return { 
        ...course._doc, 
        isCredited: enrolled?.status === "approved",
        enrollmentStatus: enrolled ? enrolled.status : "not_applied" 
      };
    });

    res.json(coursesWithStatus);
  } catch (err) {
    res.status(500).json({ message: "Error fetching courses" });
  }
};

// SEND ENROLLMENT REQUESTS
export const creditCourses = async (req, res) => {
  try {
    const { courseIds } = req.body; 
    
    const existing = await Enrollment.find({ 
        studentId: req.userId, 
        courseId: { $in: courseIds } 
    });

    const alreadyEnrolledIds = existing.map(e => e.courseId.toString());
    const newCourseIds = courseIds.filter(id => !alreadyEnrolledIds.includes(id));

    if (newCourseIds.length === 0) {
        return res.status(400).json({ message: "Already applied for these courses" });
    }

    const enrollmentRequests = await Promise.all(newCourseIds.map(async (id) => {
      const course = await Course.findById(id);
      
      // FIX 1: Prevent crash if course is null
      if (!course) {
        throw new Error(`Course with ID ${id} not found`);
      }

      return {
        studentId: req.userId,
        courseId: id,
        instructorId: course.instructorId, // This only runs if course exists
        session: course.session,
        status: 'pending_instructor'      
      };
    }));

    await Enrollment.insertMany(enrollmentRequests);
    
    // FIX 2: Use status 201 for created resources
    res.status(201).json({ message: "Requests sent to instructor successfully" });
    
  } catch (err) {
  console.error("DETAILED ERROR:", err); // Look at your terminal!
  res.status(500).json({ 
    message: "Enrollment failed", 
    error: err.message // This will send the real error to your frontend alert
  });
}
};

export const getMyRecords = async (req, res) => {
  try {
    const records = await Enrollment.find({ 
      studentId: req.userId, 
      status: "approved" 
    }).populate('courseId');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Error fetching records" });
  }
};

export const getStudentRecord = async (req, res) => {
  try {
    const studentId = req.userId;

    const student = await Name.findById(studentId).select(
      "firstName lastName department entryNumber email"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const enrollments = await Enrollment.find({
      studentId,
      status: "approved",
    }).populate("courseId");

    if (!enrollments.length) {
      return res.json({
        student,   // ✅ FIX
        records: [],
        cgpa: null,
      });
    }

    const sessions = {};

    enrollments.forEach(e => {
      const session = e.courseId.session;

      if (!sessions[session]) {
        sessions[session] = {
          session,
          courses: [],
        };
      }

      sessions[session].courses.push({
        course: e.courseId,
        grade: e.grade || "NA",
        category: e.courseId.category || "Core",
        status: e.status,
      });
    });

    const records = Object.values(sessions);

    return res.json({
      student,   // ✅ FIX
      records,
      cgpa: null,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
