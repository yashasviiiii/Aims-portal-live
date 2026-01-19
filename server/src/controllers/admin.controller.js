import Name from "../models/name.js";

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
  await Name.findByIdAndUpdate(req.params.id, {
    accountStatus: "ACTIVE",
  });

  res.json({ message: "User approved" });
};

// Reject user
export const rejectUser = async (req, res) => {
  await Name.findByIdAndUpdate(req.params.id, {
    accountStatus: "REJECTED",
  });

  res.json({ message: "User rejected" });
};
