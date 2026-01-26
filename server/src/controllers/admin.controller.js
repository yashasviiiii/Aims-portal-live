import Name from "../models/name.js";
import CourseInstructor from "../models/CourseInstructor.js";

// View pending users
export const getPendingUsers = async (req, res) => {
  const users = await Name.find({
    accountStatus: "PENDING",
    role: { $ne: "STUDENT" },
  }).select("-password -otp");

  res.json(users);
};

export const getAllUsers = async (req, res) => {
  const users = await Name.find({
    accountStatus: "ACTIVE",
    role: { $nin: ["STUDENT", "ADMIN"] },
  }).select("-password -otp");

  res.json(users);
};


// Approve user
export const approveUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Update the account status in the Name model
    const user = await Name.findByIdAndUpdate(
      userId,
      { accountStatus: "ACTIVE" },
      { new: true } // Returns the document after the update
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. If the user is a COURSE_INSTRUCTOR, initialize their profile
    if (user.role === "COURSE_INSTRUCTOR") {
      await CourseInstructor.findOneAndUpdate(
        { userId: user._id },    // Look for this user
        { userId: user._id },    // Set the userId
        { upsert: true, new: true } // Create if doesn't exist, update if it does
      );
      console.log(`Instructor profile initialized for: ${user.email}`);
    }

    res.json({ 
      message: user.role === "COURSE_INSTRUCTOR" 
        ? "User approved and Instructor profile created" 
        : "User approved successfully" 
    });

  } catch (error) {
    console.error("Approval Error:", error);
    res.status(500).json({ message: "Internal server error during approval" });
  }
};

// Reject user
export const rejectUser = async (req, res) => {
  await Name.findByIdAndUpdate(req.params.id, {
    accountStatus: "REJECTED",
  });

  res.json({ message: "User rejected" });
};
