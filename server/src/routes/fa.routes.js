import express from "express";
import { verifyJWT, requireFA } from "../middleware/auth.middleware.js";
import { 
  faDashboard, 
  getProposedCourses, 
  handleCourseProposal, 
  handleStudentEnrollment 
} from "../controllers/fa.controller.js";

const router = express.Router();

router.get("/dashboard", verifyJWT, requireFA, faDashboard);
router.get("/proposed-courses", verifyJWT, requireFA, getProposedCourses);
router.post("/handle-proposal", verifyJWT, requireFA, handleCourseProposal);
router.post("/handle-enrollment", verifyJWT, requireFA, handleStudentEnrollment);

export default router;