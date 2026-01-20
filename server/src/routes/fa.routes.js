import express from "express";
import { authorizeRoles, verifyJWT} from "../middleware/auth.middleware.js";
import { 
  faDashboard, 
  getProposedCourses, 
  handleCourseAction, 
  addCourse, 
  getMyCourses,
  handleStudentEnrollment 
} from "../controllers/fa.controller.js";

const router = express.Router();

router.get("/dashboard", verifyJWT, authorizeRoles("FA"), faDashboard);
//router.get("/proposed-courses", verifyJWT, requireFA, getProposedCourses);
//router.post("/handle-enrollment", verifyJWT, requireFA, handleStudentEnrollment);

router.get("/proposed-proposals", verifyJWT, authorizeRoles("FA"), getProposedCourses);
router.post("/handle-proposals", verifyJWT, authorizeRoles("FA"), handleCourseAction);

router.post("/add-course", verifyJWT, authorizeRoles("FA", "COURSE_INSTRUCTOR"), addCourse);
router.get("/my-courses", verifyJWT, authorizeRoles("FA", "COURSE_INSTRUCTOR"), getMyCourses);
export default router;