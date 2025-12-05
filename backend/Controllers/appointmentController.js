import Doctor from "../models/DoctorSchema.js";
import User from "../models/UserSchema.js";
import Booking from "../models/BookingSchema.js";
import { sendAppointmentCompletionEmail, sendAppointmentConfirmationEmail } from "../utils/emailService.js";

// Complete an appointment with prescription and send email
export const completeAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.userId; // Doctor completing the appointment
    
    const {
      diagnosis,
      prescription,
      testResults,
      notes,
      followUpDate,
      status = 'completed'
    } = req.body;

    console.log('🔍 Completing appointment:', {
      appointmentId,
      doctorId,
      hasPresciption: !!prescription,
      hasDiagnosis: !!diagnosis
    });

    // Find the doctor and the specific appointment
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    // Find the appointment in doctor's appointments array
    const appointmentIndex = doctor.appointments.findIndex(
      apt => apt._id.toString() === appointmentId
    );

    if (appointmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    const appointment = doctor.appointments[appointmentIndex];

    // Check if appointment is already completed
    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: "Appointment is already completed"
      });
    }

    // Get patient information
    const patient = await User.findById(appointment.patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // Update appointment with completion details
    doctor.appointments[appointmentIndex] = {
      ...appointment.toObject(),
      status: 'completed',
      diagnosis: diagnosis || appointment.diagnosis,
      prescription: prescription || appointment.prescription,
      testResults: testResults || appointment.testResults,
      notes: notes || appointment.notes,
      followUpDate: followUpDate ? new Date(followUpDate) : appointment.followUpDate,
      completedAt: new Date(),
      completedBy: doctorId
    };

    await doctor.save();

    // Also update the booking status if it exists
    const booking = await Booking.findOne({
      doctor: doctorId,
      user: appointment.patientId,
      status: { $in: ['confirmed', 'approved'] }
    });

    if (booking) {
      booking.status = 'completed';
      booking.completedAt = new Date();
      await booking.save();
    }

    console.log('✅ Appointment marked as completed');

    // Prepare email data
    const emailData = {
      patientEmail: patient.email,
      patientName: patient.name,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization,
      appointmentDate: appointment.appointmentDate || appointment.bookedOn,
      appointmentTime: appointment.appointmentTime,
      diagnosis: diagnosis,
      prescription: prescription,
      testResults: testResults,
      notes: notes,
      followUpDate: followUpDate
    };

    // Send completion email to patient
    let emailResult = null;
    if (patient.email) {
      try {
        emailResult = await sendAppointmentCompletionEmail(emailData);
        console.log('📧 Email sending result:', emailResult);
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        // Don't fail the appointment completion if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: "Appointment completed successfully",
      data: {
        appointmentId: appointmentId,
        status: 'completed',
        completedAt: new Date(),
        patient: {
          name: patient.name,
          email: patient.email
        },
        doctor: {
          name: doctor.name,
          specialization: doctor.specialization
        },
        emailSent: emailResult?.success || false,
        emailMessage: emailResult?.message
      }
    });

  } catch (error) {
    console.error('💥 Error completing appointment:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error while completing appointment",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get appointment details for completion form
export const getAppointmentForCompletion = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.userId;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const appointment = doctor.appointments.find(
      apt => apt._id.toString() === appointmentId
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Get patient details
    const patient = await User.findById(appointment.patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        appointment: {
          _id: appointment._id,
          patientName: appointment.patientName || patient.name,
          patientEmail: patient.email,
          patientGender: appointment.patientGender || patient.gender,
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime,
          status: appointment.status,
          notes: appointment.notes,
          prescription: appointment.prescription,
          diagnosis: appointment.diagnosis,
          testResults: appointment.testResults,
          followUpDate: appointment.followUpDate
        },
        patient: {
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          gender: patient.gender,
          age: patient.age
        },
        doctor: {
          _id: doctor._id,
          name: doctor.name,
          specialization: doctor.specialization
        }
      }
    });

  } catch (error) {
    console.error('💥 Error getting appointment details:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching appointment details"
    });
  }
};

// Update appointment prescription/notes (for partial updates)
export const updateAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.userId;
    
    const {
      diagnosis,
      prescription,
      testResults,
      notes,
      followUpDate
    } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const appointmentIndex = doctor.appointments.findIndex(
      apt => apt._id.toString() === appointmentId
    );

    if (appointmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Update only provided fields
    const appointment = doctor.appointments[appointmentIndex];
    
    if (diagnosis !== undefined) appointment.diagnosis = diagnosis;
    if (prescription !== undefined) appointment.prescription = prescription;
    if (testResults !== undefined) appointment.testResults = testResults;
    if (notes !== undefined) appointment.notes = notes;
    if (followUpDate !== undefined) appointment.followUpDate = new Date(followUpDate);
    
    appointment.updatedAt = new Date();

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Appointment details updated successfully",
      data: {
        appointmentId: appointmentId,
        updatedFields: {
          diagnosis: appointment.diagnosis,
          prescription: appointment.prescription,
          testResults: appointment.testResults,
          notes: appointment.notes,
          followUpDate: appointment.followUpDate
        }
      }
    });

  } catch (error) {
    console.error('💥 Error updating appointment details:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating appointment details"
    });
  }
};

// Send appointment confirmation email (when appointment is booked)
export const sendConfirmationEmail = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.userId;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const appointment = doctor.appointments.find(
      apt => apt._id.toString() === appointmentId
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    const patient = await User.findById(appointment.patientId);
    if (!patient || !patient.email) {
      return res.status(404).json({
        success: false,
        message: "Patient email not found"
      });
    }

    const emailData = {
      patientEmail: patient.email,
      patientName: patient.name,
      doctorName: doctor.name,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime
    };

    const emailResult = await sendAppointmentConfirmationEmail(emailData);

    res.status(200).json({
      success: true,
      message: "Confirmation email sent successfully",
      data: {
        emailSent: emailResult.success,
        emailMessage: emailResult.message
      }
    });

  } catch (error) {
    console.error('💥 Error sending confirmation email:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error while sending confirmation email"
    });
  }
};

// Get all completed appointments for a doctor (with email history)
export const getCompletedAppointments = async (req, res) => {
  try {
    const doctorId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    // Filter completed appointments
    const completedAppointments = doctor.appointments.filter(
      apt => apt.status === 'completed'
    );

    // Sort by completion date (most recent first)
    completedAppointments.sort((a, b) => 
      new Date(b.completedAt || b.updatedAt) - new Date(a.completedAt || a.updatedAt)
    );

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedAppointments = completedAppointments.slice(startIndex, endIndex);

    // Get patient details for each appointment
    const appointmentsWithPatients = await Promise.all(
      paginatedAppointments.map(async (appointment) => {
        const patient = await User.findById(appointment.patientId);
        return {
          ...appointment.toObject(),
          patient: patient ? {
            name: patient.name,
            email: patient.email,
            phone: patient.phone
          } : null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        appointments: appointmentsWithPatients,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(completedAppointments.length / limit),
          totalAppointments: completedAppointments.length,
          hasNext: endIndex < completedAppointments.length,
          hasPrev: startIndex > 0
        }
      }
    });

  } catch (error) {
    console.error('💥 Error getting completed appointments:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching completed appointments"
    });
  }
};

export default {
  completeAppointment,
  getAppointmentForCompletion,
  updateAppointmentDetails,
  sendConfirmationEmail,
  getCompletedAppointments
};