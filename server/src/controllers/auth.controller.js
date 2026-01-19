import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Name from "../models/name.js";

export const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await Name.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Name.create({
      email,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      message: "Signup successful",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
export const login = async (req, res) => {
  try {
    console.log("LOGIN BODY 👉", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await Name.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
     return res.status(400).json({ message: "Invalid credentials" });
    }


    const token = jwt.sign(
   {
    id: user._id,
    role: user.role,
   },
   process.env.JWT_SECRET,
   { expiresIn: "1d" }
  );

return res.status(200).json({
  message: "Login successful",
  token,
  role: user.role,
});

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
