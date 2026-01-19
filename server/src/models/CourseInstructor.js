import mongoose from "mongoose";

const courseInstructorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    courses: [
      {
        type: String, // later can be ObjectId to Course schema
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("CourseInstructor", courseInstructorSchema);
