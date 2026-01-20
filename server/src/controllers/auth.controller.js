import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Name from "../models/name.js";
import { sendOTP } from "../utils/mailer.js";
import { isInstituteEmail } from "../utils/emails.utils.js";
import { extractEntryNumber } from "../utils/entry.utils.js";


// Signup
export const signup = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      department,
    } = req.body;

    // 1️⃣ REQUIRED FIELDS CHECK
    if (!email || !password || !role || !firstName || !lastName || !department) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 2️⃣ INSTITUTE EMAIL CHECK
    if (!isInstituteEmail(email)) {
      return res.status(400).json({
        message: "Only @iitrpr.ac.in emails are allowed",
      });
    }

    // 3️⃣ STUDENT ENTRY NUMBER EXTRACTION
    let entryNumber = null;

    if (role === "STUDENT") {
      entryNumber = extractEntryNumber(email);

      if (!entryNumber) {
        return res.status(400).json({
          message: "Invalid student email format for entry number",
        });
      }
    }

    // 4️⃣ CHECK DUPLICATE USER
    const existing = await Name.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔴 5️⃣ GENERATE OTP (MISSING BEFORE)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    // 6️⃣ CREATE USER WITH OTP
    await Name.create({
      email,
      password: await bcrypt.hash(password, 10),
      role,
      firstName,
      lastName,
      department,
      entryNumber,
      otp,
      otpExpiry,
      isVerified: false,
      accountStatus: role === "STUDENT" ? "ACTIVE" : "PENDING",
    });

    await sendOTP(email, otp);

    res.status(201).json({
      message: "Signup successful. OTP sent to email.",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
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

