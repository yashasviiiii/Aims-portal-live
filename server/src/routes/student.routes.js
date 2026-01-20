import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { 
  studentDashboard, 
  getAllCourses, 
  creditCourses, 
  getMyRecords 
} from "../controllers/student.controller.js";

const router = express.Router();

// 1. Student Profile/Dashboard Data
router.get("/dashboard", verifyJWT, studentDashboard);

// 2. Fetch courses that are FA-Approved (status: 'open')
router.get("/courses", verifyJWT, getAllCourses);

// 3. Student requests to enroll (Starts the 'pending_instructor' chain)
router.post("/credit", verifyJWT, creditCourses);

// 4. Fetch final records (Status: 'approved')
router.get("/my-records", verifyJWT, getMyRecords);

export default router;