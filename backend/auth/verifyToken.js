// backend/auth/verifyToken.js
import jwt from "jsonwebtoken";
import Doctor from "../models/DoctorSchema.js";
import User from "../models/UserSchema.js";
import Admin from "../models/AdminSchema.js";

export const authenticate = async (req, res, next) => {
  const cookieName = process.env.COOKIE_NAME || "authToken";

  const fromCookie = req.cookies?.[cookieName];
  const fromHeader = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  // Prioritize Authorization header over cookie for better consistency with localStorage
  const token = fromHeader || fromCookie;

  console.log("🔍 Authentication check:", {
    hasCookie: !!fromCookie,
    hasHeader: !!fromHeader,
    hasToken: !!token,
    cookieName,
    url: req.url,
    tokenPreview: token ? token.substring(0, 20) + "..." : "none"
  });

  if (!token) {
    console.log("❌ No token found");
    return res.status(401).json({ success: false, message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.role = decoded.role;

    console.log("✅ Token decoded:", { userId: req.userId, role: req.role });

    // Optional expiry check (jwt.verify already throws on expired)
    // if (decoded.exp < Date.now()/1000) return res.status(401).json({ message: "Token is expired" });

    if (req.role === "doctor") {
      const doctor = await Doctor.findById(req.userId);
      if (!doctor) {
        console.log("❌ Doctor not found in database");
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }
      req.doctorId = doctor._id;
      console.log("✅ Doctor found and doctorId set");
    }

    next();
  } catch (error) {
    console.log("❌ Token verification failed:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export const restrict = (roles) => async (req, res, next) => {
  try {
    console.log("🔒 Role restriction check:", { 
      userId: req.userId, 
      tokenRole: req.role, 
      requiredRoles: roles 
    });

    // Search across all user collections (User, Doctor, Admin)
    const userFromUser = await User.findById(req.userId);
    const userFromDoctor = await Doctor.findById(req.userId);
    const userFromAdmin = await Admin.findById(req.userId);
    
    console.log("👤 User lookup results:", {
      foundInUser: !!userFromUser,
      foundInDoctor: !!userFromDoctor,
      foundInAdmin: !!userFromAdmin,
      userRole: userFromUser?.role,
      doctorRole: userFromDoctor?.role,
      adminRole: userFromAdmin?.role
    });

    const user = userFromUser || userFromDoctor || userFromAdmin;
    
    if (!user) {
      console.log("❌ User not found in any collection");
      return res.status(403).json({ success: false, message: "User not found" });
    }

    if (!roles.includes(user.role)) {
      console.log("❌ Role mismatch:", { userRole: user.role, requiredRoles: roles });
      return res.status(403).json({ success: false, message: "Insufficient permissions" });
    }

    console.log("✅ Role check passed:", { userRole: user.role });
    next();
  } catch (error) {
    console.log("❌ Role restriction error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid user ID" });
  }
};
