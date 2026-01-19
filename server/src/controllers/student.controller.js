export const studentDashboard = (req, res) => {
  res.json({
    message: "Student dashboard accessed",
    userId: req.userId,
    role: req.role,
  });
};
