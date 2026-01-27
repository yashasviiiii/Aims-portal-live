import Name from "../models/name.js";
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js'; 
import { gradePoints } from "../utils/gradePoints.js";
import puppeteer from "puppeteer";
import { transcriptHTML } from "../utils/transcriptTemplate.js";

export const studentDashboard = async (req, res) => {
  try {
    const user = await Name.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const rollNumber = user.email.split('@')[0];
    res.status(200).json({
      student: { rollNumber: rollNumber, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// FETCH COURSES FILTERED BY STUDENT'S ENTRY YEAR
export const getAllCourses = async (req, res) => {
  try {
    const user = await Name.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const courses = await Course.find({
      status: "enrolling",
      allowedEntryYears: user.year
    }).populate("instructors.instructorId", "firstName lastName");

    const myEnrollments = await Enrollment.find({ studentId: req.userId });

    const coursesWithStatus = courses.map(course => {
      const enrollment = myEnrollments.find(
        e => e.courseId.toString() === course._id.toString()
      );

      const allProfNames = course.instructors
        .map(i =>
          i.instructorId
            ? `Prof. ${i.instructorId.firstName} ${i.instructorId.lastName}`
            : "Unknown Prof"
        )
        .join(", ");

      return {
        _id: course._id,
        courseCode: course.courseCode,
        courseName: course.courseName,
        offeringDept: course.offeringDept,
        credits: course.credits,
        slot: course.slot,
        instructorDisplay: allProfNames,
        enrollmentStatus: enrollment ? enrollment.status : "not_enrolled"
      };
    });

    res.json(coursesWithStatus);
  } catch (err) {
    res.status(500).json({ message: "Error fetching courses" });
  }
};


// SEND ENROLLMENT REQUESTS
export const creditCourses = async (req, res) => {
  try {
    const { courseIds } = req.body;

    if (!courseIds?.length) {
      return res.status(400).json({ message: "No courses selected" });
    }

    // prevent duplicate enrollments except dropped
    const existing = await Enrollment.find({
      studentId: req.userId,
      courseId: { $in: courseIds },
      status: { $ne: "dropped" }
    });

    const alreadyIds = new Set(
      existing.map(e => e.courseId.toString())
    );

    const newCourseIds = courseIds.filter(
      id => !alreadyIds.has(id)
    );

    if (!newCourseIds.length) {
      return res.status(400).json({
        message: "Already applied / enrolled"
      });
    }

    const enrollmentRequests = await Promise.all(
      newCourseIds.map(async (id) => {
        const course = await Course.findById(id);

        if (!course) throw new Error(`Course not found`);

        // ✅ MULTIPLE COORDINATOR SUPPORT
        const coordinators = course.instructors.filter(i => i.isCoordinator);

        const assignedInstructor =
          coordinators.length > 0
            ? coordinators[0]            // pick first coordinator
            : course.instructors[0];     // fallback

        if (!assignedInstructor) {
          throw new Error(`No instructor assigned for ${course.courseCode}`);
        }

        return {
          studentId: req.userId,
          courseId: id,
          instructorId: assignedInstructor.instructorId,
          session: course.session,
          status: "pending_instructor"
        };
      })
    );

    await Enrollment.insertMany(enrollmentRequests);

    res.status(201).json({
      message: "Requests sent to instructor successfully"
    });

  } catch (err) {
    console.error("Enrollment Error:", err);
    res.status(500).json({
      message: "Enrollment failed",
      error: err.message
    });
  }
};


export const getMyRecords = async (req, res) => {
  try {
    const records = await Enrollment.find({ 
      studentId: req.userId, 
      status: "approved" 
    }).populate('courseId');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Error fetching records" });
  }
};

export const getStudentRecord = async (req, res) => {
  try {
    const studentId = req.userId;

    const student = await Name.findById(studentId).select(
      "firstName lastName department year email"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const enrollments = await Enrollment.find({
      studentId,
      status:  {$in: ["approved", "withdrawn"]} 
    }).populate("courseId");

    if (!enrollments || enrollments.length === 0) {
      return res.json({
        student,
        records: [],
        cgpa: 0,
      });
    }

    const sessions = {};

    let totalCreditsAll = 0;
    let totalPointsAll = 0;

    enrollments.forEach((e) => {
      if (!e.courseId) return;

      const sessionName = e.courseId.session || "Unknown Session";
      const credits = e.courseId.credits || 0;
      const grade = e.grade;

      if (!sessions[sessionName]) {
        sessions[sessionName] = {
          session: sessionName,
          courses: [],
          totalCredits: 0,
          totalPoints: 0,
          sgpa: null,
        };
      }

      // Add course entry
      sessions[sessionName].courses.push({
        course: e.courseId,
        grade: grade || "NA",
        category: e.courseId.category || "Core",
        status: e.status,
      });

      // GPA calculation (only if grade is valid)
      if (grade && gradePoints[grade] !== undefined) {
        const points = gradePoints[grade] * credits;

        sessions[sessionName].totalCredits += credits;
        sessions[sessionName].totalPoints += points;

        totalCreditsAll += credits;
        totalPointsAll += points;
      }
    });

    // Compute SGPA per session
    Object.values(sessions).forEach((s) => {
      if (s.totalCredits > 0) {
        s.sgpa = s.totalPoints / s.totalCredits;
      } else {
        s.sgpa = null;
      }

      // cleanup (optional)
      delete s.totalPoints;
    });

    const cgpa =
      totalCreditsAll > 0 ? totalPointsAll / totalCreditsAll : 0;

    return res.json({
      student,
      records: Object.values(sessions),
      cgpa,
    });
  } catch (err) {
    console.error("Error in getStudentRecord:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const downloadTranscript = async (req, res) => {
  try {
    const studentId = req.userId;

    const student = await Name.findById(studentId).select(
      "firstName lastName department email"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const enrollments = await Enrollment.find({
      studentId,
      status: { $in: ["approved", "withdrawn"] }
    }).populate("courseId");

    const sessions = {};
    let totalCreditsAll = 0;
    let totalPointsAll = 0;

    enrollments.forEach((e) => {
      if (!e.courseId) return;

      const sessionName = e.courseId.session || "Unknown Session";
      const credits = e.courseId.credits || 0;
      const grade = e.grade;

      if (!sessions[sessionName]) {
        sessions[sessionName] = {
          session: sessionName,
          courses: [],
          totalCredits: 0,
          totalPoints: 0,
          sgpa: null,
        };
      }

      sessions[sessionName].courses.push({
        courseCode: e.courseId.courseCode,
        courseName: e.courseId.courseName,
        credits,
        grade: e.status === "withdrawn" ? "W" : (grade || "NA"),
        status: e.status,
      });

      if (
        e.status === "approved" &&
        grade &&
        gradePoints[grade] !== undefined
      ) {
        const points = gradePoints[grade] * credits;

        sessions[sessionName].totalCredits += credits;
        sessions[sessionName].totalPoints += points;

        totalCreditsAll += credits;
        totalPointsAll += points;
      }
    });


    Object.values(sessions).forEach((s) => {
      s.sgpa = s.totalCredits > 0 ? s.totalPoints / s.totalCredits : null;
      delete s.totalPoints;
    });

    const cgpa =
      totalCreditsAll > 0 ? totalPointsAll / totalCreditsAll : null;

    const transcriptData = {
      student: {
        firstName: `${student.firstName}`,
        lastName: `${student.lastName}`,
        rollNo: student.email.split("@")[0],
        department: student.department,
        email: student.email,
      },
      records: Object.values(sessions),
      cgpa,
    };

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(transcriptHTML(transcriptData), {
      waitUntil: "networkidle0",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=transcript.pdf",
    });

    res.send(pdf);

  } catch (err) {
    console.error("Transcript Error:", err);
    res.status(500).json({
      message: "Failed to generate transcript",
      error: err.message,
    });
  }
};

export const courseAction = async (req, res) => {
  try {
    const studentId = req.userId;
    const { courseIds, action } = req.body;

    if (!courseIds?.length) {
      return res.status(400).json({ message: "No courses selected" });
    }

    if (!["credit", "drop", "withdraw"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    // ---------- CREDIT (create enrollment if needed) ----------
    if (action === "credit") {
      for (const courseId of courseIds) {
        let enrollment = await Enrollment.findOne({ studentId, courseId });

        if (!enrollment) {
          const course = await Course.findById(courseId);

          if (!course) {
            return res.status(404).json({ message: "Course not found" });
          }

          const coordinators = course.instructors.filter(i => i.isCoordinator);

          const assignedInstructor =
            coordinators.length > 0
              ? coordinators[0]
              : course.instructors[0];

          if (!assignedInstructor) {
            return res.status(400).json({
              message: `No instructor assigned for ${course.courseCode}`
            });
          }

          await Enrollment.create({
            studentId,
            courseId,
            instructorId: assignedInstructor.instructorId,
            session: course.session,
            status: "pending_instructor"
          });
        }

      }

      return res
        .status(200)
        .json({ message: "Credit request submitted successfully" });
    }

    // ---------- DROP / WITHDRAW (must already exist) ----------
    const statusMap = {
      drop: "dropped",
      withdraw: "withdrawn"
    };

    const enrollments = await Enrollment.find({
      studentId,
      courseId: { $in: courseIds }
    });

    if (!enrollments.length) {
      return res.status(404).json({ message: "Enrollment records not found" });
    }

    for (const e of enrollments) {
      if (["dropped", "withdrawn"].includes(e.status)) {
        continue; // block invalid transitions
      }

      e.status = statusMap[action];
      await e.save();
    }

    res.status(200).json({ message: "Course status updated successfully" });

  } catch (err) {
    console.error("courseAction error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// Student: view all students in a course (NO grades)
// STUDENT → view all enrollments of a course (NO grades)
/*export const getCourseStudentsForStudent = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollments = await Enrollment.find({ courseId })
      .populate({
        path: "studentId",
        select: "firstName lastName email department year"
      })
      .populate({
        path: "courseId",
        select: "courseCode courseName offeringDept slot session credits instructors"
      })
      .lean();

    // ❌ remove grades for privacy
    const safeData = enrollments.map(e => ({
      _id: e._id,
      status: e.status,
      studentId: e.studentId,
      courseId: e.courseId
    }));

    res.json({ students: safeData });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch course students" });
  }
};*/
export const getCourseStudentsForStudent = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollments = await Enrollment.find({ courseId })
      .populate({
        path: "studentId",
        select: "firstName lastName email department year"
      })
      .populate({
        path: "courseId",
        select: "courseCode courseName offeringDept slot session credits instructors",
        populate: {
          path: "instructorId",
          select: "firstName lastName"
        }
      })
      .lean();

    if (!enrollments.length) {
      return res.json({ course: null, students: [] });
    }

    // ✅ extract course once (all enrollments share same course)
    const course = enrollments[0].courseId;

    // ❌ remove grades
    const safeStudents = enrollments.map(e => ({
      _id: e._id,
      status: e.status,
      studentId: e.studentId
    }));

    res.json({
    course: enrollments[0]?.courseId || null,
    students: safeData
    });


  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch course students" });
  }
};
