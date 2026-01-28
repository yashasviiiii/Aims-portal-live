import Course from "../models/Course.js";
import mongoose from 'mongoose';
import Enrollment from '../models/Enrollment.js';
import Name from "../models/name.js";
import ExcelJS from "exceljs";
import CourseInstructor from "../models/CourseInstructor.js";
import Student from "../models/Students.js"

export const instructorDashboard = async (req, res) => {
  try {
    let instructorProfile = await CourseInstructor.findOne({ 
      userId: new mongoose.Types.ObjectId(req.userId) 
    }).populate("userId", "firstName lastName email");

    // NEW LOGIC: If no profile exists, create one automatically
    if (!instructorProfile) {
      console.log("No profile found. Creating a new one for User:", req.userId);
      
      instructorProfile = await CourseInstructor.create({userId: req.userId});
      
      // Re-populate to get the names
      instructorProfile = await instructorProfile.populate("userId", "firstName lastName email");
    }
    // 3. Send the human-readable names back to the frontend
    res.status(200).json({
      message: "Course Instructor dashboard accessed",
      instructor: {
        _id: instructorProfile.userId._id,
        firstName: instructorProfile.userId.firstName,
        lastName: instructorProfile.userId.lastName,
        email: instructorProfile.userId.email
      },
      role: "COURSE_INSTRUCTOR",
      userId: instructorProfile.userId._id
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addCourse = async (req, res) => {
  try {
    const {
      courseCode,
      courseName,
      offeringDept,
      credits,
      session,
      slot,
      instructors, // Array from frontend
      allowedEntryYears,
    } = req.body;

    const creator = await Name.findById(req.userId);
    if (!creator) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    const finalInstructors = [];
    const instructorIdsToCheck = [];

    // 1. Process the list sent from the Frontend
    if (instructors && instructors.length > 0) {
      for (const inst of instructors) {
        if (!inst.name) continue;

        const found = await Name.findOne({
          $expr: {
            $eq: [
              { $concat: ["$firstName", " ", "$lastName"] },
              inst.name
            ]
          }
        });

        if (!found) {
          return res.status(400).json({ message: `Instructor not found: ${inst.name}` });
        }

        // Prevent duplicate IDs in the array
        if (instructorIdsToCheck.includes(found._id.toString())) continue;

        instructorIdsToCheck.push(found._id.toString());
        finalInstructors.push({
          instructorId: found._id,
          name: inst.name,
          isCoordinator: inst.isCoordinator
        });
      }
    }

    // 2. Safety Check: If user unchecked everyone, the creator becomes coordinator by force
    const hasAnyCoordinator = finalInstructors.some(i => i.isCoordinator);
    if (!hasAnyCoordinator) {
      const creatorInList = finalInstructors.find(i => i.instructorId.toString() === creator._id.toString());
      if (creatorInList) {
        creatorInList.isCoordinator = true;
      } else {
        finalInstructors.push({
          instructorId: creator._id,
          name: `${creator.firstName} ${creator.lastName}`,
          isCoordinator: true
        });
        instructorIdsToCheck.push(creator._id.toString());
      }
    }

    // 3. Slot Conflict Check
    const conflictFound = await Course.findOne({
      session,
      slot,
      "instructors.instructorId": { $in: instructorIdsToCheck },
      status: { $ne: "rejected" } 
    });

    if (conflictFound) {
      return res.status(409).json({
        message: `Conflict: An instructor in this list already has a course in slot ${slot} for session ${session}.`
      });
    }

    // 4. Create the Course
    const newCourse = await Course.create({
      courseCode,
      courseName,
      offeringDept,
      credits: Number(credits),
      session,
      slot,
      allowedEntryYears,
      instructors: finalInstructors,
      status: "proposed"
    });

    return res.status(201).json({ message: "Course proposed successfully", course: newCourse });

  } catch (err) {
    console.error("Add Course Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 3. Get My Courses Controller
// 3. Get My Courses Controller (FIXED VERSION)
export const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      "instructors.instructorId": req.userId
    })
    .populate("instructors.instructorId", "firstName lastName email")
    .sort({createdAt:-1});

    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};



// ADD: Get students waiting for instructor approval
export const getPendingEnrollments = async (req, res) => {
  try {
    const pendings = await Enrollment.find({ 
      instructorId: req.userId, 
      status: "pending_instructor" 
    }).populate("studentId", "email").populate("courseId", "courseName courseCode");
    
    res.json(pendings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pending students" });
  }
};

// ADD: Approve/Reject student (Moves to FA)
export const handleStudentRequest = async (req, res) => {
  try {
    const { enrollmentId, action } = req.body; // action: 'approve' or 'reject'
    
    if (action === "reject") {
      await Enrollment.findByIdAndUpdate(enrollmentId, { status: "rejected" });
      return res.json({ message: "Student enrollment rejected" });
    }

    // Move to next stage in workflow
    await Enrollment.findByIdAndUpdate(enrollmentId, { status: "pending_fa" });
    res.json({ message: "Approved. Now awaiting Faculty Advisor approval." });
  } catch (err) {
    res.status(500).json({ message: "Action failed" });
  }
};
// NOTE: DO NOT add "export default" at the bottom. 
// Using "export const" at the top of each function is enough.

export const getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid Course ID format" });
    }

    const course = await Course.findById(courseId)
      .populate("instructors.instructorId", "firstName lastName email");

    
    const enrollments = await Enrollment.find({ courseId })
      .populate({
        path: "studentId",
        model: "Name", // Matches your export default mongoose.model("Name", nameSchema)
        select: "firstName lastName email department year", 
      })
      .lean();
    res.status(200).json({
      course,
      students: enrollments || []
    });
  } catch (err) {
    console.error("DETAILED BACKEND ERROR:", err);
    res.status(500).json({ message: "Error fetching course enrollments" });
  }
};


// get all instructors for auto filling when adding course
export const getAllInstructors = async (req, res) => {
  try {
    const instructors = await Name.find(
      { role: "COURSE_INSTRUCTOR" },
      "_id firstName lastName email"
    );
    res.status(200).json(instructors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch instructors" });
  }
};




export const handleInstructorAction = async (req, res) => {
  try {
    const { enrollmentIds, action } = req.body; // action: 'approve' or 'reject'
    // 1. Validation: Ensure we have IDs to process
    if (!enrollmentIds || enrollmentIds.length === 0) {
      return res.status(400).json({ message: "No students selected" });
    }

    let newStatus;
    if (action === 'approve') {
      newStatus = 'pending_fa'; // Forward to Advisor
    } else if (action === 'reject') {
      newStatus = 'rejected';
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    const result = await Enrollment.updateMany(
      { 
        _id: { $in: enrollmentIds },
        status: 'pending_instructor' 
      },
      { $set: { status: newStatus } }
    );

    res.json({ 
      message: `Successfully ${action}ed ${result.modifiedCount} students.`,
      count: result.modifiedCount 
    });
  } catch (err) {
    console.error("Backend Error:", err);
    res.status(500).json({ message: "Action failed" });
  }
};

// download grades 
export const downloadGradesTemplate = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollments = await Enrollment.find({
      courseId,
      status: "approved"
    }).populate("studentId", "firstName lastName email");

    if (!enrollments.length) {
      return res.status(400).json({ message: "No enrolled students" });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Grades");

    sheet.columns = [
      { header: "Enrollment ID", key: "enrollmentId", width: 30 },
      { header: "Student Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Grade", key: "grade", width: 10 }
    ];

    enrollments.forEach(e => {
      sheet.addRow({
        enrollmentId: e._id.toString(),
        name: `${e.studentId.firstName} ${e.studentId.lastName}`,
        email: e.studentId.email,
        grade: e.grade || ""
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=grades.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    res.status(500).json({ message: "Excel download failed", error: err.message });
  }
};

// upload excel and save grades
export const uploadGradesExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const sheet = workbook.getWorksheet(1);
    const errors = [];

    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);

      // SAFELY extract values
      const enrollmentId =
        row.getCell(1).value?.text ||
        row.getCell(1).value?.toString();

      const grade =
        row.getCell(4).value?.text ||
        row.getCell(4).value?.toString();

      if (!enrollmentId || !grade) {
        errors.push(`Row ${i}: Missing enrollmentId or grade`);
        continue;
      }

      const enrollment = await Enrollment
        .findById(enrollmentId)
        .populate("courseId");

      if (!enrollment) {
        errors.push(`Row ${i}: Enrollment not found`);
        continue;
      }

      // ✅ Check status
      if (enrollment.status !== "approved") {
        errors.push(`Row ${i}: Student not approved`);
        continue;
      }

      // ✅ Check instructor belongs to course
      const isInstructor = enrollment.courseId.instructors.some(
        inst => inst.instructorId.toString() === req.userId
      );

      if (!isInstructor) {
        errors.push(`Row ${i}: Unauthorized instructor`);
        continue;
      }

      enrollment.grade = grade.trim();
      await enrollment.save();
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Partial failure",
        errors
      });
    }

    res.json({ message: "Grades uploaded successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Grade upload failed",
      error: err.message
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // 1. Delete all enrollments associated with this course
    await Enrollment.deleteMany({ courseId: courseId });

    // 2. Delete the course itself
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ 
      message: "Course and associated enrollments deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during deletion" });
  }
};
