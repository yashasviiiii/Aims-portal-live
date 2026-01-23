import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  courseCode: String,
  courseName: String,
  offeringDept: String,
  credits: Number,
  session: String,
  slot: String,

  allowedEntryYears: [Number],

  instructors: [
    {
      instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Name",
        required: true
      },
      name: {
        type: String,
        required: true
      },
      isCoordinator: {
        type: Boolean,
        default: false
      }
    }
  ],

  status: {
    type: String,
    enum: ["proposed", "enrolling", "completed", "rejected"],
    default: "proposed"
  }

}, { timestamps: true });

courseSchema.index({ session: 1, slot: 1, "instructors.instructorId": 1 });
export default mongoose.model('Course', courseSchema);
