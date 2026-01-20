import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { 
  studentDashboard, 
  getAllCourses, 
  creditCourses, 
  getMyRecords,
  getStudentRecord 
} from "../controllers/student.controller.js";

const router = express.Router();

// 1. Student Profile/Dashboard Data
router.get("/dashboard", verifyJWT, studentDashboard);

// 2. Fetch courses available for registration (Database status: 'enrolling')
// This now matches the logic in your updated controller
router.get("/courses", verifyJWT, getAllCourses);

// 3. Student requests to enroll (Creates records with status: 'pending_instructor')
router.post("/credit", verifyJWT, creditCourses);

// 4. Fetch finalized student records (Database status: 'approved')
router.get("/my-records", verifyJWT, getMyRecords);

router.get("/record", verifyJWT, getStudentRecord);

export default router;