import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Admin from "../models/AdminSchema.js";
import Booking from "../models/BookingSchema.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({
      success: true,
      message: "Users Found",
      data: users,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "No Users found",
    });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const id = req.params.id;
    // Log received user ID
    console.log("Received User ID:", id);

    const deletedUser = await User.findByIdAndDelete(id); // Find and delete user by ID
    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
export const deleteDoctorById = async (req, res) => {
  try {
    const id = req.params.id;
    // Log received user ID
    console.log("Received User ID:", id);

    const deletedUser = await Doctor.findByIdAndDelete(id); // Find and delete user by ID
    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).select("-password");
    res.status(200).json({
      success: true,
      message: "Doctors Found",
      data: doctors,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "No Doctors found",
    });
  }
};
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({});

    res.status(200).json({
      counts: bookings.length,
      success: true,
      message: "Bookings Found",
      data: bookings,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "No Bookings Found",
    });
  }
};

export const updateDoctorApprovalStatus = async (req, res) => {
  const { id } = req.params;
  const { isApproved } = req.body;

  if (!["pending", "approved", "cancelled"].includes(isApproved)) {
    return res.status(400).json({ message: "Invalid approval status" });
  }

  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.isApproved = isApproved;
    await doctor.save();

    res
      .status(200)
      .json({ message: "Approval status updated successfully", doctor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// Admin-specific functions
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}).select("-password");
    res.status(200).json({
      success: true,
      message: "Admins Found",
      data: admins,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "No Admins found",
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { email, password, name, phone, photo, permissions } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, password, and name are required" 
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false, 
        message: "Admin already exists" 
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const admin = new Admin({ 
      name, 
      email, 
      password: hash, 
      phone, 
      photo, 
      permissions: permissions || ["manage_users", "manage_doctors", "manage_bookings", "view_analytics"]
    });
    
    await admin.save();

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: { ...admin.toObject(), password: undefined }
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};

export const updateAdminById = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, phone, photo, permissions, isActive } = req.body;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { name, phone, photo, permissions, isActive, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedAdmin) {
      return res.status(404).json({ 
        success: false, 
        message: "Admin not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: updatedAdmin
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};

export const deleteAdminById = async (req, res) => {
  try {
    const id = req.params.id;
    
    const deletedAdmin = await Admin.findByIdAndDelete(id);
    if (!deletedAdmin) {
      return res.status(404).json({ 
        success: false, 
        message: "Admin not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const doctorCount = await Doctor.countDocuments();
    const adminCount = await Admin.countDocuments();
    const bookingCount = await Booking.countDocuments();
    
    const approvedDoctors = await Doctor.countDocuments({ isApproved: "approved" });
    const pendingDoctors = await Doctor.countDocuments({ isApproved: "pending" });

    res.status(200).json({
      success: true,
      message: "Stats retrieved successfully",
      data: {
        users: userCount,
        doctors: doctorCount,
        admins: adminCount,
        bookings: bookingCount,
        approvedDoctors,
        pendingDoctors
      }
    });
  } catch (error) {
    console.error("Error getting admin stats:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};