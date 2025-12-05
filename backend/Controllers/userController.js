import User from "../models/UserSchema.js";
import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";
import mongoose from "mongoose";

export const updateUser = async (req, res) => {
  const id = req.params.id;
  try {
    const updateUser = await User.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    if (!updateUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Successfully updated",
      data: updateUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update",
      error: error.message, // Include error message in the response
    });
  }
};

// Controllers/userController.js
export const deleteUser = async (req, res) => {
  const id = req.params.id;

  try {
    // 1️⃣ Delete the user directly
    const deletedUser = await User.findByIdAndDelete(id);

    // 2️⃣ If no user found, handle it gracefully
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3️⃣ Respond with success message (no need to send deleted data)
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    // 4️⃣ Catch DB or casting errors
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

export const getSingleUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id).select("-password");
    res.status(200).json({
      success: true,
      message: "User Found",
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "Failed to find user",
    });
  }
};

export const getAllUsers = async (req, res) => {
  const id = req.params.id;
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({
      success: true,
      message: "Users Found",
      data: users,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "No users found",
    });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { password, ...rest } = user._doc;

    res.status(200).json({
      success: true,
      message: "Profile info is getting",
      data: { ...rest },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Someting went wrong, cannot get this",
    });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Find all doctors who have appointments for this user
    const doctors = await Doctor.find({
      "appointments.patientId": userId
    }).select("-password");

    // Extract appointments for this specific user with doctor info
    const userAppointments = [];
    
    doctors.forEach(doctor => {
      const userAppts = doctor.appointments.filter(apt => 
        apt.patientId && apt.patientId.toString() === userId.toString()
      );
      
      userAppts.forEach(appointment => {
        userAppointments.push({
          _id: appointment._id,
          doctorName: doctor.name,
          doctorPhoto: doctor.photo,
          doctorSpecialization: doctor.specialization,
          doctorId: doctor._id,
          patientName: appointment.patientName,
          status: appointment.status || 'pending',
          payment: appointment.payment || 'pending',
          price: appointment.price,
          bookedOn: appointment.bookedOn,
          testName: appointment.testName,
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime,
          notes: appointment.notes,
          prescription: appointment.prescription,
          createdAt: appointment.createdAt || doctor.createdAt,
          updatedAt: appointment.updatedAt || doctor.updatedAt
        });
      });
    });

    // If no appointments found in doctor records, check bookings as fallback
    if (userAppointments.length === 0) {
      const bookings = await Booking.find({ user: userId });
      const doctorIds = bookings.map((el) => el.doctor);
      const fallbackDoctors = await Doctor.find({ _id: { $in: doctorIds } }).select("-password");
      
      // Return doctors for backward compatibility if no specific appointments found
      return res.status(200).json({
        success: true,
        message: "Appointments are getting",
        data: fallbackDoctors,
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointments are getting",
      data: userAppointments,
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong, cannot get appointments",
    });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { doctorId, ...appointmentData } = req.body;
    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: "This Doctor is not available now",
      });
    }

    // Get user info for better appointment data
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    
    const appointment = {
      patientId: new mongoose.Types.ObjectId(req.userId), // Ensure proper ObjectId
      patientName: appointmentData.patientName || user.name || "Unknown Patient",
      patientGender: appointmentData.patientGender || user.gender || "other",
      payment: appointmentData.payment || "pending",
      price: appointmentData.price || doctor.ticketPrice?.toString() || "100",
      bookedOn: appointmentData.bookedOn || new Date().toLocaleDateString("en-US", { 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      }),
      testName: appointmentData.testName || "General Consultation",
      testResult: appointmentData.testResult || null,
      status: "pending",
      appointmentDate: appointmentData.appointmentDate || new Date(),
      appointmentTime: appointmentData.appointmentTime || "Not specified",
      notes: appointmentData.notes || "",
    };
    
    console.log("Creating appointment with data:", appointment);
    
    doctor.appointments.push(appointment);
    await doctor.save();
    
    return res.status(200).json({
      success: true,
      data: appointment,
      message: "Appointment booking completed successfully",
    });
  } catch (error) {
    console.error("Create appointment error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update appointment status (for doctors)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { doctorId, appointmentId } = req.params;
    const { status, payment, notes, prescription } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const appointment = doctor.appointments.id(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Update appointment fields
    if (status) appointment.status = status;
    if (payment) appointment.payment = payment;
    if (notes) appointment.notes = notes;
    if (prescription) appointment.prescription = prescription;

    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Update appointment error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
