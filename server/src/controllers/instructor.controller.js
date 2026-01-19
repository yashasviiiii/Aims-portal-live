export const instructorDashboard = (req, res) => {
  res.json({
    message: "Course Instructor dashboard accessed",
    userId: req.userId,
    role: req.role,
  });
};
