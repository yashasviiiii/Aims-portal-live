import mongoose from "mongoose";
const nameSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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

    // Password reset (OTP)
    resetOtp: {
      type: String,
      default: null,
    },

    resetOtpExpiry: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const Name = mongoose.model("Name", nameSchema);
export default Name;
