import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Name", required: true },
  // Approval Flow: 
  // 1. pending_instructor (Initial)
  // 2. pending_fa (After Instructor approves)
  // 3. approved (After FA approves)
  // 4. rejected
  session: {
    type: String, // e.g. "2023-I", "2023-II"
    required: true
  },

  grade: {
    type: String, // A, A-, B, etc.
    default: null
  },
  status: { 
    type: String, 
    enum: ["pending_instructor", "pending_fa", "approved", "rejected", "dropped", "withdrawn"], 
    default: "pending_instructor" 
  },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Name" }
}, { timestamps: true });

export default mongoose.model("Enrollment", enrollmentSchema);