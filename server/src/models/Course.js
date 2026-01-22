import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  offeringDept: { type: String, required: true },
  credits: { type: Number, required: true },

  session: { type: String, required: true }, // e.g. 2024-I
  slot: { type: String, required: true },    // e.g. PCE-1

  // 🔹 MULTIPLE INSTRUCTORS
  instructors: [{
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Name', required: true },
    isCoordinator: { type: Boolean, default: false }
  }],

  // 🔹 COURSE AVAILABLE TO WHICH ENTRY YEARS
  allowedEntryYears: {
    type: [Number], // e.g. [2019, 2020]
    required: true
  },

  status: {
    type: String,
    enum: ['proposed', 'enrolling', 'completed', 'rejected'],
    default: 'proposed'
  }

}, { timestamps: true });

export default mongoose.model('Course', courseSchema);