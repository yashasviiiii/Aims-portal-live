import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import healthRoutes from "./src/routes/health.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import studentRoutes from "./src/routes/student.routes.js";
import faRoutes from "./src/routes/fa.routes.js";
import instructorRoutes from "./src/routes/instructor.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";

import {
  verifyJWT,
  requireStudent,
  requireFA,
  requireInstructor
} from "./src/middleware/auth.middleware.js";

import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());


// ================= API ROUTES =================
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/fa", faRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/admin", adminRoutes);


app.get("/api/test", verifyJWT, (req, res) => {
  res.json({
    message: "Protected route accessed",
    userId: req.userId,
    role: req.role,
  });
});

app.get("/api/student/test", verifyJWT, requireStudent, (req, res) => {
  res.json({
    message: "Student route accessed",
    role: req.role,
  });
});

app.get("/api/fa/test", verifyJWT, requireFA, (req, res) => {
  res.json({
    message: "FA route accessed",
    role: req.role,
  });
});

app.get("/api/admin/test", verifyJWT, requireInstructor, (req, res) => {
  res.json({
    message: "Admin route accessed",
    role: req.role,
  });
});


// ================= SERVE FRONTEND (VITE BUILD) =================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve static assets
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get(/^((?!\/api).)*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});


// ================= START SERVER =================
connectDB();

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
