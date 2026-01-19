import express from "express";
import {
  verifyJWT,
  requireInstructor,
} from "../middleware/auth.middleware.js";
import {
  instructorDashboard,
  addCourse, // Add this
} from "../controllers/instructor.controller.js";

const router = express.Router();

router.get(
  "/dashboard",
  verifyJWT,
  requireInstructor,
  instructorDashboard
);

// New route for adding courses
router.post(
  "/add-course",
  verifyJWT,
  requireInstructor,
  addCourse
);

export default router;