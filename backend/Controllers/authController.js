import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Admin from "../models/AdminSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  validateRegistrationForm,
  validateLoginForm,
} from "../utils/validation.js";
import { verifyGoogleToken } from "../utils/googleAuth.js";

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing in environment");
  }
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET, // ✅ match .env
    { expiresIn: "24h" } // 24 hours - reasonable expiration for admin operations
  );
};

export const register = async (req, res, next) => {
  try {
    console.log("📝 Registration request received:", req.body);
    const formData = req.body || {};

    // Basic validation first to identify the issue
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.role ||
      !formData.gender
    ) {
      console.log("❌ Missing required fields:", {
        name: !!formData.name,
        email: !!formData.email,
        password: !!formData.password,
        role: !!formData.role,
        gender: !!formData.gender,
      });
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, email, password, role, and gender are required",
      });
    }

    // Extract and validate data
    let { name, email, password, role, photo, gender, phone } = formData;

    // Clean and validate the data
    name = name?.trim();
    email = email?.toLowerCase().trim();
    role = role?.toLowerCase();
    gender = gender?.toLowerCase();

    console.log("🔍 Extracted data:", {
      name,
      email,
      role,
      gender,
      hasPassword: !!password,
      hasPhoto: !!photo,
      hasPhone: !!phone,
    });

    // Ensure password is not undefined
    if (!password || typeof password !== "string") {
      console.log("❌ Password is missing or invalid:", typeof password);
      return res.status(400).json({
        success: false,
        message: "Password is required and must be a valid string",
      });
    }

    // Validate role
    if (!["patient", "doctor", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'patient', 'doctor', or 'admin'",
      });
    }

    // Validate gender
    if (!["male", "female", "other"].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender. Must be 'male', 'female', or 'other'",
      });
    }

    console.log("✅ Basic validation passed");

    // Select appropriate model based on role
    let Model;
    if (role === "doctor") {
      Model = Doctor;
    } else if (role === "admin") {
      Model = Admin;
    } else {
      Model = User; // default patient
    }

    // Check if user already exists in any collection
    let existingUser =
      (await User.findOne({ email })) ||
      (await Doctor.findOne({ email })) ||
      (await Admin.findOne({ email }));

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "An account with this email already exists. Please use a different email or try logging in.",
      });
    }

    // Hash password with stronger salt rounds
    const hash = await bcrypt.hash(password, 12);

    // Create user with validated and sanitized data
    const userData = {
      name,
      email,
      password: hash,
      role,
      gender,
      photo: photo || null,
    };

    // Add phone for admin users
    if (role === "admin" && phone) {
      userData.phone = phone;
    }

    const user = new Model(userData);
    await user.save();

    console.log(`✅ New ${role} registered: ${name} (${email})`);

    return res.status(201).json({
      success: true,
      message: `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } account created successfully! Please login to continue.`,
    });
  } catch (err) {
    console.error("Registration error:", err);
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const formData = req.body || {};

    // Validate login form
    const validation = validateLoginForm(formData);

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      return res.status(400).json({
        success: false,
        message: firstError ? firstError[0] : "Validation failed",
        errors: validation.errors,
      });
    }

    const { email, password, role } = validation.sanitizedData;

    // Search across all user types (User, Doctor, Admin)
    let user =
      (await User.findOne({ email }).select("+password")) ||
      (await Doctor.findOne({ email }).select("+password")) ||
      (await Admin.findOne({ email }).select("+password"));

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "No account found with this email address. Please check your email or register for a new account.",
      });
    }

    // Check if role matches (if specified)
    if (role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `This email is registered as a ${user.role}, not a ${role}. Please select the correct role or use the correct email.`,
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password. Please check your password and try again.",
      });
    }

    // Update lastLogin for admin users
    if (user.role === "admin") {
      try {
        // Use updateOne to avoid validation issues with existing admin records
        await Admin.updateOne(
          { _id: user._id },
          { lastLogin: new Date() },
          { runValidators: false } // Skip validation for this update
        );
      } catch (updateError) {
        console.warn("Could not update admin lastLogin:", updateError.message);
        // Don't fail login if lastLogin update fails
      }
    }

    const token = generateToken(user);
    const { password: _pwd, ...safe } = user.toObject
      ? user.toObject()
      : user._doc;

    // Set secure cookie with 24-hour expiration to match JWT token
    res.cookie(process.env.COOKIE_NAME || "authToken", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours to match JWT expiration
    });

    console.log(
      `✅ User logged in: ${user.name} (${user.email}) as ${user.role}`
    );

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      data: safe,
      role: user.role,
    });
  } catch (err) {
    console.error("Login error:", err);
    next(err);
  }
};
// Google OAuth login
export const googleAuth = async (req, res, next) => {
  try {
    const { token, role = 'patient' } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google token is required",
      });
    }

    // Verify Google token
    const googleVerification = await verifyGoogleToken(token);
    
    if (!googleVerification.success) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google token",
        error: googleVerification.error,
      });
    }

    const { googleId, email, name, picture, emailVerified } = googleVerification.data;

    if (!emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email with Google first",
      });
    }

    // Check if user already exists in any collection
    let existingUser =
      (await User.findOne({ email })) ||
      (await Doctor.findOne({ email })) ||
      (await Admin.findOne({ email }));

    let user;

    if (existingUser) {
      // User exists - always use their existing role, ignore selected role
      console.log(`🔍 Existing user ${email} found with role: ${existingUser.role}`);
      console.log(`📝 Selected role: ${role} - but will use existing role: ${existingUser.role}`);
      
      // Always use existing user - no role changes allowed
      // Update existing user with Google info if needed
      if (!existingUser.googleId) {
        const Model = existingUser.role === 'doctor' ? Doctor : 
                    existingUser.role === 'admin' ? Admin : User;
        
        await Model.updateOne(
          { _id: existingUser._id },
          { 
            googleId,
            photo: existingUser.photo || picture,
            isGoogleUser: true,
            emailVerified: true,
          },
          { runValidators: false }
        );
      }
      
      // Always use existing user with their original role
      user = existingUser;
      console.log(`✅ Existing user logged in with original role: ${existingUser.role}`);
    } else {
      // Create new user with Google data
      const Model = role === 'doctor' ? Doctor : 
                   role === 'admin' ? Admin : User;

      const userData = {
        name,
        email,
        googleId,
        photo: picture,
        role: role.toLowerCase(),
        gender: 'other', // Default gender for Google users
        isGoogleUser: true,
        emailVerified: true,
      };

      // For doctors and admins, we might need additional verification
      if (role === 'doctor') {
        userData.isApproved = 'pending'; // Require manual approval
      }

      user = new Model(userData);
      await user.save();

      console.log(`✅ New Google ${role} registered: ${name} (${email})`);
    }

    // Update lastLogin for admin users
    if (user.role === "admin") {
      try {
        await Admin.updateOne(
          { _id: user._id },
          { lastLogin: new Date() },
          { runValidators: false }
        );
      } catch (updateError) {
        console.warn("Could not update admin lastLogin:", updateError.message);
      }
    }

    const jwtToken = generateToken(user);
    const { password: _pwd, ...safeUser } = user.toObject ? user.toObject() : user._doc;

    // Set secure cookie
    res.cookie(process.env.COOKIE_NAME || "authToken", jwtToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    console.log(`✅ Google user logged in: ${user.name} (${user.email}) as ${user.role}`);

    return res.status(200).json({
      success: true,
      message: `Welcome ${existingUser ? 'back' : ''}, ${user.name}!`,
      token: jwtToken,
      data: safeUser,
      role: user.role,
      isNewUser: !existingUser,
    });

  } catch (err) {
    console.error("Google auth error:", err);
    next(err);
  }
};

// Logout function
export const logout = async (req, res) => {
  try {
    // Clear the auth cookie
    res.clearCookie(process.env.COOKIE_NAME || "authToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Error during logout",
    });
  }
};