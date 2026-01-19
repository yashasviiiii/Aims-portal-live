import express from "express";
import {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers
} from "../controllers/admin.controller.js";
import {
  verifyJWT,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/pending-users", verifyJWT, requireAdmin, getPendingUsers);
router.post("/approve/:id", verifyJWT, requireAdmin, approveUser);
router.post("/reject/:id", verifyJWT, requireAdmin, rejectUser);
router.get("/users", verifyJWT, requireAdmin, getAllUsers);

export default router;
