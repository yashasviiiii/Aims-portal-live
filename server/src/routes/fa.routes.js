import express from "express";
import { authorizeRoles, verifyJWT } from "../middleware/auth.middleware.js";
import { 
  faDashboard, 
  getProposedCourses, 
  handleCourseAction, 
  addCourse, 
  getMyCourses,
  getEnrollingCourses, 
  handleFinalFAAction,
  getCourseStudents // 1. Ensure this is imported
} from "../controllers/fa.controller.js";

const router = express.Router();

// Middleware shortcut for FA routes
const isFA = authorizeRoles("FA");

router.get("/dashboard", verifyJWT, isFA, faDashboard);
router.get("/proposed-proposals", verifyJWT, isFA, getProposedCourses);
router.post("/handle-proposals", verifyJWT, isFA, handleCourseAction);

// 2. Fix the middleware and controller name here
// Change this line to use authorizeRoles("FA") and the correct function
router.get("/course-students/:courseId", verifyJWT,authorizeRoles("FA"), getCourseStudents);
// Add this line with your other FA routes
router.post("/enrollment-action", verifyJWT, authorizeRoles("FA"), handleFinalFAAction);
router.post("/add-course", verifyJWT, authorizeRoles("FA", "COURSE_INSTRUCTOR"), addCourse);
router.get("/my-courses", verifyJWT, authorizeRoles("FA", "COURSE_INSTRUCTOR"), getMyCourses);

router.get("/all-enrolling-courses", verifyJWT, isFA, getEnrollingCourses);
router.post("/final-approval", verifyJWT, isFA, handleFinalFAAction);

export default router;