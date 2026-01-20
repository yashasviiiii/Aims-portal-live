import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  offeringDept: { type: String, required: true },
  credits: { type: Number, required: true },
  session: { type: String, required: true }, // e.g., 2024-I
  slot: { type: String, required: true },    // e.g., pce-1
  instructor: { type: String, required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Name' },
  status: { 
    type: String, 
    enum: ['proposed', 'enrolling', 'completed','rejected'], 
    default: 'proposed' 
  }
});

export default mongoose.model('Course', courseSchema);