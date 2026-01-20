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

// CHANGE: Modify the query to status: "open"
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "open" }); // Only show FA-approved courses
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

// CHANGE: Update status to 'pending_instructor' and include instructorId
export const creditCourses = async (req, res) => {
  try {
    const { courseIds } = req.body; 
    
    const enrollmentRequests = await Promise.all(courseIds.map(async (id) => {
      const course = await Course.findById(id);
      return {
        studentId: req.userId,
        courseId: id,
        instructorId: course.instructorId, // Required for instructor to see the request
        status: 'pending_instructor'      // Workflow Stage 1
      };
    }));

    await Enrollment.insertMany(enrollmentRequests);
    res.json({ message: "Requests sent to instructor" });
  } catch (err) {
    res.status(500).json({ message: "Enrollment failed" });
  }
};

// Added the missing function that the router expects
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
