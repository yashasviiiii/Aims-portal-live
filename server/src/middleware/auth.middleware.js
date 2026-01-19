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

export const requireFA = (req, res, next) => {
  if (req.role !== "FA") {
    return res.status(403).json({ message: "FA access only" });
  }
  next();
};

export const requireInstructor = (req, res, next) => {
  if (req.role !== "COURSE_INSTRUCTOR") {
    return res.status(403).json({ message: "Course Instructor access only" });
  }
  next();
};
