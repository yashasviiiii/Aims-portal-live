/*import bcrypt from "bcrypt";
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
};*/

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Name from "../models/name.js";
import { sendOTP } from "../utils/mailer.js";

// 🔹 SIGNUP
export const signup = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      department,
      rollNo,
      degree,
      year,
    } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const existing = await Name.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 🔐 Role-based account activation
    let accountStatus = "PENDING";
    if (role === "STUDENT") {
      accountStatus = "ACTIVE";
    }

    await Name.create({
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      department,
      rollNo,
      degree,
      year,
      otp,
      otpExpiry: Date.now() + 10 * 60 * 1000,
      accountStatus,
    });

    await sendOTP(email, otp);

    res.status(201).json({
      message: "Signup successful. OTP sent to email.",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 VERIFY OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await Name.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "Already verified" });

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Name.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify OTP first" });
    }

    if (user.accountStatus !== "ACTIVE") {
      return res
        .status(403)
        .json({ message: "Account pending admin approval" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

