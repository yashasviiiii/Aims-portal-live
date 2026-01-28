import express from "express";
import { requireInstructor, verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";
import { 
  instructorDashboard, 
  addCourse, 
  getMyCourses,
  getPendingEnrollments,
  handleStudentRequest,
  getCourseEnrollments,
  handleInstructorAction,
  getAllInstructors,
  downloadGradesTemplate,
  uploadGradesExcel,
  deleteCourse
} from "../controllers/instructor.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- DASHBOARD & COURSE MANAGEMENT ---

// Get instructor profile data
router.get("/dashboard", verifyJWT, requireInstructor, instructorDashboard);

// Get courses proposed/added by this instructor
router.get("/my-courses", verifyJWT, requireInstructor, getMyCourses);

// Instructor proposes a new course (Status starts as 'proposed')
router.post("/add-course", verifyJWT, requireInstructor, addCourse);
router.get(
  "/all",
  verifyJWT,
  requireInstructor, // or requireFA if needed
  getAllInstructors
);

// --- STUDENT ENROLLMENT WORKFLOW ---



// 2. Instructor approves/rejects student (Moves status to 'pending_fa' or 'rejected')
router.post("/handle-student-request", verifyJWT, requireInstructor, handleStudentRequest);
router.get("/course-students/:courseId", verifyJWT, requireInstructor, getCourseEnrollments);
router.post("/enrollment-action", verifyJWT,requireInstructor, handleInstructorAction);
router.delete("/delete-course/:courseId", verifyJWT, authorizeRoles("COURSE_INSTRUCTOR", "FA"), deleteCourse);
router.get("/download-grades/:courseId", verifyJWT, downloadGradesTemplate);
router.post("/upload-grades/:courseId", verifyJWT, upload.single("file"), uploadGradesExcel);

export default router;