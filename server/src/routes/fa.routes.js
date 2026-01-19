import express from "express";
import { verifyJWT, requireFA } from "../middleware/auth.middleware.js";
import { faDashboard } from "../controllers/fa.controller.js";

const router = express.Router();

router.get(
  "/dashboard",
  verifyJWT,
  requireFA,
  faDashboard
);

export default router;
