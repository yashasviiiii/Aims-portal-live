import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    type: {
      type: String,
      enum: ["LEAVE", "COURSE_CHANGE", "DOCUMENT", "OTHER"],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // FA
      default: null,
    },

    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Request", requestSchema);
