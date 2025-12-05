import Doctor from "../models/DoctorSchema.js";
import User from "../models/UserSchema.js";
import { sendAppointmentCompletionEmail } from "../utils/emailService.js";

export const updateDoctor = async (req, res) => {
  const id = req.params.id;
  const currentUserId = req.userId; // From authenticate middleware

  console.log("🔍 updateDoctor called");
  console.log("URL param id:", id);
  console.log("Current user ID:", currentUserId);
  console.log("User role:", req.role);

  // Security check: doctors can only update their own profile
  if (id !== currentUserId.toString()) {
    console.log(
      "❌ Security violation: Doctor trying to update different profile"
    );
    return res.status(403).json({
      success: false,
      message: "You can only update your own profile",
    });
  }

  try {
    const updateDoctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    if (!updateDoctor) {
      console.log("❌ Doctor not found for update");
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    console.log("✅ Doctor updated successfully");
    res.status(200).json({
      success: true,
      message: "Successfully updated",
      data: updateDoctor,
    });
  } catch (error) {
    console.error("Error updating Doctor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update doctor",
      error: error.message,
    });
  }
};

export const deleteDoctor = async (req, res) => {
  const id = req.params.id;
  try {
    const deleted = await Doctor.findByIdAndDelete(id); // ← actually delete
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Successfully deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete" });
  }
};

