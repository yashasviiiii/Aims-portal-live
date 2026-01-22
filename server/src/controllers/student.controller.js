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

// FETCH COURSES FILTERED BY STUDENT'S ENTRY YEAR
export const getAllCourses = async (req, res) => {
  try {
    const user = await Name.findById(req.userId); 
    if (!user) return res.status(404).json({ message: "User not found" });

    const courses = await Course.find({ 
      status: "enrolling",
      allowedEntryYears: user.year 
    }).populate('instructors.instructorId', 'firstName lastName'); // Populate names

    const myEnrollments = await Enrollment.find({ studentId: req.userId });

    const coursesWithStatus = courses.map(course => {
      const enrolled = myEnrollments.find(e => e.courseId.toString() === course._id.toString());
      
      // Create a clean string of all professor names
      const allProfNames = course.instructors
        .map(i => i.instructorId ? `Prof. ${i.instructorId.firstName} ${i.instructorId.lastName}` : "Unknown Prof")
        .join(", ");

      return { 
        ...course._doc, 
        instructorDisplay: allProfNames, // New field for easy searching/display
        isCredited: !!enrolled,
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

    // 1. Fetch student details from the 'Name' model
    // Using the fields confirmed in your database screenshot (image_1f32b6.png)
    const student = await Name.findById(studentId).select(
      "firstName lastName department year email"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2. Fetch enrollments and populate course details
    const enrollments = await Enrollment.find({
      studentId,
      status: "approved",
    }).populate("courseId");

    // If no records found, return empty structure early
    if (!enrollments || enrollments.length === 0) {
      return res.json({
        student,
        records: [],
        cgpa: 0,
      });
    }

    const sessions = {};

    // 3. Process enrollments into grouped sessions
    enrollments.forEach((e) => {
      // --- CRITICAL FIX: Skip if courseId is null (orphaned enrollment) ---
      if (!e.courseId) {
        console.warn(`Skipping enrollment ${e._id} because the course no longer exists.`);
        return; 
      }

      const sessionName = e.courseId.session || "Unknown Session";

      if (!sessions[sessionName]) {
        sessions[sessionName] = {
          session: sessionName,
          courses: [],
        };
      }

      sessions[sessionName].courses.push({
        course: e.courseId,
        grade: e.grade || "NA",
        category: e.courseId.category || "Core",
        status: e.status,
      });
    });

    const records = Object.values(sessions);

    // 4. Return the formatted data
    return res.json({
      student,
      records,
      cgpa: null, // You can implement CGPA logic here later
    });

  } catch (err) {
    console.error("Error in getStudentRecord:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
