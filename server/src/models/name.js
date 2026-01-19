import mongoose from "mongoose";

const nameSchema = new mongoose.Schema(
  {
    // 🔐 Auth
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["STUDENT", "FA", "COURSE_INSTRUCTOR", "ADMIN"],
      required: true,
    },

    // ✅ OTP verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: String,
    otpExpiry: Date,

    // 🛂 Admin approval
    accountStatus: {
      type: String,
      enum: ["PENDING", "ACTIVE", "REJECTED"],
      default: "PENDING",
    },

    // 👤 Profile info
    firstName: String,
    lastName: String,
    department: String,
    rollNo: String,
    degree: String,
    year: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Name", nameSchema);