export const getSingleDoctor = async (req, res) => {
  const id = req.params.id;
  try {
    const doctor = await Doctor.findById(id)
      .populate("reviews")
      .select("-password");
    res.status(200).json({
      success: true,
      message: "Doctor Found",
      data: doctor,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "Failed to find Doctor",
    });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const { query = "" } = req.query;

    // base filter: only approved doctors
    const filter = { isApproved: "approved" };

    if (query && query.trim()) {
      const rx = new RegExp(query.trim(), "i");
      // regex-based OR search; works without a text index too
      filter.$or = [{ name: rx }, { specialization: rx }];
      // If you prefer text search (requires text index above), use:
      // filter.$text = { $search: query.trim() };
    }

    const doctors = await Doctor.find(filter).select("-password");
    return res.status(200).json({
      success: true,
      message: "Doctors Found",
      data: doctors,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
};

export const getDoctorProfile = async (req, res) => {
  console.log("🔍 getDoctorProfile called");
  console.log("req.userId:", req.userId);
  console.log("req.doctorId:", req.doctorId);
  console.log("req.role:", req.role);

  const doctorId = req.doctorId || req.userId;
  console.log("Using doctorId:", doctorId);

  try {
    const doctor = await Doctor.findById(doctorId).select("-password");
    console.log("Doctor found:", doctor ? "YES" : "NO");

    if (!doctor) {
      console.log("❌ Doctor not found in database");
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    const appointments = doctor.appointments || [];

    // Calculate statistics
    const stats = {
      total: appointments.length,
      pending: appointments.filter((apt) => apt.status === "pending").length,
      confirmed: appointments.filter((apt) => apt.status === "confirmed")
        .length,
      completed: appointments.filter((apt) => apt.status === "completed")
        .length,
      cancelled: appointments.filter((apt) => apt.status === "cancelled")
        .length,
      paidAppointments: appointments.filter(
        (apt) => apt.payment === "completed"
      ).length,
      pendingPayments: appointments.filter((apt) => apt.payment === "pending")
        .length,
    };

    return res.status(200).json({
      success: true,
      message: "Profile info retrieved successfully",
      data: {
        ...doctor._doc,
        appointments,
        appointmentStats: stats,
      },
    });
  } catch (error) {
    console.error("Get doctor profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, cannot get profile",
    });
  }
};

// Update appointment status by doctor with step-wise validation
export const updateDoctorAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const {
      status,
      payment,
      notes,
      prescription,
      appointmentDate,
      appointmentTime,
    } = req.body;
    const doctorId = req.doctorId || req.userId;

    console.log("🔍 ===== APPOINTMENT UPDATE STARTED =====");
    console.log("🔍 Updating appointment:", appointmentId);
    console.log("🔍 Update data:", req.body);
    console.log("🔍 Status being set to:", status);
    console.log("🔍 Doctor ID:", doctorId);
    console.log("🔍 Request headers:", req.headers.authorization ? 'Token present' : 'No token');
    console.log("🔍 User role:", req.role);
    console.log("🔍 User ID:", req.userId);

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

    // Step-wise status validation
    if (status) {
      const currentStatus = appointment.status;
      
      // Validate step-wise status transitions
      if (currentStatus === "pending" && status !== "confirmed") {
        return res.status(400).json({
          success: false,
          message: "Pending appointments can only be updated to 'confirmed' status",
        });
      }
      
      if (currentStatus === "confirmed" && status !== "completed") {
        return res.status(400).json({
          success: false,
          message: "Confirmed appointments can only be updated to 'completed' status",
        });
      }
      
      if (currentStatus === "completed") {
        return res.status(400).json({
          success: false,
          message: "Completed appointments cannot be modified",
        });
      }

      // Cancelled status is not allowed
      if (status === "cancelled") {
        return res.status(400).json({
          success: false,
          message: "Cancelled status is not allowed. Use step-wise updates: pending → confirmed → completed",
        });
      }
    }

    // Prepare update fields
    const updateFields = {};
    if (status) updateFields["appointments.$.status"] = status;
    if (payment) updateFields["appointments.$.payment"] = payment;
    if (notes) updateFields["appointments.$.notes"] = notes;
    if (prescription) updateFields["appointments.$.prescription"] = prescription;
    
    // Only allow date/time updates for pending appointments
    if (appointment.status === "pending") {
      if (appointmentDate) {
        updateFields["appointments.$.appointmentDate"] = new Date(appointmentDate);
      }
      if (appointmentTime) {
        updateFields["appointments.$.appointmentTime"] = appointmentTime;
      }
    } else if ((appointmentDate || appointmentTime) && appointment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Date and time can only be updated for pending appointments",
      });
    }

    const result = await Doctor.findOneAndUpdate(
      {
        _id: doctorId,
        "appointments._id": appointmentId,
      },
      {
        $set: updateFields,
      },
      {
        new: true,
        runValidators: false,
      }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Failed to update appointment",
      });
    }

    // Find the updated appointment to return
    const updatedAppointment = result.appointments.id(appointmentId);

    // Send email notification when appointment is completed
    let emailResult = null;
    if (status === 'completed') {
      console.log('📧 ===== EMAIL SENDING STARTED =====');
      console.log('📧 Appointment marked as completed, sending email...');
      
      // Get patient email from User collection using patientId
      let patientEmail = updatedAppointment.patientEmail;
      
      if (!patientEmail && updatedAppointment.patientId) {
        try {
          console.log('🔍 Fetching patient email from User collection...');
          const patient = await User.findById(updatedAppointment.patientId).select('email name');
          if (patient && patient.email) {
            patientEmail = patient.email;
            console.log('✅ Found patient email:', patientEmail);
            console.log('✅ Patient name from User:', patient.name);
          } else {
            console.log('❌ Patient not found or no email available');
          }
        } catch (userError) {
          console.error('❌ Error fetching patient data:', userError);
        }
      }
      
      // Prepare email data
      const emailData = {
        patientName: updatedAppointment.patientName || 'Patient',
        patientEmail: patientEmail,
        doctorName: doctor.name,
        appointmentDate: updatedAppointment.appointmentDate || new Date(),
        appointmentTime: updatedAppointment.appointmentTime || 'Not specified',
        prescription: updatedAppointment.prescription || null,
        notes: updatedAppointment.notes || null,
        clinicName: 'AI MedLab'
      };

      console.log('📧 Email data prepared:', {
        patientName: emailData.patientName,
        patientEmail: emailData.patientEmail,
        doctorName: emailData.doctorName,
        hasPrescription: !!emailData.prescription,
        hasNotes: !!emailData.notes
      });

      // Send email if patient email exists
      if (patientEmail && patientEmail.trim() !== '') {
        try {
          console.log('📧 Attempting to send completion email to:', patientEmail);
          emailResult = await sendAppointmentCompletionEmail(emailData);
          console.log('📧 Email sending result:', emailResult);
          
          if (emailResult.success) {
            console.log('✅ COMPLETION EMAIL SENT SUCCESSFULLY!');
            console.log('📧 Message ID:', emailResult.messageId);
          } else {
            console.log('❌ Email sending failed:', emailResult.error);
          }
        } catch (emailError) {
          console.error('❌ Email sending error:', emailError);
          emailResult = { success: false, error: emailError.message };
        }
      } else {
        console.log('⚠️ No patient email found, cannot send completion email');
        console.log('🔍 Patient ID:', updatedAppointment.patientId);
        console.log('🔍 Patient Email from appointment:', updatedAppointment.patientEmail);
        emailResult = { success: false, error: 'No patient email available' };
      }
      
      console.log('📧 ===== EMAIL SENDING COMPLETED =====');
    }

    // Log status progression
    if (status === 'confirmed') {
      console.log('✅ Appointment confirmed - ready for completion');
    } else if (status === 'completed') {
      console.log('✅ Appointment completed successfully');
      if (emailResult && emailResult.success) {
        console.log('📧 Completion email sent successfully');
      }
    }

    console.log("✅ Appointment updated successfully");

    return res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: updatedAppointment,
      emailSent: emailResult ? emailResult.success : false,
      emailMessage: emailResult ? emailResult.message : null
    });
  } catch (error) {
    console.error("Update doctor appointment error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get doctor's appointments with filtering and enhanced data
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.doctorId || req.userId;
    const { status, date, limit = 50, page = 1 } = req.query;

    const doctor = await Doctor.findById(doctorId).select("appointments name");
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    let appointments = doctor.appointments || [];
    console.log(
      `📋 Found ${appointments.length} total appointments for doctor ${doctor.name}`
    );

    // Filter by status if provided
    if (status && status !== "all") {
      appointments = appointments.filter((apt) => apt.status === status);
      console.log(
        `🔍 Filtered to ${appointments.length} appointments with status: ${status}`
      );
    }

    // Filter by date if provided
    if (date) {
      const filterDate = new Date(date);
      appointments = appointments.filter((apt) => {
        const aptDate = new Date(apt.bookedOn);
        return aptDate.toDateString() === filterDate.toDateString();
      });
      console.log(
        `📅 Filtered to ${appointments.length} appointments for date: ${date}`
      );
    }

    // Sort by creation date (newest first)
    appointments.sort(
      (a, b) =>
        new Date(b.createdAt || b.appointmentDate) -
        new Date(a.createdAt || a.appointmentDate)
    );

    // Calculate pagination
    const totalAppointments = appointments.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedAppointments = appointments.slice(startIndex, endIndex);

    // Calculate comprehensive statistics
    const allAppointments = doctor.appointments || [];
    const stats = {
      total: allAppointments.length,
      pending: allAppointments.filter((apt) => apt.status === "pending").length,
      confirmed: allAppointments.filter((apt) => apt.status === "confirmed")
        .length,
      completed: allAppointments.filter((apt) => apt.status === "completed")
        .length,
      cancelled: allAppointments.filter((apt) => apt.status === "cancelled")
        .length,
      paidAppointments: allAppointments.filter(
        (apt) => apt.payment === "completed"
      ).length,
      pendingPayments: allAppointments.filter(
        (apt) => apt.payment === "pending"
      ).length,
      failedPayments: allAppointments.filter((apt) => apt.payment === "failed")
        .length,
      todayAppointments: allAppointments.filter((apt) => {
        const today = new Date().toDateString();
        const aptDate = new Date(apt.bookedOn).toDateString();
        return aptDate === today;
      }).length,
    };

    console.log(
      `✅ Returning ${paginatedAppointments.length} appointments (page ${page})`
    );

    return res.status(200).json({
      success: true,
      message: "Appointments retrieved successfully",
      data: paginatedAppointments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalAppointments / parseInt(limit)),
        totalItems: totalAppointments,
        itemsPerPage: parseInt(limit),
        hasNextPage: endIndex < totalAppointments,
        hasPrevPage: parseInt(page) > 1,
      },
      stats,
    });
  } catch (error) {
    console.error("Get doctor appointments error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Delete appointment by doctor
export const deleteDoctorAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.userId; // Use req.userId directly since it's set by authenticate middleware

    console.log("Delete appointment request:", { appointmentId, doctorId });

    // Validate appointmentId format
    if (!appointmentId || !appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID format",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    console.log(
      "Doctor found, appointments count:",
      doctor.appointments.length
    );

    const appointmentIndex = doctor.appointments.findIndex(
      (apt) => apt._id && apt._id.toString() === appointmentId
    );

    if (appointmentIndex === -1) {
      console.log("Appointment not found in doctor's appointments");
      return res.status(404).json({
        success: false,
        message:
          "Appointment not found or you don't have permission to delete it",
      });
    }

    const appointmentToDelete = doctor.appointments[appointmentIndex];
    console.log(
      "Found appointment to delete:",
      appointmentToDelete.patientName
    );

    // Remove appointment from array
    doctor.appointments.splice(appointmentIndex, 1);
    await doctor.save();

    console.log("Appointment deleted successfully");

    return res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
      data: {
        deletedAppointment: appointmentToDelete,
        remainingAppointments: doctor.appointments.length,
      },
    });
  } catch (error) {
    console.error("Delete doctor appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete appointment: " + error.message,
    });
  }
};

