export const faDashboard = (req, res) => {
  res.json({
    message: "FA dashboard accessed",
    userId: req.userId,
    role: req.role,
  });
};
