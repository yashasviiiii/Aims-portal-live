import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    rollNumber: {
      type: String,
      required: true,
      unique: true,
    },

    department: {
      type: String,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    facultyAdvisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Name", // FA user
    },
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);