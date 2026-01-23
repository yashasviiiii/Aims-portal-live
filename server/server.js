import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express';
import dotenv from 'dotenv';
import healthRoutes from "./src/routes/health.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import cors from "cors";
import {
  verifyJWT,
  requireStudent,
  requireFA,
  requireInstructor
} from "./src/middleware/auth.middleware.js";
import studentRoutes from "./src/routes/student.routes.js";
import faRoutes from "./src/routes/fa.routes.js";
import instructorRoutes from "./src/routes/instructor.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";


import { connectDB } from './config/db.js';
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors()); 
app.use(express.json());
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/fa", faRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/admin", adminRoutes);


app.get('/', (req, res) => {
    res.send("Hello World");
});

app.get("/api/test", verifyJWT, (req, res) => {
  res.json({
    message: "Protected route accessed",
    userId: req.userId,
    role: req.role,
  });
});

app.get(
  "/api/student/test",
  verifyJWT,
  requireStudent,
  (req, res) => {
    res.json({
      message: "Student route accessed",
      role: req.role,
    });
  }
);

app.get(
  "/api/fa/test",
  verifyJWT,
  requireFA,
  (req, res) => {
    res.json({
      message: "FA route accessed",
      role: req.role,
    });
  }
);

app.get(
  "/api/admin/test",
  verifyJWT,
  requireInstructor,
  (req, res) => {
    res.json({
      message: "Admin route accessed",
      role: req.role,
    });
  }
);


connectDB();

app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});