import Name from "../models/name.js"; // Match your model file exactly

export const studentDashboard = async (req, res) => {
  try {
    // req.userId comes from your verifyJWT middleware
    const user = await Name.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // This splits "2023CSB1001@gmail.com" into "2023CSB1001"
    const rollNumber = user.email.split('@')[0];

    res.status(200).json({
      student: {
        rollNumber: rollNumber,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};