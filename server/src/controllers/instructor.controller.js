import Course from "../models/Course.js";
import Enrollment from '../models/Enrollment.js';
import Name from "../models/name.js";
import ExcelJS from "exceljs";

export const instructorDashboard = async (req, res) => {
  try {
    const instructor = await Name.findById(req.userId).select("-password");
    if (!instructor) {
      return res.status(404).json({ message: "Instructor record not found" });
    }

    const displayName = instructor.email.split('@')[0];

    res.json({
      message: "Course Instructor dashboard accessed",
      userId: req.userId,
      role: req.role,
      instructor: {
        name: displayName,
        email: instructor.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
      instructors,
      allowedEntryYears,
    } = req.body;

    const creator = await Name.findById(req.userId);
    if (!creator) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    const finalInstructors = [];
    const instructorIdsToCheck = [creator._id];

    // 1. Add creator as the first instructor (coordinator)
    finalInstructors.push({
      instructorId: creator._id,
      name: `${creator.firstName} ${creator.lastName}`,
      isCoordinator: true
    });

    // 2. Resolve other instructors by name
    if (instructors && instructors.length > 0) {
      for (const inst of instructors) {
        // Skip empty instructor rows if any
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
          return res.status(400).json({
            message: `Instructor not found: ${inst.name}`
          });
        }

        // Add to tracking arrays
        instructorIdsToCheck.push(found._id);
        finalInstructors.push({
          instructorId: found._id,
          name: inst.name,
          isCoordinator: inst.isCoordinator
        });
      }
    }

    // 3. 🔹 STRICT SLOT CONFLICT CHECK
    // We use .findOne because we just need to know if at least ONE exists
    const conflictFound = await Course.findOne({
      session: session,
      slot: slot,
      "instructors.instructorId": { $in: instructorIdsToCheck },
      status: { $ne: "rejected" } 
    });

    if (conflictFound) {
      return res.status(409).json({
        conflict: true,
        message: `Conflict: An instructor in this list already has a course in slot ${slot} for session ${session}. Please choose a different slot.`
      });
    }

    // 4. Create the new course
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

    return res.status(201).json({
      message: "Course proposed successfully",
      course: newCourse
    });

  } catch (err) {
    console.error("Add Course Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 3. Get My Courses Controller
// 3. Get My Courses Controller (FIXED VERSION)
export const getMyCourses = async (req, res) => {
  try {
    // DO NOT use CourseInstructor. courses can have duplicate codes across different sessions.
    // Fetch directly from the Course collection using your unique ID.
    const courses = await Course.find({
      "instructors.instructorId": req.userId
    });


    res.status(200).json(courses);
  } catch (err) {
    console.error("Error fetching instructor courses:", err);
    res.status(500).json({ message: "Error fetching your courses" });
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
    
    // Find enrollments for this specific course that are waiting for THIS instructor
    const enrollments = await Enrollment.find({ 
      courseId: courseId,
      status: { $in: ['pending_instructor', 'pending_fa', 'approved'] } 
    }).populate('studentId', 'email'); // Get student details

    res.status(200).json(enrollments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching students" });
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
    const newStatus = action === 'approve' ? 'pending_fa' : 'rejected';

    await Enrollment.updateMany(
      { _id: { $in: enrollmentIds } },
      { $set: { status: newStatus } }
    );

    res.json({ message: `Students ${action}ed successfully` });
  } catch (err) {
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
