import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { 
  studentDashboard, 
  getAllCourses, 
  creditCourses 
} from "../controllers/student.controller.js";

const router = express.Router();

router.get("/dashboard", verifyJWT, studentDashboard);
router.get("/courses", verifyJWT, getAllCourses);
router.post("/credit", verifyJWT, creditCourses);

// THIS IS THE MISSING LINE CAUSING THE ERROR:
export default router;