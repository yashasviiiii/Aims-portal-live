import jwt from "jsonwebtoken";

export const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
export const requireStudent = (req, res, next) => {
  if (req.role !== "STUDENT") {
    return res.status(403).json({ message: "Student access only" });
  }
  next();
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required: ${allowedRoles.join(" or ")}` 
      });
    }
    next();
  };
};

export const requireFA = authorizeRoles("FA");
export const requireInstructor = authorizeRoles("COURSE_INSTRUCTOR", "FA"); // FA can now do Instructor tasks

export const requireAdmin = (req, res, next) => {
  if (req.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};
