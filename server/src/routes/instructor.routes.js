import express from "express";
import {
  verifyJWT,
  requireInstructor,
} from "../middleware/auth.middleware.js";
import {
  instructorDashboard,
} from "../controllers/instructor.controller.js";

const router = express.Router();

router.get(
  "/dashboard",
  verifyJWT,
  requireInstructor,
  instructorDashboard
);

export default router;
