import express from "express";
import { verifyJWT, requireStudent } from "../middleware/auth.middleware.js";
import { studentDashboard } from "../controllers/student.controller.js";

const router = express.Router();

router.get(
  "/dashboard",
  verifyJWT,
  requireStudent,
  studentDashboard
);

export default router;
