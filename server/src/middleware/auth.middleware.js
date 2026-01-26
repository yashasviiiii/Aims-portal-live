import jwt from "jsonwebtoken";

export const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role }; // For new code
  req.userId = decoded.id;                           // For old code
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
    if (!req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      console.log(`Access denied for role: ${req.role}`);
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