// Get single appointment details
export const getSingleAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.doctorId || req.userId;

    const doctor = await Doctor.findById(doctorId).select("appointments name");
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

    return res.status(200).json({
      success: true,
      message: "Appointment retrieved successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Get single appointment error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Bulk update appointments
export const bulkUpdateAppointments = async (req, res) => {
  try {
    const { appointmentIds, updateData } = req.body;
    const doctorId = req.doctorId || req.userId;

    if (
      !appointmentIds ||
      !Array.isArray(appointmentIds) ||
      appointmentIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid appointment IDs",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    let updatedCount = 0;
    appointmentIds.forEach((appointmentId) => {
      const appointment = doctor.appointments.id(appointmentId);
      if (appointment) {
        // Update appointment fields
        if (updateData.status) appointment.status = updateData.status;
        if (updateData.payment) appointment.payment = updateData.payment;
        if (updateData.notes) appointment.notes = updateData.notes;
        if (updateData.appointmentTime)
          appointment.appointmentTime = updateData.appointmentTime;
        updatedCount++;
      }
    });

    await doctor.save();

    return res.status(200).json({
      success: true,
      message: `${updatedCount} appointments updated successfully`,
      updatedCount,
    });
  } catch (error) {
    console.error("Bulk update appointments error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Schedule appointment time
export const scheduleAppointmentTime = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { appointmentDate, appointmentTime, notes } = req.body;
    const doctorId = req.doctorId || req.userId;

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

    // Update appointment scheduling
    if (appointmentDate)
      appointment.appointmentDate = new Date(appointmentDate);
    if (appointmentTime) appointment.appointmentTime = appointmentTime;
    if (notes) appointment.notes = notes;

    // Update status to confirmed if it was pending
    if (appointment.status === "pending") {
      appointment.status = "confirmed";
    }

    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Appointment scheduled successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Schedule appointment error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get appointment statistics for dashboard
export const getAppointmentDashboard = async (req, res) => {
  try {
    const doctorId = req.doctorId || req.userId;

    const doctor = await Doctor.findById(doctorId).select("appointments name");
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const appointments = doctor.appointments || [];
    const today = new Date();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Calculate comprehensive statistics
    const stats = {
      total: appointments.length,
      pending: appointments.filter((apt) => apt.status === "pending").length,
      confirmed: appointments.filter((apt) => apt.status === "confirmed")
        .length,
      completed: appointments.filter((apt) => apt.status === "completed")
        .length,
      cancelled: appointments.filter((apt) => apt.status === "cancelled")
        .length,

      // Payment statistics
      paidAppointments: appointments.filter(
        (apt) => apt.payment === "completed"
      ).length,
      pendingPayments: appointments.filter((apt) => apt.payment === "pending")
        .length,
      failedPayments: appointments.filter((apt) => apt.payment === "failed")
        .length,

      // Time-based statistics
      todayAppointments: appointments.filter((apt) => {
        const aptDate = new Date(apt.bookedOn);
        return aptDate.toDateString() === new Date().toDateString();
      }).length,

      weeklyAppointments: appointments.filter((apt) => {
        const aptDate = new Date(apt.bookedOn);
        return aptDate >= startOfWeek;
      }).length,

      monthlyAppointments: appointments.filter((apt) => {
        const aptDate = new Date(apt.bookedOn);
        return aptDate >= startOfMonth;
      }).length,

      // Revenue statistics
      totalRevenue: appointments
        .filter((apt) => apt.payment === "completed")
        .reduce((sum, apt) => sum + (parseFloat(apt.price) || 0), 0),

      pendingRevenue: appointments
        .filter((apt) => apt.payment === "pending")
        .reduce((sum, apt) => sum + (parseFloat(apt.price) || 0), 0),
    };

    // Recent appointments (last 5)
    const recentAppointments = appointments
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.appointmentDate) -
          new Date(a.createdAt || a.appointmentDate)
      )
      .slice(0, 5);

    // Upcoming appointments (next 5 confirmed)
    const upcomingAppointments = appointments
      .filter(
        (apt) =>
          apt.status === "confirmed" &&
          new Date(apt.appointmentDate) > new Date()
      )
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: {
        stats,
        recentAppointments,
        upcomingAppointments,
        doctorName: doctor.name,
      },
    });
  } catch (error) {
    console.error("Get appointment dashboard error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Email notification functionality has been removed from the system
export const testEmailNotification = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Email notifications have been disabled',
    data: {
      emailSent: false,
      emailMessage: 'Email service has been removed from the system'
    }
  });
};