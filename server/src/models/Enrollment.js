import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Name", required: true },
  // Approval Flow: 
  // 1. pending_instructor (Initial)
  // 2. pending_fa (After Instructor approves)
  // 3. approved (After FA approves)
  // 4. rejected
  status: { 
    type: String, 
    enum: ["pending_instructor", "pending_fa", "approved", "rejected"], 
    default: "pending_instructor" 
  },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Name" }
}, { timestamps: true });

export default mongoose.model("Enrollment", enrollmentSchema);